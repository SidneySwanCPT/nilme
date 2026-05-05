// ============================================
// Camp 8 — Signal Ingest
// POST /api/signal-ingest
//
// The EC2 signal processor calls this endpoint when it detects a new
// data point for an athlete (new offer scraped, ranking change,
// social-follower jump, news mention, etc.). The function:
//   1. Validates service-key auth.
//   2. Stores the raw signal in `signal_events`.
//   3. Optionally triggers a re-score by calling the local score.js
//      function (so every signal-driven change generates a fresh
//      score calculation + plain-English explanation).
//
// Batch mode: send { events: [ {...}, {...} ] } to ingest many at once.
//
// Required env:
//   SUPABASE_URL, SUPABASE_SERVICE_KEY
//   CAMP8_SCORE_URL — absolute URL of score.js (defaults to same site)
// ============================================

const { createClient } = require('@supabase/supabase-js');

const ALLOWED_TYPES = new Set([
  'offer_received', 'offer_updated',
  'combine_update', 'combine_verified',
  'social_jump', 'social_update',
  'ranking_change', 'star_change',
  'news_mention', 'news_commitment',
  'camp_registered', 'camp_attended',
  'academic_update', 'verification_granted',
  'admin_note'
]);

exports.handler = async (event) => {
  const headers = {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, X-Service-Key',
    'Access-Control-Allow-Methods': 'POST, OPTIONS'
  };
  if (event.httpMethod === 'OPTIONS') return { statusCode: 204, headers, body: '' };
  if (event.httpMethod !== 'POST') return { statusCode: 405, headers, body: JSON.stringify({ error: 'Method not allowed' }) };

  const SUPABASE_URL = process.env.SUPABASE_URL;
  const SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY;
  if (!SUPABASE_URL || !SERVICE_KEY) {
    return { statusCode: 500, headers, body: JSON.stringify({ error: 'Server misconfigured' }) };
  }

  // Service-key auth — this endpoint is for EC2 + admin tooling, not browsers.
  const serviceHeader = event.headers['x-service-key'] || event.headers['X-Service-Key'];
  if (serviceHeader !== SERVICE_KEY) {
    return { statusCode: 401, headers, body: JSON.stringify({ error: 'Service key required.' }) };
  }

  let body;
  try { body = JSON.parse(event.body || '{}'); }
  catch { return { statusCode: 400, headers, body: JSON.stringify({ error: 'Invalid JSON' }) }; }

  const events = Array.isArray(body.events) ? body.events : [body];
  if (!events.length) return { statusCode: 400, headers, body: JSON.stringify({ error: 'No events provided' }) };

  const sb = createClient(SUPABASE_URL, SERVICE_KEY, { auth: { persistSession: false } });

  // Validate + insert
  const toInsert = [];
  const errors = [];
  for (const e of events) {
    if (!e.athlete_id) { errors.push({ event: e, error: 'athlete_id required' }); continue; }
    if (!e.signal_type || !ALLOWED_TYPES.has(e.signal_type)) { errors.push({ event: e, error: 'Invalid signal_type' }); continue; }
    toInsert.push({
      athlete_id: e.athlete_id,
      signal_type: e.signal_type,
      payload: e.payload || null,
      source: e.source || 'ec2',
      observed_at: e.observed_at ? new Date(e.observed_at).toISOString() : new Date().toISOString()
    });
  }
  if (!toInsert.length) {
    return { statusCode: 400, headers, body: JSON.stringify({ error: 'No valid events', errors }) };
  }

  const { data: inserted, error: insErr } = await sb.from('signal_events').insert(toInsert).select();
  if (insErr) return { statusCode: 500, headers, body: JSON.stringify({ error: insErr.message }) };

  // Which athletes need a fresh score calc?
  const triggerRecalc = body.recalculate !== false; // default on
  const affectedAthletes = Array.from(new Set(inserted.map(r => r.athlete_id)));
  const recalcResults = [];

  if (triggerRecalc) {
    const scoreUrl = process.env.CAMP8_SCORE_URL || deriveScoreUrl(event);
    for (const athleteId of affectedAthletes) {
      try {
        const res = await fetch(scoreUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'X-Service-Key': SERVICE_KEY },
          body: JSON.stringify({ athlete_id: athleteId, trigger_source: 'signal-ingest' })
        });
        const r = await res.json();
        if (res.ok && r.score_calc_id) {
          recalcResults.push({ athlete_id: athleteId, score: r.score, score_calc_id: r.score_calc_id });
          // Link the signal_events to the triggering score_calc for audit trail
          await sb.from('signal_events')
            .update({ processed_at: new Date().toISOString(), score_calc_id: r.score_calc_id })
            .eq('athlete_id', athleteId)
            .is('processed_at', null);
        } else {
          recalcResults.push({ athlete_id: athleteId, error: r.error || 'score call failed' });
        }
      } catch (err) {
        recalcResults.push({ athlete_id: athleteId, error: err.message });
      }
    }
  }

  return {
    statusCode: 200,
    headers,
    body: JSON.stringify({
      ingested: inserted.length,
      validation_errors: errors,
      recalculated: recalcResults
    })
  };
};

function deriveScoreUrl(event) {
  // Prefer an explicit env override. Otherwise compose from the request host.
  const host = event.headers.host || event.headers.Host;
  const proto = event.headers['x-forwarded-proto'] || 'https';
  if (host) return `${proto}://${host}/.netlify/functions/score`;
  return 'http://localhost:8888/.netlify/functions/score';
}
