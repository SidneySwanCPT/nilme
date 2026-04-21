// ============================================
// Camp 8 — Pattern Detection
// Scheduled weekly by netlify.toml ([functions.pattern-detect] schedule).
//
// Analyzes the last 30 days of signal_events + score_calculations and
// proposes changes to the formula — stored in `detected_patterns` with
// status='pending' for admin review in admin.html. A detected pattern
// is NEVER auto-applied; an admin must approve it.
//
// Patterns detected in this baseline version:
//   1. signal_outcome_correlation — which signal types precede the
//      largest positive score deltas (and which precede negative ones).
//   2. factor_decay — factors that have drifted steadily downward
//      across all athletes (suggests formula re-weighting).
//   3. modifier_opportunity — segments where a bucket of athletes has
//      unusually high/low scores vs peers (suggests a new modifier).
//
// This job is designed to be additive: new pattern detectors can be
// added without touching the plumbing. Each detector returns an array
// of pattern rows.
// ============================================

const { createClient } = require('@supabase/supabase-js');
const crypto = require('crypto');

exports.handler = async () => {
  const SUPABASE_URL = process.env.SUPABASE_URL;
  const SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY;
  if (!SUPABASE_URL || !SERVICE_KEY) {
    return { statusCode: 500, body: JSON.stringify({ error: 'Server misconfigured' }) };
  }
  const sb = createClient(SUPABASE_URL, SERVICE_KEY, { auth: { persistSession: false } });

  const runId = crypto.randomUUID();
  const sinceIso = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();

  // Pull the data window once; detectors share it.
  const [signalsRes, calcsRes, athletesRes] = await Promise.all([
    sb.from('signal_events').select('*').gte('observed_at', sinceIso),
    sb.from('score_calculations').select('*').gte('created_at', sinceIso),
    sb.from('athletes').select('id, position, state, graduation_year')
  ]);

  const signals = signalsRes.data || [];
  const calcs = (calcsRes.data || []).sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
  const athletes = athletesRes.data || [];

  const patterns = [];
  patterns.push(...detectSignalOutcomeCorrelation(signals, calcs));
  patterns.push(...detectFactorDecay(calcs));
  patterns.push(...detectModifierOpportunity(calcs, athletes));

  if (!patterns.length) {
    return { statusCode: 200, body: JSON.stringify({ run_id: runId, detected: 0, note: 'No patterns surfaced this run.' }) };
  }

  // Insert as 'pending' so an admin can review before anything is applied.
  const rows = patterns.map(p => ({ ...p, run_id: runId, status: 'pending' }));
  const { data: inserted, error } = await sb.from('detected_patterns').insert(rows).select();
  if (error) return { statusCode: 500, body: JSON.stringify({ error: error.message }) };

  return { statusCode: 200, body: JSON.stringify({ run_id: runId, detected: inserted.length }) };
};

// ============================================
// Detector 1 — signal → outcome correlation
// For each signal_type, compute avg score delta in the 7 days AFTER the signal.
// ============================================
function detectSignalOutcomeCorrelation(signals, calcs) {
  const byAthlete = groupBy(calcs, c => c.athlete_id);
  const byType = groupBy(signals, s => s.signal_type);
  const out = [];

  for (const [type, evts] of Object.entries(byType)) {
    const deltas = [];
    for (const evt of evts) {
      const athleteCalcs = (byAthlete[evt.athlete_id] || []);
      const before = lastBefore(athleteCalcs, evt.observed_at);
      const after = firstAfter(athleteCalcs, evt.observed_at, 7);
      if (before && after) deltas.push(after.score - before.score);
    }
    if (deltas.length < 3) continue;
    const avg = deltas.reduce((s, v) => s + v, 0) / deltas.length;
    const stdev = stdDev(deltas);
    if (Math.abs(avg) < 5) continue; // not a meaningful signal yet
    out.push({
      pattern_type: 'signal_outcome_correlation',
      description: `"${type}" signals are followed by an average score change of ${avg.toFixed(1)} points within 7 days (n=${deltas.length}).`,
      evidence: { n: deltas.length, mean_delta: round(avg, 2), stdev: round(stdev, 2), samples: deltas.slice(0, 10) },
      suggested_change: avg > 0
        ? { action: 'boost_trend', target_factor: null, delta_multiplier: +0.02, reason: `Signal type "${type}" is a leading indicator of score growth.` }
        : { action: 'dampen_trend', target_factor: null, delta_multiplier: -0.02, reason: `Signal type "${type}" is associated with score regression — investigate before reacting.` }
    });
  }
  return out;
}

// ============================================
// Detector 2 — factor decay
// For each factor, look at the population-wide trajectory across recent calcs.
// If >70% of athletes show a declining contribution, flag it.
// ============================================
function detectFactorDecay(calcs) {
  if (calcs.length < 10) return [];
  const byAthlete = groupBy(calcs, c => c.athlete_id);
  const factorKeys = Object.keys((calcs[0] && calcs[0].factor_breakdown) || {});
  const out = [];

  for (const factor of factorKeys) {
    let declining = 0, total = 0;
    for (const list of Object.values(byAthlete)) {
      if (list.length < 2) continue;
      const first = list[0].factor_breakdown && list[0].factor_breakdown[factor];
      const last = list[list.length - 1].factor_breakdown && list[list.length - 1].factor_breakdown[factor];
      if (!first || !last) continue;
      total++;
      if ((last.contribution || 0) < (first.contribution || 0) - 2) declining++;
    }
    if (total < 5) continue;
    const pct = declining / total;
    if (pct >= 0.7) {
      out.push({
        pattern_type: 'factor_decay',
        description: `${factor} contribution declined for ${Math.round(pct * 100)}% of athletes over this window (n=${total}).`,
        evidence: { factor, declining, total, share_declining: round(pct, 2) },
        suggested_change: { action: 'review_factor_weight', target_factor: factor, reason: 'Population-wide decline may indicate scoring ceiling mismatch.' }
      });
    }
  }
  return out;
}

// ============================================
// Detector 3 — modifier opportunity
// Find segments (position × state) whose average score deviates by >40
// from the population mean with n≥5. Suggests a segment-specific modifier.
// ============================================
function detectModifierOpportunity(calcs, athletes) {
  if (calcs.length < 10) return [];
  const athleteMap = new Map(athletes.map(a => [a.id, a]));
  // Latest score per athlete
  const latestByAthlete = {};
  for (const c of calcs) {
    const cur = latestByAthlete[c.athlete_id];
    if (!cur || new Date(c.created_at) > new Date(cur.created_at)) latestByAthlete[c.athlete_id] = c;
  }
  const scored = Object.values(latestByAthlete).map(c => {
    const a = athleteMap.get(c.athlete_id);
    if (!a) return null;
    return { athlete_id: c.athlete_id, score: c.score, position: a.position, state: a.state, class_year: a.graduation_year };
  }).filter(Boolean);
  if (scored.length < 10) return [];

  const popMean = scored.reduce((s, v) => s + v.score, 0) / scored.length;
  const segments = {};
  for (const r of scored) {
    const key = `${r.position || '?'}|${r.state || '?'}`;
    (segments[key] = segments[key] || []).push(r);
  }
  const out = [];
  for (const [key, list] of Object.entries(segments)) {
    if (list.length < 5) continue;
    const mean = list.reduce((s, v) => s + v.score, 0) / list.length;
    const diff = mean - popMean;
    if (Math.abs(diff) < 40) continue;
    const [position, state] = key.split('|');
    out.push({
      pattern_type: 'modifier_opportunity',
      description: `${position} in ${state} score ${diff > 0 ? 'above' : 'below'} population by ${Math.abs(Math.round(diff))} pts (n=${list.length}).`,
      evidence: { n: list.length, segment_mean: round(mean, 1), population_mean: round(popMean, 1), diff: round(diff, 1), segment: { position, state } },
      suggested_change: {
        action: 'propose_modifier',
        segment: { position, state },
        direction: diff > 0 ? 'boost_market' : 'dampen_market',
        reason: `Segment average diverges from population — consider a trend_weight or modifier for this bucket.`
      }
    });
  }
  return out;
}

// ============================================
// Helpers
// ============================================
function groupBy(arr, keyFn) { return arr.reduce((acc, x) => { const k = keyFn(x); (acc[k] = acc[k] || []).push(x); return acc; }, {}); }
function lastBefore(calcs, iso) {
  const t = new Date(iso).getTime();
  let best = null;
  for (const c of calcs) { const ct = new Date(c.created_at).getTime(); if (ct <= t && (!best || ct > new Date(best.created_at).getTime())) best = c; }
  return best;
}
function firstAfter(calcs, iso, daysWindow) {
  const t = new Date(iso).getTime();
  const limit = t + daysWindow * 86400000;
  let best = null;
  for (const c of calcs) { const ct = new Date(c.created_at).getTime(); if (ct > t && ct <= limit && (!best || ct < new Date(best.created_at).getTime())) best = c; }
  return best;
}
function stdDev(arr) { if (arr.length < 2) return 0; const m = arr.reduce((s, v) => s + v, 0) / arr.length; return Math.sqrt(arr.reduce((s, v) => s + (v - m) ** 2, 0) / (arr.length - 1)); }
function round(v, d) { const p = Math.pow(10, d || 0); return Math.round(v * p) / p; }
