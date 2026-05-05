// ============================================
// Camp 8 — Event Reminders
// Scheduled daily at 13:00 UTC (netlify.toml).
//
// For every athlete_calendar row, emits up to three reminder kinds:
//   t_minus_30           — fires when event is 30 days out
//   t_minus_7            — fires when event is 7 days out
//   post_date_results    — fires 1 day after event end when no results logged
//
// Each firing writes an athlete_actions row (which the dashboard's AI
// action plan widget already renders) and records a dedupe row in
// event_reminders so we never double-send.
//
// Uses SUPABASE_SERVICE_KEY — this is a server-only job.
// ============================================

const { createClient } = require('@supabase/supabase-js');

exports.handler = async () => {
  const SUPABASE_URL = process.env.SUPABASE_URL;
  const SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY;
  if (!SUPABASE_URL || !SERVICE_KEY) {
    return { statusCode: 500, body: JSON.stringify({ error: 'Server misconfigured' }) };
  }
  const sb = createClient(SUPABASE_URL, SERVICE_KEY, { auth: { persistSession: false } });

  const today = new Date(); today.setUTCHours(0, 0, 0, 0);
  const in30 = addDays(today, 30), in7 = addDays(today, 7);
  const in30End = addDays(in30, 1), in7End = addDays(in7, 1);
  const pastCutoff = addDays(today, -1); // events that ended at least 1 day ago

  // Fetch candidate events in the next 31 days or past-due without results.
  const upperBound = addDays(today, 32);
  const { data: events, error: evErr } = await sb
    .from('athlete_calendar')
    .select('id, athlete_id, event_type, event_name, event_date, event_end_date, location, results_logged')
    .lte('event_date', upperBound.toISOString().slice(0, 10))
    .gte('event_date', addDays(today, -60).toISOString().slice(0, 10));
  if (evErr) return { statusCode: 500, body: JSON.stringify({ error: evErr.message }) };

  // Fetch existing reminders so we can dedupe.
  const ids = (events || []).map(e => e.id);
  let existing = [];
  if (ids.length) {
    const { data } = await sb.from('event_reminders').select('calendar_id, kind, sent_at').in('calendar_id', ids);
    existing = data || [];
  }
  const sent = new Set(existing.filter(r => r.sent_at).map(r => r.calendar_id + '|' + r.kind));

  const actionsToInsert = [];
  const remindersToInsert = [];

  for (const ev of events || []) {
    const start = new Date(ev.event_date + 'T00:00:00Z');
    const end = ev.event_end_date ? new Date(ev.event_end_date + 'T00:00:00Z') : start;

    // T-30
    if (start >= in30 && start < in30End && !sent.has(ev.id + '|t_minus_30')) {
      actionsToInsert.push(buildActionRow(ev, 't_minus_30'));
      remindersToInsert.push({ calendar_id: ev.id, athlete_id: ev.athlete_id, kind: 't_minus_30', due_at: ev.event_date, sent_at: new Date().toISOString() });
    }
    // T-7
    if (start >= in7 && start < in7End && !sent.has(ev.id + '|t_minus_7')) {
      actionsToInsert.push(buildActionRow(ev, 't_minus_7'));
      remindersToInsert.push({ calendar_id: ev.id, athlete_id: ev.athlete_id, kind: 't_minus_7', due_at: ev.event_date, sent_at: new Date().toISOString() });
    }
    // Post-date results nudge — event ended yesterday or earlier, no results yet
    if (end <= pastCutoff && !ev.results_logged && ['camp','combine','visit','game'].includes(ev.event_type) && !sent.has(ev.id + '|post_date_results')) {
      actionsToInsert.push(buildActionRow(ev, 'post_date_results'));
      remindersToInsert.push({ calendar_id: ev.id, athlete_id: ev.athlete_id, kind: 'post_date_results', due_at: ev.event_date, sent_at: new Date().toISOString() });
    }
  }

  let actionInserts = [];
  if (actionsToInsert.length) {
    const { data, error } = await sb.from('athlete_actions').insert(actionsToInsert).select();
    if (error) return { statusCode: 500, body: JSON.stringify({ error: error.message, stage: 'insert_actions' }) };
    actionInserts = data || [];
    // Link the reminder row back to the created action (first-order pairing).
    actionInserts.forEach((row, i) => { if (remindersToInsert[i]) remindersToInsert[i].action_id = row.id; });
  }
  if (remindersToInsert.length) {
    // Upsert on (calendar_id, kind) so repeated runs don't duplicate.
    const { error } = await sb.from('event_reminders').upsert(remindersToInsert, { onConflict: 'calendar_id,kind' });
    if (error) return { statusCode: 500, body: JSON.stringify({ error: error.message, stage: 'insert_reminders' }) };
  }

  return {
    statusCode: 200,
    body: JSON.stringify({
      events_considered: (events || []).length,
      reminders_fired: remindersToInsert.length,
      actions_created: actionInserts.length
    })
  };
};

function addDays(d, n) { const r = new Date(d); r.setUTCDate(r.getUTCDate() + n); return r; }

function buildActionRow(ev, kind) {
  const common = { athlete_id: ev.athlete_id, source: 'ai', status: 'open', priority: kind === 't_minus_7' ? 1 : 2, related_camp_id: null };
  if (kind === 't_minus_30') {
    return {
      ...common,
      title: `30 days out: prep for ${ev.event_name}`,
      detail: `Your ${ev.event_type} is in 30 days${ev.location ? ' at ' + ev.location : ''}. Time to lock in your training block, update your highlight reel, and email any coaches you want watching.`,
      category: ev.event_type === 'camp' ? 'camp' : ev.event_type === 'visit' ? 'recruiting' : ev.event_type === 'combine' ? 'training' : 'general',
      due_date: ev.event_date
    };
  }
  if (kind === 't_minus_7') {
    return {
      ...common,
      title: `7 days out: final prep for ${ev.event_name}`,
      detail: `Week-of checklist: taper intensity, confirm paperwork, pack your gear bag, dial in your 40 start, and review your intros for each coach.`,
      category: ev.event_type === 'camp' ? 'camp' : ev.event_type === 'visit' ? 'recruiting' : ev.event_type === 'combine' ? 'training' : 'general',
      due_date: ev.event_date
    };
  }
  // post_date_results
  return {
    ...common,
    title: `Log your results from ${ev.event_name}`,
    detail: `How'd it go? Log your numbers and a short debrief — this feeds directly into your Camp 8 score and refreshes your AI action plan.`,
    category: ev.event_type === 'camp' ? 'camp' : ev.event_type,
    due_date: new Date().toISOString().slice(0, 10)
  };
}
