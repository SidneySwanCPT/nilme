// ============================================
// Camp 8 — Scoring Engine
// POST /api/score  { athlete_id?, user_id?, trigger_source? }
//
// Reads formula + modifiers + trend weights from Supabase (NEVER hardcoded),
// computes a deterministic 300–850 score, logs full breakdown, returns
// plain-English explanation and top 3 recommended actions.
//
// Required env:
//   SUPABASE_URL          — project URL
//   SUPABASE_SERVICE_KEY  — service role key (server-only)
//   SUPABASE_ANON_KEY     — anon key, used to verify caller JWT
// ============================================

const { createClient } = require('@supabase/supabase-js');
const crypto = require('crypto');

// Point mapping: raw 0..max_total  →  300..850
const MAPPED_MIN = 300;
const MAPPED_MAX = 850;

// Position measurable targets — used to derive a 0..1 "elite-ness" per metric.
// Format: { height_in: targetInches, weight: targetLbs, forty: targetSeconds,
//           vertical: targetInches }. Lower is better for forty.
const POSITION_TARGETS = {
  QB: { height_in: 75, weight: 210, forty: 4.60, vertical: 33 },
  RB: { height_in: 71, weight: 210, forty: 4.48, vertical: 34 },
  WR: { height_in: 74, weight: 195, forty: 4.48, vertical: 34 },
  TE: { height_in: 76, weight: 240, forty: 4.65, vertical: 32 },
  OL: { height_in: 77, weight: 290, forty: 5.10, vertical: 26 },
  OT: { height_in: 78, weight: 295, forty: 5.15, vertical: 26 },
  OG: { height_in: 76, weight: 300, forty: 5.20, vertical: 25 },
  DL: { height_in: 75, weight: 270, forty: 4.85, vertical: 30 },
  DE: { height_in: 76, weight: 255, forty: 4.75, vertical: 32 },
  LB: { height_in: 74, weight: 225, forty: 4.60, vertical: 33 },
  CB: { height_in: 72, weight: 185, forty: 4.45, vertical: 35 },
  S:  { height_in: 73, weight: 195, forty: 4.48, vertical: 34 },
  K:  { height_in: 71, weight: 180, forty: 4.85, vertical: 28 },
  P:  { height_in: 73, weight: 195, forty: 4.90, vertical: 28 }
};

// Offer tier points
const OFFER_TIER = { FBS: 12, FCS: 7, D2: 4, D3: 2, NAIA: 2, JUCO: 2 };

// ============================================
// Handler
// ============================================
exports.handler = async (event) => {
  const headers = {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Methods': 'POST, OPTIONS'
  };

  if (event.httpMethod === 'OPTIONS') return { statusCode: 204, headers, body: '' };
  if (event.httpMethod !== 'POST') return { statusCode: 405, headers, body: JSON.stringify({ error: 'Method not allowed' }) };

  const SUPABASE_URL = process.env.SUPABASE_URL;
  const SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY;
  const ANON_KEY = process.env.SUPABASE_ANON_KEY;

  if (!SUPABASE_URL || !SERVICE_KEY) {
    return { statusCode: 500, headers, body: JSON.stringify({ error: 'Server misconfigured (SUPABASE_URL/SUPABASE_SERVICE_KEY)' }) };
  }

  let body;
  try { body = JSON.parse(event.body || '{}'); }
  catch { return { statusCode: 400, headers, body: JSON.stringify({ error: 'Invalid JSON' }) }; }

  const triggerSource = body.trigger_source || 'user';

  // ---- Auth: verify the caller ----
  // A service-role caller (EC2 signal processor, scheduled jobs) passes an x-service-key header.
  // End users pass a Supabase JWT in Authorization: Bearer <token>.
  const serviceHeader = event.headers['x-service-key'] || event.headers['X-Service-Key'];
  const isServiceCall = serviceHeader && serviceHeader === SERVICE_KEY;

  let requestUserId = null;
  if (!isServiceCall) {
    const authHeader = event.headers.authorization || event.headers.Authorization || '';
    const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;
    if (!token || !ANON_KEY) {
      return { statusCode: 401, headers, body: JSON.stringify({ error: 'Unauthorized — attach Supabase JWT.' }) };
    }
    const anonClient = createClient(SUPABASE_URL, ANON_KEY);
    const { data: userRes, error: userErr } = await anonClient.auth.getUser(token);
    if (userErr || !userRes || !userRes.user) {
      return { statusCode: 401, headers, body: JSON.stringify({ error: 'Invalid or expired session.' }) };
    }
    requestUserId = userRes.user.id;
  }

  const sb = createClient(SUPABASE_URL, SERVICE_KEY, { auth: { persistSession: false } });

  // ---- Resolve athlete ----
  const { athlete, athleteErr } = await resolveAthlete(sb, body, requestUserId, isServiceCall);
  if (athleteErr) return { statusCode: athleteErr.status, headers, body: JSON.stringify({ error: athleteErr.message }) };

  try {
    const result = await computeAndLog(sb, athlete, triggerSource);
    return { statusCode: 200, headers, body: JSON.stringify(result) };
  } catch (err) {
    console.error('score.js error:', err);
    return { statusCode: 500, headers, body: JSON.stringify({ error: err.message || 'Scoring failed' }) };
  }
};

// ============================================
// Athlete resolution (auth-gated for end users)
// ============================================
async function resolveAthlete(sb, body, requestUserId, isServiceCall) {
  let q = sb.from('athletes').select('*').limit(1);
  if (body.athlete_id) q = q.eq('id', body.athlete_id);
  else if (body.user_id) q = q.eq('user_id', body.user_id);
  else if (requestUserId) q = q.eq('user_id', requestUserId);
  else return { athleteErr: { status: 400, message: 'athlete_id or user_id required' } };

  const { data, error } = await q.maybeSingle();
  if (error) return { athleteErr: { status: 500, message: error.message } };
  if (!data)  return { athleteErr: { status: 404, message: 'Athlete not found' } };

  if (!isServiceCall && data.user_id !== requestUserId) {
    return { athleteErr: { status: 403, message: 'You can only score your own profile.' } };
  }
  return { athlete: data };
}

// ============================================
// Main pipeline
// ============================================
async function computeAndLog(sb, athlete, triggerSource) {
  // 1. Load config (formula, modifiers, trend weights)
  const [formulaRow, factors, modifierRow, modifiers, trends] = await Promise.all([
    sb.from('scoring_formula_versions').select('*').eq('active', true).order('created_at', { ascending: false }).limit(1).maybeSingle().then(r => r.data),
    sb.from('scoring_factors').select('*').then(r => r.data || []),
    sb.from('scoring_modifier_versions').select('*').eq('active', true).order('created_at', { ascending: false }).limit(1).maybeSingle().then(r => r.data),
    sb.from('scoring_modifiers').select('*').eq('active', true).then(r => r.data || []),
    sb.from('trend_weights').select('*').then(r => r.data || [])
  ]);

  if (!formulaRow) throw new Error('No active formula version — seed scoring_formula_versions.');
  if (!modifierRow) throw new Error('No active modifier version — seed scoring_modifier_versions.');

  const activeFormula = formulaRow.version;
  const activeModifierSet = modifierRow.version;
  const factorsForFormula = factors.filter(f => f.formula_version === activeFormula).sort((a, b) => a.sort_order - b.sort_order);
  const modifiersForSet = modifiers.filter(m => m.modifier_version === activeModifierSet)
    .sort((a, b) => a.priority - b.priority);

  // 2. Pull supporting data in parallel
  const [combineRes, nilRes, offersRes, starredRes, snapshotsRes] = await Promise.all([
    sb.from('athlete_combine_scores').select('*').eq('athlete_id', athlete.id).order('created_at', { ascending: false }).limit(5),
    sb.from('athlete_nil_scores').select('*').eq('athlete_id', athlete.id).order('created_at', { ascending: false }).limit(5),
    sb.from('athlete_offers').select('*').eq('athlete_id', athlete.id),
    sb.from('athlete_starred_camps').select('*').eq('athlete_id', athlete.id),
    sb.from('athlete_rating_snapshots').select('*').eq('athlete_id', athlete.id).order('created_at', { ascending: false }).limit(5)
  ]);
  const combineHistory = combineRes.data || [];
  const nilHistory = nilRes.data || [];
  const offers = offersRes.data || [];
  const starredCamps = starredRes.data || [];
  const snapshots = snapshotsRes.data || [];

  // 3. Compute profile context (for modifier triggers + factor calcs)
  const ctx = buildProfileContext(athlete, combineHistory, nilHistory, offers, starredCamps);

  // 4. Raw factor scores (0..max_points each)
  const rawFactors = {
    measurables: scoreMeasurables(athlete, combineHistory, ctx),
    production:  scoreProduction(athlete),
    offers:      scoreOffers(offers),
    trajectory:  scoreTrajectory(combineHistory, nilHistory, snapshots),
    academics:   scoreAcademics(athlete),
    competition: scoreCompetition(athlete),
    camps:       scoreCamps(starredCamps),
    social:      scoreSocial(athlete, ctx)
  };
  // Clamp each to [0, max_points]
  const factorBreakdown = {};
  factorsForFormula.forEach(f => {
    const raw = clamp(rawFactors[f.key] || 0, 0, f.max_points);
    factorBreakdown[f.key] = { label: f.label, raw: round(raw, 2), max: f.max_points, modified: raw, modifiers: [], trend_multiplier: 1 };
  });

  // 5. Apply modifiers — each adjusts specific factor weights and/or applies confidence discount
  const appliedModifiers = [];
  let confidenceMultiplier = 1;
  for (const mod of modifiersForSet) {
    if (!evalTrigger(mod.trigger_expr, ctx)) continue;
    appliedModifiers.push({
      key: mod.key,
      label: mod.label,
      weight_adjustments: mod.weight_adjustments || {},
      confidence_multiplier: mod.confidence_multiplier
    });
    Object.entries(mod.weight_adjustments || {}).forEach(([k, mult]) => {
      if (factorBreakdown[k]) {
        factorBreakdown[k].modified = factorBreakdown[k].modified * Number(mult);
        factorBreakdown[k].modifiers.push({ key: mod.key, multiplier: Number(mult) });
      }
    });
    if (mod.confidence_multiplier != null) confidenceMultiplier *= Number(mod.confidence_multiplier);
  }

  // 6. Apply trend multipliers (market signals)
  const appliedTrends = [];
  for (const t of trends) {
    if (t.target_factor && !factorBreakdown[t.target_factor]) continue;
    if (!trendApplies(t.scope, ctx)) continue;
    const mult = Number(t.multiplier) || 1;
    if (mult === 1) continue;
    appliedTrends.push({ key: t.key, label: t.label, factor: t.target_factor, multiplier: mult });
    if (t.target_factor) {
      factorBreakdown[t.target_factor].modified *= mult;
      factorBreakdown[t.target_factor].trend_multiplier *= mult;
    } else {
      // global multiplier
      Object.keys(factorBreakdown).forEach(k => { factorBreakdown[k].modified *= mult; factorBreakdown[k].trend_multiplier *= mult; });
    }
  }

  // 7. Clamp each modified factor back to its max (a factor can't exceed its cap even with trends)
  Object.keys(factorBreakdown).forEach(k => {
    factorBreakdown[k].contribution = round(clamp(factorBreakdown[k].modified, 0, factorBreakdown[k].max), 2);
  });

  // 8. Sum + confidence discount
  const maxTotal = factorsForFormula.reduce((s, f) => s + f.max_points, 0);
  let rawPoints = Object.values(factorBreakdown).reduce((s, f) => s + f.contribution, 0);
  rawPoints = rawPoints * confidenceMultiplier;
  rawPoints = clamp(rawPoints, 0, maxTotal);

  // 9. Map to 300–850
  const score = Math.round(MAPPED_MIN + (rawPoints / maxTotal) * (MAPPED_MAX - MAPPED_MIN));

  // 10. Explanation, drivers, holdbacks, top 3 actions
  const drivers = topDrivers(factorBreakdown, 3);
  const holdbacks = topHoldbacks(factorBreakdown, 3);
  const actions = recommendActions(holdbacks, athlete, ctx, factorBreakdown, appliedModifiers);
  const explanation = buildExplanation({ score, grade: scoreToGrade(score), drivers, holdbacks, appliedModifiers, appliedTrends, confidenceMultiplier });

  // 11. Deterministic inputs hash
  const inputsHash = hashInputs({
    formula_version: activeFormula,
    modifier_version: activeModifierSet,
    trend_snapshot: trends.map(t => ({ key: t.key, m: t.multiplier, scope: t.scope, factor: t.target_factor })),
    ctx, rawFactors
  });

  // 12. Log calculation
  const nowIso = new Date().toISOString();
  const { data: logged, error: logErr } = await sb.from('score_calculations').insert({
    athlete_id: athlete.id,
    score, raw_points: round(rawPoints, 2), max_points: maxTotal,
    formula_version: activeFormula, modifier_version: activeModifierSet,
    trend_snapshot_ts: nowIso,
    factor_breakdown: factorBreakdown,
    applied_modifiers: appliedModifiers,
    applied_trends: appliedTrends,
    what_drives_up: drivers,
    what_holds_back: holdbacks,
    top_3_actions: actions,
    explanation,
    inputs_hash: inputsHash,
    trigger_source: triggerSource
  }).select().single();

  if (logErr) throw new Error('Failed to log calculation: ' + logErr.message);

  return {
    score_calc_id: logged.id,
    score, grade: scoreToGrade(score),
    raw_points: round(rawPoints, 2), max_points: maxTotal,
    formula_version: activeFormula, modifier_version: activeModifierSet,
    factor_breakdown: factorBreakdown,
    applied_modifiers: appliedModifiers,
    applied_trends: appliedTrends,
    what_drives_up: drivers,
    what_holds_back: holdbacks,
    top_3_actions: actions,
    explanation,
    inputs_hash: inputsHash,
    timestamp: nowIso
  };
}

// ============================================
// Profile context — inputs for modifier triggers + calcs
// ============================================
function buildProfileContext(athlete, combineHistory, nilHistory, offers, starredCamps) {
  const latestCombine = combineHistory[0] || {};
  const latestNil = nilHistory[0] || {};

  const measurablesPercentile = computeMeasurablesPercentile(athlete, latestCombine);
  const social = (Number(athlete.instagram_followers) || 0)
    + (Number(athlete.twitter_followers) || 0)
    + (Number(athlete.tiktok_followers) || 0);

  const verified = (athlete.verified_badge === 'maxpreps' || athlete.verified_badge === 'admin' || athlete.stats_mode === 'maxpreps_verified') ? 'verified' : 'unverified';

  return {
    athlete_id: athlete.id,
    position: String(athlete.position || '').toUpperCase(),
    state: String(athlete.state || '').toUpperCase(),
    city: athlete.city || '',
    class_year: Number(athlete.graduation_year) || null,
    height_in: heightToInches(athlete.height),
    weight: Number(athlete.weight) || 0,
    forty: Number(athlete.forty_time) || Number(latestCombine.forty) || null,
    vertical: Number(athlete.vertical) || Number(latestCombine.vertical) || null,
    gpa: Number(athlete.gpa) || 0,
    sat: Number(athlete.sat_score) || 0,
    act: Number(athlete.act_score) || 0,
    stars: Number(athlete.stars || athlete.star_rating) || 0,
    offers_count: offers.length,
    offers_fbs: offers.filter(o => String(o.division).toUpperCase() === 'FBS').length,
    social_followers_total: social,
    nil_score_latest: Number(latestNil.score) || 0,
    measurables_percentile: measurablesPercentile,
    verification: verified,
    // Rural proxy — city_population unavailable in current schema; use RURAL_CITIES allowlist fallback.
    city_population: estimateCityPopulation(athlete.city, athlete.state),
    starred_camps_count: starredCamps.length,
    camps_attended: parseAttendedCount(athlete.camps_attended)
  };
}

// Very rough city-population estimator — replace with a real lookup when available.
// Under 50k means "rural" for modifier purposes.
function estimateCityPopulation(city, state) {
  if (!city) return 999999;
  const BIG = { 'Atlanta':500000, 'Athens':127000, 'Augusta':202000, 'Savannah':147000, 'Macon':153000, 'Columbus':206000, 'Marietta':63000, 'Alpharetta':66000, 'Gainesville':44000, 'Buford':17000, 'Roswell':94000, 'Duluth':31000, 'Kennesaw':34000, 'Dallas':1300000, 'Houston':2300000, 'Austin':980000, 'Miami':470000, 'Jacksonville':950000, 'Tampa':400000, 'Orlando':310000, 'Los Angeles':4000000, 'San Diego':1400000 };
  const key = String(city).trim();
  return BIG[key] || 30000; // default assumes small city unless we know otherwise
}

function heightToInches(h) {
  if (!h) return 0;
  const s = String(h).replace(/"/g, '').trim();
  // Accepts 6-2, 6'2, 6'2", 74
  if (/^\d+$/.test(s)) return parseInt(s, 10);
  const m = s.match(/(\d+)[^\d]+(\d+)/);
  if (m) return parseInt(m[1], 10) * 12 + parseInt(m[2], 10);
  return 0;
}

function computeMeasurablesPercentile(athlete, latestCombine) {
  const pos = String(athlete.position || '').toUpperCase();
  const target = POSITION_TARGETS[pos];
  if (!target) return 50;
  const h  = heightToInches(athlete.height);
  const w  = Number(athlete.weight) || 0;
  const f  = Number(athlete.forty_time) || Number(latestCombine.forty) || 0;
  const v  = Number(athlete.vertical) || Number(latestCombine.vertical) || 0;
  const scores = [];
  if (h) scores.push(ratioToPct(h / target.height_in));
  if (w) scores.push(ratioToPct(w / target.weight));
  if (f) scores.push(ratioToPct(target.forty / f)); // lower = better
  if (v) scores.push(ratioToPct(v / target.vertical));
  if (!scores.length) return 50;
  return Math.round(scores.reduce((s, x) => s + x, 0) / scores.length);
}

function ratioToPct(r) {
  // r=1.00 → 50; r=1.10 → ~90; r=1.20 → 99; r=0.90 → ~10
  const v = 50 + (r - 1) * 400;
  return clamp(Math.round(v), 1, 99);
}

function parseAttendedCount(txt) { if (!txt) return 0; return (String(txt).match(/,/g) || []).length + 1; }

// ============================================
// Factor calculations
// ============================================
function scoreMeasurables(athlete, combine, ctx) {
  // Base: percentile out of 100 → scaled to 120 max, with stars bonus
  const pctPts = (ctx.measurables_percentile / 100) * 100;
  const starsBonus = Math.min(20, (ctx.stars || 0) * 4);
  return pctPts + starsBonus;
}

function scoreProduction(athlete) {
  if (athlete.maxpreps_data && athlete.maxpreps_data.stats) {
    // Prefer verified. Attribute 100 to verified baseline + quality bump.
    const stats = athlete.maxpreps_data.stats || {};
    const bulk = Object.values(stats).reduce((s, v) => s + (Number(String(v).replace(/[^\d.]/g,'')) || 0), 0);
    return 100 + Math.min(20, bulk / 2000); // verified baseline + stats scale
  }
  if (athlete.manual_stats) return 75; // self-reported baseline
  return 55; // no stats on file
}

function scoreOffers(offers) {
  let pts = 0;
  offers.forEach(o => {
    const div = String(o.division || '').toUpperCase();
    pts += OFFER_TIER[div] || 2;
    if (o.status === 'Committed') pts += 4;
  });
  return pts;
}

function scoreTrajectory(combineHistory, nilHistory, snapshots) {
  const series = [];
  if (snapshots.length >= 2) series.push(snapshots[0].overall - snapshots[snapshots.length - 1].overall);
  if (nilHistory.length >= 2) series.push(nilHistory[0].score - nilHistory[nilHistory.length - 1].score);
  if (combineHistory.length >= 2 && combineHistory[0].forty && combineHistory[combineHistory.length - 1].forty) {
    series.push((combineHistory[combineHistory.length - 1].forty - combineHistory[0].forty) * 50); // faster = positive
  }
  if (!series.length) return 45; // neutral baseline (50% of 90)
  const avg = series.reduce((s, v) => s + v, 0) / series.length;
  // avg of ~+10 per window = +27 pts; clamp
  return clamp(45 + avg * 2.7, 0, 90);
}

function scoreAcademics(athlete) {
  let pts = 0;
  const gpa = Number(athlete.gpa) || 0;
  pts += Math.min(50, gpa * 12.5); // 4.0 → 50
  if (athlete.sat_score) pts += Math.min(20, (Number(athlete.sat_score) - 1000) / 20);
  if (athlete.act_score) pts += Math.min(15, (Number(athlete.act_score) - 18) * 1.5);
  if (athlete.ncaa_eligibility === 'qualifier') pts += 10;
  return clamp(pts, 0, 80);
}

function scoreCompetition(athlete) {
  // Strength proxy by state + FBS offer presence + stars
  const state = String(athlete.state || '').toUpperCase();
  const strongStates = { GA:50, FL:55, TX:55, CA:50, AL:48, LA:46, MS:44, OH:42 };
  let pts = strongStates[state] || 32;
  if (Number(athlete.stars) >= 4) pts += 15;
  else if (Number(athlete.stars) === 3) pts += 8;
  return clamp(pts, 0, 80);
}

function scoreCamps(starred) {
  let pts = 0;
  starred.forEach(c => {
    const base = c.camp_tier === 1 ? 22 : c.camp_tier === 2 ? 13 : 7;
    const mult = c.status === 'attended' ? 1 : c.status === 'registered' ? 0.85 : c.status === 'planning' ? 0.55 : 0.35;
    pts += base * mult;
  });
  return clamp(pts, 0, 80);
}

function scoreSocial(athlete, ctx) {
  const total = ctx.social_followers_total || 0;
  // log scale: 1k→15, 10k→45, 50k→70, 100k→80
  const pts = total <= 0 ? 0 : Math.min(80, 10 + Math.log10(total) * 15);
  return pts;
}

// ============================================
// Modifier DSL — supports leaves + { all:[], any:[] }
// ============================================
function evalTrigger(expr, ctx) {
  if (!expr) return false;
  if (expr.all) return expr.all.every(e => evalTrigger(e, ctx));
  if (expr.any) return expr.any.some(e => evalTrigger(e, ctx));
  if (!expr.field) return false;
  const val = ctx[expr.field];
  const ref = expr.value;
  switch (expr.op) {
    case 'eq':  return val == ref;
    case 'ne':  return val != ref;
    case 'gt':  return Number(val) >  Number(ref);
    case 'gte': return Number(val) >= Number(ref);
    case 'lt':  return Number(val) <  Number(ref);
    case 'lte': return Number(val) <= Number(ref);
    case 'in':  return Array.isArray(ref) && ref.includes(val);
    default:    return false;
  }
}

// ============================================
// Trend scope matching
// ============================================
function trendApplies(scope, ctx) {
  if (!scope) return true;
  for (const k of Object.keys(scope)) {
    const allowed = scope[k];
    if (!Array.isArray(allowed) || !allowed.length) continue;
    const val = ctx[k];
    if (!allowed.map(String).map(s => s.toUpperCase()).includes(String(val).toUpperCase())) return false;
  }
  return true;
}

// ============================================
// Drivers / holdbacks / actions / explanation
// ============================================
function topDrivers(breakdown, n) {
  return Object.entries(breakdown)
    .map(([k, v]) => ({ factor: k, label: v.label, points: v.contribution, of_max: v.max, pct_of_max: Math.round((v.contribution / v.max) * 100) }))
    .filter(r => r.pct_of_max >= 60)
    .sort((a, b) => b.pct_of_max - a.pct_of_max)
    .slice(0, n);
}

function topHoldbacks(breakdown, n) {
  return Object.entries(breakdown)
    .map(([k, v]) => ({ factor: k, label: v.label, points: v.contribution, of_max: v.max, gap: v.max - v.contribution, pct_of_max: Math.round((v.contribution / v.max) * 100) }))
    .sort((a, b) => b.gap - a.gap)
    .slice(0, n);
}

function recommendActions(holdbacks, athlete, ctx, breakdown, appliedModifiers) {
  const suggestions = {
    social:      { title: 'Build social footprint to 10k+ followers',
                   rationale: 'Social is your lowest contributor — brands index on reach. Post weekly training clips, one highlight reel per week, and engage after big games.' },
    camps:       { title: 'Attend one more Elite or Showcase camp',
                   rationale: 'Camps accelerate offer velocity. An Elite tier camp can add ~22 points; Showcase adds ~13.' },
    offers:      { title: 'Convert interest into written offers',
                   rationale: 'Email the 3 schools showing most interest with updated film + recent combine PRs. Ask directly where you stand.' },
    academics:   { title: 'Bank a stronger SAT/ACT score',
                   rationale: 'Every 100 SAT pts = ~5 academic points. Grinding a test prep cycle raises NCAA eligibility margin.' },
    production:  { title: 'Verify stats on MaxPreps',
                   rationale: 'Verified production is worth ~100 pts vs 55 unverified. Claim your profile and publish the season stat sheet.' },
    measurables: { title: 'Re-test at a verified combine',
                   rationale: 'A verified sub-4.60 or 34"+ vert pushes percentile above 90 — triggers the Elite Measurables modifier.' },
    trajectory:  { title: 'Log a new combine result in the next 6 weeks',
                   rationale: 'Trajectory rewards improvement. A fresh PR plotted against your last snapshot bumps this factor.' },
    competition: { title: 'Schedule a 7v7 or camp against top regional teams',
                   rationale: 'Exposure vs higher classifications raises competition context, especially outside Georgia.' }
  };
  return holdbacks.slice(0, 3).map(h => {
    const s = suggestions[h.factor] || { title: 'Improve ' + h.label, rationale: 'Work on ' + h.label.toLowerCase() + ' to close the gap.' };
    return {
      factor: h.factor, title: s.title, rationale: s.rationale,
      projected_uplift_points: Math.round(h.gap * 0.35)
    };
  });
}

function buildExplanation({ score, grade, drivers, holdbacks, appliedModifiers, appliedTrends, confidenceMultiplier }) {
  const parts = [];
  parts.push(`Your Camp 8 score is **${score} (${grade})**.`);
  if (drivers.length) {
    parts.push(`**Driving this score:** ${drivers.map(d => `${d.label} at ${d.pct_of_max}% of max`).join(', ')}.`);
  }
  if (holdbacks.length) {
    parts.push(`**Holding you back:** ${holdbacks.slice(0, 2).map(h => `${h.label} (${h.pct_of_max}% of max)`).join(' and ')}.`);
  }
  if (appliedModifiers.length) {
    parts.push(`**Profile modifiers applied:** ${appliedModifiers.map(m => m.label).join('; ')}.`);
  }
  if (appliedTrends.length) {
    parts.push(`**Market trends this cycle:** ${appliedTrends.map(t => `${t.label} (×${t.multiplier})`).slice(0, 3).join(', ')}.`);
  }
  if (confidenceMultiplier !== 1) {
    parts.push(`**Confidence discount:** ×${confidenceMultiplier.toFixed(2)} because some inputs are self-reported — verifying them will lift your score.`);
  }
  return parts.join(' ');
}

// ============================================
// Utilities
// ============================================
function clamp(v, lo, hi) { return Math.min(hi, Math.max(lo, v)); }
function round(v, d) { const p = Math.pow(10, d || 0); return Math.round(v * p) / p; }
function scoreToGrade(s) {
  if (s >= 800) return 'A+';
  if (s >= 760) return 'A';
  if (s >= 720) return 'A-';
  if (s >= 680) return 'B+';
  if (s >= 640) return 'B';
  if (s >= 600) return 'B-';
  if (s >= 560) return 'C+';
  if (s >= 520) return 'C';
  if (s >= 460) return 'D+';
  return 'D';
}

function hashInputs(obj) {
  return crypto.createHash('sha256').update(canonicalJSON(obj)).digest('hex');
}
function canonicalJSON(v) {
  if (v === null || typeof v !== 'object') return JSON.stringify(v);
  if (Array.isArray(v)) return '[' + v.map(canonicalJSON).join(',') + ']';
  const keys = Object.keys(v).sort();
  return '{' + keys.map(k => JSON.stringify(k) + ':' + canonicalJSON(v[k])).join(',') + '}';
}
