// ============================================
// Camp 8 — Dashboard Widgets
// Self-contained modules for the redesigned dashboard:
//   C8.calendar      — camps calendar (month + side list + detail popup + AI prep)
//   C8.nilBars       — NIL rating history bar graph + projection
//   C8.radar         — Camp 8 grade 8-factor spider chart
//   C8.actionPlan    — AI action plan list (complete / snooze / ask)
//   C8.dashChat      — floating context-aware chat
// ============================================

(function(global) {
  'use strict';

  // ---------- helpers ----------
  function esc(s) { var d = document.createElement('div'); d.textContent = String(s == null ? '' : s); return d.innerHTML; }
  function parseCampStart(datesStr) {
    if (!datesStr) return null;
    var first = String(datesStr).split(/[–\-]/)[0].trim();
    var d = new Date(first);
    return isNaN(d.getTime()) ? null : d;
  }
  function sameDay(a, b) { return a && b && a.getFullYear()===b.getFullYear() && a.getMonth()===b.getMonth() && a.getDate()===b.getDate(); }
  function daysBetween(a, b) { return Math.round((b - a) / 86400000); }
  function fmt(d, opts) { return d.toLocaleDateString('en-US', opts || { month:'short', day:'numeric', year:'numeric' }); }

  // ===========================================================
  // 1) UNIFIED CALENDAR (camps + visits + combines + games + practices + goals)
  //    Data source: athlete_calendar rows. Handlers come in via opts.
  // ===========================================================
  var TYPE_STYLE = {
    camp:     { color: '#d4a843', label: 'Camp',     icon: '🏕️' },
    visit:    { color: '#4a90d9', label: 'Visit',    icon: '🏛️' },
    combine:  { color: '#50c878', label: 'Combine',  icon: '⚡'  },
    goal:     { color: '#a050c8', label: 'Goal',     icon: '🎯'  },
    game:     { color: '#c41e3a', label: 'Game',     icon: '🏈'  },
    practice: { color: '#5bc0be', label: 'Practice', icon: '💪'  }
  };
  var CAL_STATE = {
    monthOffset: 0,
    events: [],
    handlers: {}, // { onAdd, onRemove, onShare, onLogResults, onTogglePrepItem, onAskAI, onOpenDetail }
    agendaMode: false
  };

  function calendar_render(root, events, opts) {
    CAL_STATE.events = Array.isArray(events) ? events.slice() : [];
    CAL_STATE.handlers = opts || {};
    CAL_STATE.monthOffset = 0;
    if (!root) return;

    root.innerHTML =
      '<div class="c8cal">' +
        '<div class="c8cal-main">' +
          '<div class="c8cal-head">' +
            '<button class="c8cal-nav" data-c8cal-nav="-1" aria-label="Previous month">‹</button>' +
            '<div class="c8cal-title" id="c8calTitle"></div>' +
            '<button class="c8cal-nav" data-c8cal-nav="1" aria-label="Next month">›</button>' +
            '<button class="c8cal-today" data-c8cal-nav="today">Today</button>' +
            '<button class="c8cal-add-btn" data-c8cal-action="open-add">+ Add Event</button>' +
          '</div>' +
          '<div class="c8cal-legend">' +
            Object.entries(TYPE_STYLE).map(function(ent) {
              return '<span class="c8cal-legend-chip"><i style="background:' + ent[1].color + '"></i>' + ent[1].label + '</span>';
            }).join('') +
          '</div>' +
          '<div class="c8cal-dow">' + ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'].map(function(d){ return '<div>'+d+'</div>'; }).join('') + '</div>' +
          '<div class="c8cal-grid" id="c8calGrid"></div>' +
          '<div class="c8cal-agenda" id="c8calAgenda" aria-hidden="true"></div>' +
        '</div>' +
        '<aside class="c8cal-side" id="c8calSide">' +
          '<div class="c8cal-side-head">' +
            '<div class="c8cal-side-title">Next 30 days</div>' +
            '<button class="c8cal-side-close" data-c8cal-action="close-side" aria-label="Close">✕</button>' +
          '</div>' +
          '<div class="c8cal-side-list" id="c8calSideList"></div>' +
        '</aside>' +
        '<button class="c8cal-side-toggle" data-c8cal-action="open-side" aria-label="Upcoming events">Upcoming ›</button>' +
      '</div>' +
      '<div class="c8cal-detail" id="c8calDetail" aria-hidden="true"></div>' +
      '<div class="c8cal-modal" id="c8calModal" aria-hidden="true"></div>';

    if (!root._c8calBound) {
      root.addEventListener('click', calendar_clickDelegate);
      calendar_attachSwipe(root);
      root._c8calBound = true;
    }
    calendar_paint();
  }

  function calendar_attachSwipe(root) {
    var startX = 0, startY = 0, active = false;
    root.addEventListener('touchstart', function(e) {
      if (!e.touches || !e.touches.length) return;
      // Only track swipes starting on the calendar itself, not a sheet/modal.
      if (e.target.closest && (e.target.closest('.c8cal-detail.open') || e.target.closest('.c8cal-modal.open'))) return;
      startX = e.touches[0].clientX; startY = e.touches[0].clientY; active = true;
    }, { passive: true });
    root.addEventListener('touchend', function(e) {
      if (!active) return;
      active = false;
      if (!e.changedTouches || !e.changedTouches.length) return;
      var dx = e.changedTouches[0].clientX - startX;
      var dy = e.changedTouches[0].clientY - startY;
      if (Math.abs(dx) < 55 || Math.abs(dy) > Math.abs(dx)) return; // not a horizontal swipe
      CAL_STATE.monthOffset += (dx < 0 ? 1 : -1);
      calendar_paint();
    }, { passive: true });
  }

  function calendar_clickDelegate(e) {
    var navBtn = e.target.closest && e.target.closest('[data-c8cal-nav]');
    if (navBtn) {
      var dir = navBtn.getAttribute('data-c8cal-nav');
      if (dir === 'today') CAL_STATE.monthOffset = 0;
      else CAL_STATE.monthOffset += parseInt(dir, 10);
      calendar_paint();
      return;
    }
    var actionEl = e.target.closest && e.target.closest('[data-c8cal-action]');
    if (actionEl) {
      var a = actionEl.getAttribute('data-c8cal-action');
      var id = actionEl.getAttribute('data-c8cal-id');
      if (a === 'open-add')        return calendar_openAddModal();
      if (a === 'close-modal')     return calendar_closeAddModal();
      if (a === 'submit-add')      return calendar_submitAdd();
      if (a === 'pick-camp')       return calendar_pickCamp(actionEl.getAttribute('data-camp-id'));
      if (a === 'open-side')       { document.getElementById('c8calSide').classList.add('open'); return; }
      if (a === 'close-side')      { document.getElementById('c8calSide').classList.remove('open'); return; }
      if (a === 'remove' && id)    return calendar_remove(id);
      if (a === 'share' && id)     return calendar_share(id);
      if (a === 'log-results' && id) return calendar_openResults(id);
      if (a === 'submit-results')  return calendar_submitResults();
      if (a === 'toggle-prep')     return calendar_togglePrep(id, actionEl.getAttribute('data-item-id'));
      if (a === 'generate-prep' && id) return calendar_regeneratePrep(id);
      if (a === 'ask-ai' && id)    return calendar_askAI(id);
    }
    var closeBtn = e.target.closest && e.target.closest('[data-c8cal-close]');
    if (closeBtn) { calendar_closeDetail(); return; }
    var eventEl = e.target.closest && e.target.closest('[data-c8cal-event]');
    if (eventEl) {
      calendar_openDetail(eventEl.getAttribute('data-c8cal-event'));
      return;
    }
    // Backdrops close
    if (e.target && e.target.id === 'c8calDetail' && e.target.classList.contains('open')) calendar_closeDetail();
    if (e.target && e.target.id === 'c8calModal'  && e.target.classList.contains('open')) calendar_closeAddModal();
  }

  function parseIsoDate(str) {
    if (!str) return null;
    var m = /^(\d{4})-(\d{2})-(\d{2})/.exec(String(str));
    if (m) return new Date(+m[1], +m[2] - 1, +m[3]);
    var d = new Date(str);
    return isNaN(d.getTime()) ? null : d;
  }
  function eventStart(ev)  { return parseIsoDate(ev.event_date); }
  function eventEnd(ev)    { return parseIsoDate(ev.event_end_date) || parseIsoDate(ev.event_date); }
  function keyForDate(d)   { return d.getFullYear() + '-' + (d.getMonth()+1) + '-' + d.getDate(); }
  function typeStyle(ev)   { return TYPE_STYLE[ev.event_type] || TYPE_STYLE.camp; }

  function calendar_paint() {
    var today = new Date(); today.setHours(0,0,0,0);
    var view = new Date(today.getFullYear(), today.getMonth() + CAL_STATE.monthOffset, 1);
    var titleEl = document.getElementById('c8calTitle');
    if (titleEl) titleEl.textContent = view.toLocaleDateString('en-US', { month:'long', year:'numeric' });

    var gridEl = document.getElementById('c8calGrid');
    var agendaEl = document.getElementById('c8calAgenda');
    if (!gridEl || !agendaEl) return;

    // Expand multi-day events to their full date range, index by key.
    var byDate = {};
    CAL_STATE.events.forEach(function(ev) {
      var s = eventStart(ev); var e = eventEnd(ev);
      if (!s) return;
      var cur = new Date(s.getFullYear(), s.getMonth(), s.getDate());
      var last = new Date(e.getFullYear(), e.getMonth(), e.getDate());
      while (cur <= last) {
        (byDate[keyForDate(cur)] = byDate[keyForDate(cur)] || []).push(ev);
        cur.setDate(cur.getDate() + 1);
      }
    });

    // ---- Grid (desktop) ----
    var firstDow = view.getDay();
    var daysInMonth = new Date(view.getFullYear(), view.getMonth()+1, 0).getDate();
    var prevMonthDays = new Date(view.getFullYear(), view.getMonth(), 0).getDate();
    var html = '';
    for (var i = 0; i < 42; i++) {
      var dayNum, cellDate, inMonth = true;
      if (i < firstDow) { dayNum = prevMonthDays - firstDow + i + 1; cellDate = new Date(view.getFullYear(), view.getMonth()-1, dayNum); inMonth = false; }
      else if (i >= firstDow + daysInMonth) { dayNum = i - firstDow - daysInMonth + 1; cellDate = new Date(view.getFullYear(), view.getMonth()+1, dayNum); inMonth = false; }
      else { dayNum = i - firstDow + 1; cellDate = new Date(view.getFullYear(), view.getMonth(), dayNum); }
      var events = byDate[keyForDate(cellDate)] || [];
      var isToday = sameDay(cellDate, today);
      html += '<div class="c8cal-cell' + (inMonth ? '' : ' out') + (isToday ? ' today' : '') + '">' +
        '<div class="c8cal-cell-num">' + dayNum + '</div>';
      events.slice(0, 3).forEach(function(ev) {
        var st = typeStyle(ev);
        var cls = 'c8cal-event type-' + esc(ev.event_type) + (ev.status === 'registered' ? ' registered' : '');
        html += '<button class="' + cls + '" style="--c8ev:' + st.color + '" data-c8cal-event="' + esc(ev.id) + '" title="' + esc(ev.event_name) + '">' +
          '<span class="c8cal-ev-dot"></span>' + esc(ev.event_name) +
        '</button>';
      });
      if (events.length > 3) html += '<div class="c8cal-more">+' + (events.length - 3) + ' more</div>';
      html += '</div>';
    }
    gridEl.innerHTML = html;

    // ---- Agenda (mobile) — all events in this view month, grouped by day ----
    var monthStart = new Date(view.getFullYear(), view.getMonth(), 1);
    var monthEnd   = new Date(view.getFullYear(), view.getMonth()+1, 0);
    var agendaGroups = {};
    CAL_STATE.events.forEach(function(ev) {
      var s = eventStart(ev); if (!s) return;
      var e = eventEnd(ev);
      if (e < monthStart || s > monthEnd) return;
      var clamped = s < monthStart ? monthStart : s;
      var key = keyForDate(clamped);
      (agendaGroups[key] = agendaGroups[key] || { date: clamped, items: [] }).items.push(ev);
    });
    var agendaKeys = Object.keys(agendaGroups).sort();
    var aHtml = '';
    if (!agendaKeys.length) {
      aHtml = '<div class="c8cal-empty">No events this month. <button class="c8cal-btn outline" data-c8cal-action="open-add">+ Add one</button></div>';
    } else {
      aHtml = agendaKeys.map(function(k) {
        var g = agendaGroups[k];
        var isToday = sameDay(g.date, today);
        return '<div class="c8cal-agenda-day' + (isToday ? ' today' : '') + '">' +
          '<div class="c8cal-agenda-date">' + fmt(g.date, { weekday:'short', month:'short', day:'numeric' }) + '</div>' +
          '<div class="c8cal-agenda-items">' +
            g.items.map(function(ev) {
              var st = typeStyle(ev);
              return '<button class="c8cal-agenda-item type-' + esc(ev.event_type) + '" style="--c8ev:' + st.color + '" data-c8cal-event="' + esc(ev.id) + '">' +
                '<span class="c8cal-agenda-icon">' + st.icon + '</span>' +
                '<span class="c8cal-agenda-name">' + esc(ev.event_name) + '</span>' +
                (ev.location ? '<span class="c8cal-agenda-loc">' + esc(ev.location) + '</span>' : '') +
              '</button>';
            }).join('') +
          '</div>' +
        '</div>';
      }).join('');
    }
    agendaEl.innerHTML = aHtml;

    // ---- Side list — strict next 30 days ----
    var horizon = new Date(today.getTime() + 30 * 86400000);
    var upcoming = CAL_STATE.events
      .map(function(ev) { return { ev: ev, d: eventStart(ev) }; })
      .filter(function(x) { return x.d && x.d >= today && x.d <= horizon; })
      .sort(function(a, b) { return a.d - b.d });
    var sideEl = document.getElementById('c8calSideList');
    if (sideEl) {
      if (!upcoming.length) {
        sideEl.innerHTML = '<div class="c8cal-empty">Nothing in the next 30 days.<br><button class="c8cal-btn outline" data-c8cal-action="open-add">+ Add event</button></div>';
      } else {
        sideEl.innerHTML = upcoming.map(function(x) {
          var days = daysBetween(today, x.d);
          var countdown = days === 0 ? 'Today' : days === 1 ? 'Tomorrow' : ('in ' + days + ' days');
          var st = typeStyle(x.ev);
          return '<div class="c8cal-side-item type-' + esc(x.ev.event_type) + '" style="--c8ev:' + st.color + '">' +
            '<button class="c8cal-side-main" data-c8cal-event="' + esc(x.ev.id) + '">' +
              '<div class="c8cal-side-date">' + fmt(x.d, { month:'short', day:'numeric' }) + '</div>' +
              '<div class="c8cal-side-body">' +
                '<div class="c8cal-side-name"><span class="c8cal-side-icon">' + st.icon + '</span>' + esc(x.ev.event_name) + '</div>' +
                '<div class="c8cal-side-loc">' + (x.ev.location ? esc(x.ev.location) : '<em>No location</em>') + '</div>' +
                '<div class="c8cal-side-cd">' + countdown + '</div>' +
              '</div>' +
            '</button>' +
            '<div class="c8cal-side-actions">' +
              '<button class="c8cal-side-act" data-c8cal-action="share"  data-c8cal-id="' + esc(x.ev.id) + '" title="Share">↗</button>' +
              '<button class="c8cal-side-act" data-c8cal-action="remove" data-c8cal-id="' + esc(x.ev.id) + '" title="Remove">✕</button>' +
            '</div>' +
          '</div>';
        }).join('');
      }
    }
  }

  // ---------- Detail sheet ----------
  function calendar_openDetail(id) {
    var ev = CAL_STATE.events.find(function(x) { return String(x.id) === String(id); });
    if (!ev) return;
    var el = document.getElementById('c8calDetail');
    if (!el) return;
    var start = eventStart(ev);
    var end = eventEnd(ev);
    var today = new Date(); today.setHours(0,0,0,0);
    var days = start ? daysBetween(today, start) : null;
    var isPast = start && start < today && !sameDay(start, today);
    var st = typeStyle(ev);
    var dateRange = start ? fmt(start) + (end && !sameDay(start, end) ? ' – ' + fmt(end) : '') : 'TBD';
    var prep = Array.isArray(ev.prep_checklist) ? ev.prep_checklist : [];

    el.innerHTML =
      '<div class="c8cal-sheet" role="dialog" aria-modal="true" style="--c8ev:' + st.color + '">' +
        '<button class="c8cal-close" data-c8cal-close aria-label="Close">✕</button>' +
        '<div class="c8cal-sheet-type">' + st.icon + ' ' + st.label + '</div>' +
        '<h3 class="c8cal-sheet-title">' + esc(ev.event_name) + '</h3>' +
        '<div class="c8cal-sheet-meta">' +
          '<span>📅 ' + esc(dateRange) + '</span>' +
          (ev.location ? '<span>📍 ' + esc(ev.location) + '</span>' : '') +
          (ev.status ? '<span class="c8cal-status ' + esc(ev.status) + '">' + esc(ev.status) + '</span>' : '') +
        '</div>' +
        (days != null ? '<div class="c8cal-countdown">' + (days === 0 ? 'Today' : days < 0 ? Math.abs(days) + ' days ago' : days + ' days out') + '</div>' : '') +
        (ev.notes ? '<div class="c8cal-sheet-notes">' + esc(ev.notes) + '</div>' : '') +
        renderPrepSection(ev, prep, isPast) +
        renderResultsSection(ev, isPast) +
        '<div class="c8cal-sheet-actions">' +
          (ev.registration_url ? '<a class="c8cal-btn primary" href="' + esc(ev.registration_url) + '" target="_blank" rel="noopener">Register / More Info</a>' : '') +
          (CAL_STATE.handlers.onAskAI ? '<button class="c8cal-btn outline" data-c8cal-action="ask-ai" data-c8cal-id="' + esc(ev.id) + '">💬 Ask Camp 8 AI</button>' : '') +
          '<button class="c8cal-btn" data-c8cal-action="share"  data-c8cal-id="' + esc(ev.id) + '">↗ Share</button>' +
          '<button class="c8cal-btn danger" data-c8cal-action="remove" data-c8cal-id="' + esc(ev.id) + '">Remove</button>' +
          '<button class="c8cal-btn" data-c8cal-close>Close</button>' +
        '</div>' +
      '</div>';
    el.setAttribute('aria-hidden', 'false');
    el.classList.add('open');
  }

  function renderPrepSection(ev, prep, isPast) {
    if (!prep.length) {
      return '<div class="c8cal-sheet-section-title">Prep checklist</div>' +
        '<div class="c8cal-prep-empty">No checklist yet.' +
          (CAL_STATE.handlers.onGeneratePrep ? ' <button class="c8cal-btn outline" data-c8cal-action="generate-prep" data-c8cal-id="' + esc(ev.id) + '">Generate with AI</button>' : '') +
        '</div>';
    }
    return '<div class="c8cal-sheet-section-title">Prep checklist' + (CAL_STATE.handlers.onGeneratePrep ? ' <button class="c8cal-prep-regen" data-c8cal-action="generate-prep" data-c8cal-id="' + esc(ev.id) + '">↻ Regenerate</button>' : '') + '</div>' +
      '<div class="c8cal-prep-list-wrap">' +
        prep.map(function(item, i) {
          var itemId = item.id || String(i);
          var done = !!item.done;
          return '<label class="c8cal-prep-item' + (done ? ' done' : '') + '">' +
            '<input type="checkbox" ' + (done ? 'checked' : '') + ' data-c8cal-action="toggle-prep" data-c8cal-id="' + esc(ev.id) + '" data-item-id="' + esc(itemId) + '"/>' +
            '<span>' + esc(item.item || item.text || '') + '</span>' +
          '</label>';
        }).join('') +
      '</div>';
  }

  function renderResultsSection(ev, isPast) {
    if (!isPast) return '';
    if (ev.results_logged) {
      var r = ev.results_logged;
      var summary = Object.keys(r).map(function(k) { return '<strong>' + esc(k) + ':</strong> ' + esc(r[k]); }).join(' · ');
      return '<div class="c8cal-sheet-section-title">Results</div>' +
        '<div class="c8cal-results-summary">' + summary + '</div>';
    }
    return '<div class="c8cal-sheet-section-title">Log your results</div>' +
      '<form class="c8cal-results-form" id="c8calResultsForm" data-event-id="' + esc(ev.id) + '">' +
        '<div class="c8cal-results-grid">' +
          (ev.event_type === 'combine' || ev.event_type === 'camp'
            ? '<label>40-yard <input name="forty" type="text" placeholder="4.58"></label>' +
              '<label>Vertical <input name="vertical" type="text" placeholder="34"></label>' +
              '<label>Shuttle <input name="shuttle" type="text" placeholder="4.21"></label>' +
              '<label>Bench reps <input name="bench" type="text" placeholder="12"></label>'
            : '') +
          '<label class="c8cal-results-notes">Notes <textarea name="notes" rows="3" placeholder="Key takeaways, coach feedback, next steps…"></textarea></label>' +
        '</div>' +
        '<button type="button" class="c8cal-btn primary" data-c8cal-action="submit-results">Save results</button>' +
      '</form>';
  }

  function calendar_closeDetail() {
    var el = document.getElementById('c8calDetail');
    if (!el) return;
    el.classList.remove('open');
    el.setAttribute('aria-hidden', 'true');
    setTimeout(function() { el.innerHTML = ''; }, 180);
  }

  // ---------- Add Event modal ----------
  function calendar_openAddModal() {
    var el = document.getElementById('c8calModal'); if (!el) return;
    el.innerHTML =
      '<div class="c8cal-sheet" role="dialog" aria-modal="true">' +
        '<button class="c8cal-close" data-c8cal-action="close-modal" aria-label="Close">✕</button>' +
        '<h3 class="c8cal-sheet-title">Add Event</h3>' +
        '<form id="c8calAddForm" class="c8cal-add-form">' +
          '<label>Event type' +
            '<select name="event_type" id="c8calAddType" required>' +
              Object.entries(TYPE_STYLE).map(function(ent) { return '<option value="' + ent[0] + '">' + ent[1].icon + ' ' + ent[1].label + '</option>'; }).join('') +
            '</select>' +
          '</label>' +
          '<div id="c8calCampPicker" class="c8cal-camp-picker">' +
            '<label>Search Camp 8 database (autofills name, location, date)' +
              '<input type="search" id="c8calCampSearch" placeholder="Type to search 755 camps…" autocomplete="off">' +
              '<div id="c8calCampResults" class="c8cal-camp-results"></div>' +
            '</label>' +
          '</div>' +
          '<label>Name<input name="event_name" id="c8calAddName" required></label>' +
          '<div class="c8cal-add-row">' +
            '<label>Date<input name="event_date" id="c8calAddDate" type="date" required></label>' +
            '<label>End date (optional)<input name="event_end_date" id="c8calAddEnd" type="date"></label>' +
          '</div>' +
          '<label>Location<input name="location" id="c8calAddLocation" placeholder="City, State"></label>' +
          '<label>Notes<textarea name="notes" id="c8calAddNotes" rows="3" placeholder="What matters about this event?"></textarea></label>' +
          '<input type="hidden" id="c8calAddSourceRef" value="">' +
          '<input type="hidden" id="c8calAddRegUrl" value="">' +
          '<input type="hidden" id="c8calAddTier" value="">' +
          '<div class="c8cal-add-actions">' +
            '<button type="button" class="c8cal-btn primary" data-c8cal-action="submit-add">Save event</button>' +
            '<button type="button" class="c8cal-btn" data-c8cal-action="close-modal">Cancel</button>' +
          '</div>' +
        '</form>' +
      '</div>';
    el.setAttribute('aria-hidden', 'false'); el.classList.add('open');

    var typeSel = document.getElementById('c8calAddType');
    var picker = document.getElementById('c8calCampPicker');
    function syncPicker() { picker.style.display = typeSel.value === 'camp' ? '' : 'none'; }
    typeSel.addEventListener('change', syncPicker); syncPicker();

    var search = document.getElementById('c8calCampSearch');
    search.addEventListener('input', debounceFn(function() { calendar_renderCampSearch(search.value); }, 140));
  }
  function calendar_closeAddModal() {
    var el = document.getElementById('c8calModal'); if (!el) return;
    el.classList.remove('open'); el.setAttribute('aria-hidden', 'true');
    setTimeout(function() { el.innerHTML = ''; }, 160);
  }

  function calendar_renderCampSearch(q) {
    var out = document.getElementById('c8calCampResults'); if (!out) return;
    q = (q || '').trim().toLowerCase();
    if (!q || q.length < 2 || typeof CAMPS_DATA === 'undefined') { out.innerHTML = ''; return; }
    var matches = CAMPS_DATA.filter(function(c) {
      return (c.name && c.name.toLowerCase().indexOf(q) !== -1)
        || (c.host && c.host.toLowerCase().indexOf(q) !== -1)
        || (c.city && c.city.toLowerCase().indexOf(q) !== -1);
    }).slice(0, 8);
    if (!matches.length) { out.innerHTML = '<div class="c8cal-camp-result empty">No matches — add manually.</div>'; return; }
    out.innerHTML = matches.map(function(c) {
      return '<button type="button" class="c8cal-camp-result" data-c8cal-action="pick-camp" data-camp-id="' + esc(c.id) + '">' +
        '<span class="c8cal-camp-result-name">' + esc(c.name) + '</span>' +
        '<span class="c8cal-camp-result-loc">' + esc(c.city || '') + (c.state_abbrev ? ', ' + esc(c.state_abbrev) : '') + ' · ' + esc(c.dates || 'TBD') + '</span>' +
      '</button>';
    }).join('');
  }
  function calendar_pickCamp(campId) {
    if (typeof CAMPS_DATA === 'undefined') return;
    var c = CAMPS_DATA.find(function(cd) { return cd.id === campId; });
    if (!c) return;
    var nameEl = document.getElementById('c8calAddName'); if (nameEl) nameEl.value = c.name || '';
    var locEl = document.getElementById('c8calAddLocation'); if (locEl) locEl.value = (c.city || '') + (c.state_abbrev ? ', ' + c.state_abbrev : '');
    // Parse ISO date or "Mon DD, YYYY" — best-effort
    var dEl = document.getElementById('c8calAddDate');
    if (dEl && c.dates) {
      var firstPart = String(c.dates).split(/[–\-]/)[0].trim();
      var parsed = new Date(firstPart);
      if (!isNaN(parsed)) dEl.value = parsed.toISOString().slice(0, 10);
    }
    var srcEl = document.getElementById('c8calAddSourceRef'); if (srcEl) srcEl.value = c.id || '';
    var regEl = document.getElementById('c8calAddRegUrl'); if (regEl) regEl.value = c.registration_url || '';
    var tierEl = document.getElementById('c8calAddTier'); if (tierEl) tierEl.value = c.tier || '';
    var search = document.getElementById('c8calCampSearch'); if (search) search.value = c.name;
    document.getElementById('c8calCampResults').innerHTML = '<div class="c8cal-camp-result picked">Autofilled from Camp 8 database ✓</div>';
  }

  async function calendar_submitAdd() {
    var form = document.getElementById('c8calAddForm'); if (!form) return;
    var payload = {
      event_type: form.event_type.value,
      event_name: form.event_name.value.trim(),
      event_date: form.event_date.value,
      event_end_date: form.event_end_date.value || null,
      location:   form.location.value.trim() || null,
      notes:      form.notes.value.trim() || null,
      source:     document.getElementById('c8calAddSourceRef').value ? 'camp8_database' : 'manual',
      source_ref: document.getElementById('c8calAddSourceRef').value || null,
      registration_url: document.getElementById('c8calAddRegUrl').value || null,
      camp_tier:  parseInt(document.getElementById('c8calAddTier').value, 10) || null
    };
    if (!payload.event_name || !payload.event_date) {
      alert('Name and date are required.'); return;
    }
    if (!CAL_STATE.handlers.onAdd) { alert('Add handler not wired.'); return; }
    var submitBtn = form.querySelector('[data-c8cal-action="submit-add"]');
    if (submitBtn) { submitBtn.disabled = true; submitBtn.textContent = 'Saving…'; }
    try {
      await CAL_STATE.handlers.onAdd(payload);
      calendar_closeAddModal();
    } catch (err) {
      alert('Could not save: ' + (err && err.message || 'unknown error'));
      if (submitBtn) { submitBtn.disabled = false; submitBtn.textContent = 'Save event'; }
    }
  }

  // ---------- Per-event actions ----------
  async function calendar_remove(id) {
    if (!CAL_STATE.handlers.onRemove) return;
    if (!confirm('Remove this event from your calendar?')) return;
    var ev = CAL_STATE.events.find(function(x) { return String(x.id) === String(id); });
    await CAL_STATE.handlers.onRemove(ev);
    calendar_closeDetail();
  }
  function calendar_share(id) {
    var ev = CAL_STATE.events.find(function(x) { return String(x.id) === String(id); });
    if (!ev) return;
    var s = eventStart(ev);
    var text = ev.event_name + (s ? ' — ' + fmt(s) : '') + (ev.location ? ' — ' + ev.location : '') + ' · via Camp 8';
    if (navigator.share) {
      navigator.share({ title: ev.event_name, text: text }).catch(function() {});
    } else if (navigator.clipboard) {
      navigator.clipboard.writeText(text).then(function() {
        if (typeof showToast === 'function') showToast('Copied to clipboard', 'success');
      });
    }
    if (CAL_STATE.handlers.onShare) CAL_STATE.handlers.onShare(ev);
  }
  function calendar_openResults(id) { calendar_openDetail(id); }
  async function calendar_submitResults() {
    var form = document.getElementById('c8calResultsForm'); if (!form) return;
    var id = form.getAttribute('data-event-id');
    var fd = new FormData(form);
    var results = {};
    fd.forEach(function(v, k) { if (v) results[k] = v; });
    if (!Object.keys(results).length) { alert('Add at least one result.'); return; }
    if (!CAL_STATE.handlers.onLogResults) return;
    await CAL_STATE.handlers.onLogResults(id, results);
    calendar_closeDetail();
  }
  async function calendar_togglePrep(eventId, itemId) {
    if (!CAL_STATE.handlers.onTogglePrepItem) return;
    await CAL_STATE.handlers.onTogglePrepItem(eventId, itemId);
  }
  async function calendar_regeneratePrep(eventId) {
    if (!CAL_STATE.handlers.onGeneratePrep) return;
    await CAL_STATE.handlers.onGeneratePrep(eventId);
    calendar_openDetail(eventId); // re-render
  }
  function calendar_askAI(id) {
    var ev = CAL_STATE.events.find(function(x) { return String(x.id) === String(id); });
    if (!ev || !CAL_STATE.handlers.onAskAI) return;
    CAL_STATE.handlers.onAskAI(ev);
    calendar_closeDetail();
  }

  function debounceFn(fn, ms) { var t; return function() { clearTimeout(t); var args = arguments; t = setTimeout(function() { fn.apply(null, args); }, ms); }; }

  // ===========================================================
  // 2) NIL RATING BAR GRAPH + PROJECTION
  // ===========================================================
  function nilBars_render(root, history, opts) {
    if (!root) return;
    opts = opts || {};
    var data = (history || []).slice().sort(function(a, b) { return new Date(a.created_at) - new Date(b.created_at); });
    if (!data.length) {
      root.innerHTML = '<div class="c8bars-empty">No NIL score history yet. <a href="nil-rating.html">Run your first rating →</a></div>';
      return;
    }

    // Project next 2 points via simple linear fit
    var projected = projectSeries(data.map(function(d) { return d.score; }), 2);
    var max = 100;
    var total = data.length + projected.length;

    var latest = data[data.length-1];
    var delta = data.length > 1 ? (latest.score - data[data.length-2].score) : 0;

    root.innerHTML =
      '<div class="c8bars-wrap">' +
        '<div class="c8bars-header">' +
          '<div>' +
            '<div class="c8bars-eyebrow">NIL Rating History</div>' +
            '<div class="c8bars-headline"><span class="c8bars-score">' + latest.score + '</span>' +
              '<span class="c8bars-grade">' + esc(latest.grade || '') + '</span>' +
              (delta ? '<span class="c8bars-delta ' + (delta>0?'up':'down') + '">' + (delta>0?'+':'') + delta + '</span>' : '') +
            '</div>' +
          '</div>' +
          '<div class="c8bars-legend">' +
            '<span><i class="c8bars-swatch actual"></i>Actual</span>' +
            '<span><i class="c8bars-swatch projected"></i>Projected</span>' +
          '</div>' +
        '</div>' +
        '<div class="c8bars-chart" id="c8barsChart">' +
          data.map(function(d, i) {
            var h = Math.max(6, Math.round((d.score / max) * 100));
            return '<button class="c8bars-bar actual" style="height:' + h + '%" data-c8bars-idx="' + i + '" aria-label="Score ' + d.score + ' on ' + fmt(new Date(d.created_at)) + '">' +
              '<span class="c8bars-bar-val">' + d.score + '</span>' +
            '</button>';
          }).join('') +
          projected.map(function(v, i) {
            var h = Math.max(6, Math.round((v / max) * 100));
            return '<div class="c8bars-bar projected" style="height:' + h + '%" title="Projected ' + v + '">' +
              '<span class="c8bars-bar-val">~' + v + '</span>' +
            '</div>';
          }).join('') +
          '<svg class="c8bars-trend" viewBox="0 0 ' + (total * 100) + ' 100" preserveAspectRatio="none" aria-hidden="true">' +
            '<polyline points="' +
              data.concat(projected.map(function(v) { return { score: v }; })).map(function(pt, i) {
                var x = (i + 0.5) * 100;
                var y = 100 - pt.score;
                return x + ',' + y;
              }).join(' ') +
            '" fill="none" stroke="#d4a843" stroke-width="1.5" stroke-dasharray="4 3" opacity="0.55"/>' +
          '</svg>' +
        '</div>' +
        '<div class="c8bars-xaxis">' +
          data.map(function(d) { return '<span>' + fmt(new Date(d.created_at), { month:'short', day:'numeric' }) + '</span>'; }).join('') +
          projected.map(function(_, i) { return '<span class="proj">+' + (i+1) + '</span>'; }).join('') +
        '</div>' +
        '<div class="c8bars-detail" id="c8barsDetail">Click a bar to see what changed between ratings.</div>' +
      '</div>';

    var chart = document.getElementById('c8barsChart');
    if (chart) chart.addEventListener('click', function(e) {
      var b = e.target.closest && e.target.closest('.c8bars-bar.actual');
      if (!b) return;
      var idx = parseInt(b.getAttribute('data-c8bars-idx'), 10);
      var cur = data[idx], prev = idx > 0 ? data[idx-1] : null;
      document.getElementById('c8barsDetail').innerHTML = renderDeltaDetail(cur, prev);
    });
  }

  function projectSeries(values, n) {
    if (values.length < 2) return Array(n).fill(values[0] || 0);
    // linear regression slope
    var N = values.length;
    var sumX = 0, sumY = 0, sumXY = 0, sumXX = 0;
    for (var i = 0; i < N; i++) { sumX += i; sumY += values[i]; sumXY += i * values[i]; sumXX += i * i; }
    var slope = (N * sumXY - sumX * sumY) / (N * sumXX - sumX * sumX) || 0;
    var intercept = (sumY - slope * sumX) / N;
    var out = [];
    for (var j = 0; j < n; j++) {
      var v = Math.round(intercept + slope * (N + j));
      out.push(Math.max(0, Math.min(100, v)));
    }
    return out;
  }

  function renderDeltaDetail(cur, prev) {
    var when = fmt(new Date(cur.created_at));
    var out = '<div class="c8bars-detail-head"><strong>' + cur.score + '/100</strong> · ' + esc(cur.grade || '') + ' · ' + when + '</div>';
    if (cur.notes) out += '<div class="c8bars-detail-note">' + esc(cur.notes) + '</div>';
    var br = cur.breakdown || {};
    var prevBr = prev && prev.breakdown ? prev.breakdown : {};
    var keys = Object.keys(br);
    if (keys.length) {
      out += '<div class="c8bars-factors">' + keys.map(function(k) {
        var cv = Number(br[k]) || 0;
        var pv = Number(prevBr[k]) || 0;
        var diff = prev ? Math.round((cv - pv) * 10) / 10 : null;
        return '<div class="c8bars-factor">' +
          '<span class="c8bars-factor-name">' + esc(k) + '</span>' +
          '<span class="c8bars-factor-val">' + cv + '</span>' +
          (diff !== null ? '<span class="c8bars-factor-diff ' + (diff>0?'up':diff<0?'down':'') + '">' + (diff>0?'+':'') + diff + '</span>' : '') +
        '</div>';
      }).join('') + '</div>';
    }
    if (!prev) out += '<div class="c8bars-detail-foot">First rating — no prior data to compare.</div>';
    return out;
  }

  // ===========================================================
  // 3) CAMP 8 GRADE RADAR (SPIDER)
  // ===========================================================
  var RADAR_FACTORS = [
    { key: 'combine',    label: 'Combine',    desc: 'Speed, explosiveness, strength benchmarks.' },
    { key: 'production', label: 'Production', desc: 'On-field stats and game film.' },
    { key: 'offers',     label: 'Offers',     desc: 'Volume and level of college offers.' },
    { key: 'stars',      label: 'Stars',      desc: 'National ranking / star rating.' },
    { key: 'social',     label: 'Social',     desc: 'Audience size across platforms.' },
    { key: 'academics',  label: 'Academics',  desc: 'GPA, test scores, NCAA eligibility.' },
    { key: 'position',   label: 'Position',   desc: 'Positional market value and scarcity.' },
    { key: 'engagement', label: 'Engagement', desc: 'Post frequency and brand fit.' }
  ];

  function radar_render(root, snapshot, opts) {
    if (!root) return;
    opts = opts || {};
    var factors = (snapshot && snapshot.factors) || {};
    var overall = snapshot ? snapshot.overall : null;
    var grade = snapshot ? snapshot.grade : '';

    var size = 360, cx = size/2, cy = size/2, r = size/2 - 40;
    var n = RADAR_FACTORS.length;
    var rings = [2, 4, 6, 8, 10];
    var points = RADAR_FACTORS.map(function(f, i) {
      var v = Math.max(0, Math.min(10, Number(factors[f.key]) || 0));
      var angle = (Math.PI * 2 * i) / n - Math.PI/2;
      var rr = (v / 10) * r;
      return {
        label: f.label, key: f.key, desc: f.desc, value: v,
        angle: angle,
        x: cx + Math.cos(angle) * rr,
        y: cy + Math.sin(angle) * rr,
        lx: cx + Math.cos(angle) * (r + 22),
        ly: cy + Math.sin(angle) * (r + 22),
        ax: cx + Math.cos(angle) * r,
        ay: cy + Math.sin(angle) * r
      };
    });

    var ringsHtml = rings.map(function(val) {
      var rr = (val / 10) * r;
      return '<circle cx="' + cx + '" cy="' + cy + '" r="' + rr + '" fill="none" stroke="rgba(255,255,255,0.06)" stroke-width="1"/>';
    }).join('');

    var spokesHtml = points.map(function(p) {
      return '<line x1="' + cx + '" y1="' + cy + '" x2="' + p.ax + '" y2="' + p.ay + '" stroke="rgba(255,255,255,0.08)" stroke-width="1"/>';
    }).join('');

    var polyPoints = points.map(function(p) { return p.x + ',' + p.y; }).join(' ');

    var dotsHtml = points.map(function(p) {
      var strong = p.value >= 7.5;
      var weak = p.value < 5;
      return '<circle cx="' + p.x + '" cy="' + p.y + '" r="5" fill="' + (strong ? '#FFD700' : weak ? '#e8872b' : '#d4a843') + '" stroke="#0a0a14" stroke-width="2" class="' + (strong ? 'glow' : '') + '"/>';
    }).join('');

    var labelsHtml = points.map(function(p, i) {
      var anchor = 'middle';
      if (p.lx < cx - 10) anchor = 'end';
      else if (p.lx > cx + 10) anchor = 'start';
      var strong = p.value >= 7.5;
      return '<g class="c8radar-label ' + (strong ? 'strong' : p.value < 5 ? 'weak' : '') + '">' +
        '<text x="' + p.lx + '" y="' + p.ly + '" text-anchor="' + anchor + '" dy="0.35em">' + esc(p.label) + '</text>' +
        '<text x="' + p.lx + '" y="' + (p.ly + 14) + '" text-anchor="' + anchor + '" dy="0.35em" class="c8radar-val">' + p.value.toFixed(1) + '</text>' +
      '</g>';
    }).join('');

    root.innerHTML =
      '<div class="c8radar">' +
        '<div class="c8radar-svg-wrap">' +
          '<svg viewBox="0 0 ' + size + ' ' + size + '" class="c8radar-svg" aria-label="Camp 8 radar rating">' +
            '<defs>' +
              '<radialGradient id="c8radarFill" cx="50%" cy="50%" r="50%">' +
                '<stop offset="0%" stop-color="#d4a843" stop-opacity="0.55"/>' +
                '<stop offset="100%" stop-color="#d4a843" stop-opacity="0.05"/>' +
              '</radialGradient>' +
              '<filter id="c8radarGlow" x="-50%" y="-50%" width="200%" height="200%">' +
                '<feGaussianBlur stdDeviation="3" result="coloredBlur"/>' +
                '<feMerge><feMergeNode in="coloredBlur"/><feMergeNode in="SourceGraphic"/></feMerge>' +
              '</filter>' +
            '</defs>' +
            ringsHtml + spokesHtml +
            '<polygon points="' + polyPoints + '" fill="url(#c8radarFill)" stroke="#d4a843" stroke-width="2" filter="url(#c8radarGlow)"/>' +
            dotsHtml +
            '<g class="c8radar-center"><text x="' + cx + '" y="' + (cy - 4) + '" text-anchor="middle" class="c8radar-overall">' + (overall != null ? overall : '—') + '</text>' +
            '<text x="' + cx + '" y="' + (cy + 22) + '" text-anchor="middle" class="c8radar-gradelbl">' + esc(grade) + '</text></g>' +
            labelsHtml +
          '</svg>' +
        '</div>' +
        '<div class="c8radar-legend">' +
          RADAR_FACTORS.map(function(f) {
            var v = Math.max(0, Math.min(10, Number(factors[f.key]) || 0));
            var pct = Math.round(v * 10);
            var cls = v >= 7.5 ? 'strong' : v < 5 ? 'weak' : 'mid';
            return '<div class="c8radar-leg ' + cls + '">' +
              '<div class="c8radar-leg-head"><span class="c8radar-leg-label">' + esc(f.label) + '</span><span class="c8radar-leg-val">' + v.toFixed(1) + '</span></div>' +
              '<div class="c8radar-leg-bar"><div class="c8radar-leg-fill" style="width:' + pct + '%"></div></div>' +
              '<div class="c8radar-leg-desc">' + esc(f.desc) + '</div>' +
            '</div>';
          }).join('') +
        '</div>' +
      '</div>';
  }

  // Derive factors from athleteProfile + history when no snapshot exists (fallback)
  function radar_deriveFactors(profile, combineLatest, nilLatest, offers) {
    function clamp(v) { return Math.max(0, Math.min(10, v)); }
    function scale(v, max) { return clamp((v || 0) / max * 10); }
    var factors = {
      combine: combineLatest && combineLatest.overall_grade ? scale(gradeToNum(combineLatest.overall_grade), 4) : 0,
      production: profile && profile.maxpreps_data ? 7 : 4,
      offers: scale(offers ? offers.length : 0, 10),
      stars: scale(profile && profile.stars, 5),
      social: scale((profile && ((profile.instagram_followers||0) + (profile.twitter_followers||0) + (profile.tiktok_followers||0))/10000) || 0, 10),
      academics: scale(profile && profile.gpa, 4),
      position: positionWeight(profile && profile.position),
      engagement: nilLatest && nilLatest.breakdown && nilLatest.breakdown.engagement ? scale(nilLatest.breakdown.engagement, 100) : 5
    };
    var overall = Math.round((factors.combine + factors.production + factors.offers + factors.stars + factors.social + factors.academics + factors.position + factors.engagement) * 1.25); // 10-point avg → 100
    var grade = overall >= 90 ? 'A+' : overall >= 83 ? 'A' : overall >= 78 ? 'A-' : overall >= 73 ? 'B+' : overall >= 68 ? 'B' : overall >= 60 ? 'B-' : overall >= 50 ? 'C' : 'D';
    return { overall: overall, grade: grade, factors: factors };
  }
  function gradeToNum(g) { if (!g) return 0; var m = { 'A+':4,'A':4,'A-':3.7,'B+':3.3,'B':3,'B-':2.7,'C+':2.3,'C':2,'C-':1.7,'D':1,'F':0 }; return m[g] || 0; }
  function positionWeight(pos) {
    if (!pos) return 5;
    var p = String(pos).toUpperCase();
    var top = { QB: 10, WR: 9, CB: 9, EDGE: 9, DE: 9, OT: 8.5, RB: 8, S: 8, LB: 7.5, TE: 7.5, DT: 7, OG: 7, OL: 7, DL: 7, K: 5, P: 5 };
    return top[p] || 6;
  }

  // ===========================================================
  // 4) AI ACTION PLAN
  // ===========================================================
  function actions_render(root, actions, handlers) {
    if (!root) return;
    var open = actions.filter(function(a) { return a.status === 'open'; });
    var snoozed = actions.filter(function(a) { return a.status === 'snoozed'; });
    var done = actions.filter(function(a) { return a.status === 'completed'; });

    root.innerHTML =
      '<div class="c8ap">' +
        '<div class="c8ap-head">' +
          '<div class="c8ap-title">Your next moves</div>' +
          '<div class="c8ap-sub">AI-curated — complete, snooze, or ask Camp 8 AI for more detail.</div>' +
        '</div>' +
        (open.length ? '<div class="c8ap-group">' + open.map(function(a) { return renderAction(a); }).join('') + '</div>' : '<div class="c8ap-empty">All caught up. Fresh actions generate automatically after each rating.</div>') +
        (snoozed.length ? '<div class="c8ap-group-head">Snoozed</div><div class="c8ap-group muted">' + snoozed.map(function(a) { return renderAction(a); }).join('') + '</div>' : '') +
        (done.length ? '<div class="c8ap-group-head">Completed</div><div class="c8ap-group done">' + done.slice(0, 5).map(function(a) { return renderAction(a); }).join('') + '</div>' : '') +
      '</div>';

    // Delegate clicks once per root — re-renders swap the HTML but the listener stays.
    // Keep the latest actions+handlers in a closure-owned map keyed by root.
    root._c8apState = { actions: actions, handlers: handlers };
    if (!root._c8apBound) {
      root._c8apBound = true;
      root.addEventListener('click', function(e) {
        var btn = e.target.closest && e.target.closest('[data-c8ap-action]');
        if (!btn) return;
        var state = root._c8apState || { actions: [], handlers: {} };
        var id = btn.getAttribute('data-c8ap-id');
        var action = btn.getAttribute('data-c8ap-action');
        var item = state.actions.find(function(x) { return String(x.id) === String(id); });
        if (!item) return;
        var h = state.handlers || {};
        if (action === 'complete' && h.onComplete) h.onComplete(item);
        else if (action === 'snooze' && h.onSnooze) h.onSnooze(item);
        else if (action === 'ask' && h.onAsk) h.onAsk(item);
        else if (action === 'reopen' && h.onReopen) h.onReopen(item);
      });
    }
  }

  function renderAction(a) {
    var pri = a.priority || 2;
    var due = a.due_date ? new Date(a.due_date + 'T00:00:00') : null;
    var today = new Date(); today.setHours(0,0,0,0);
    var overdue = due && due < today && a.status === 'open';
    var dueLabel = due ? (overdue ? 'Overdue · ' + fmt(due) : 'Due ' + fmt(due)) : 'No due date';

    var done = a.status === 'completed';
    var snoozed = a.status === 'snoozed';

    return '<div class="c8ap-item pri-' + pri + (done ? ' done' : '') + (snoozed ? ' snoozed' : '') + (overdue ? ' overdue' : '') + '">' +
      '<div class="c8ap-pri-stripe"></div>' +
      '<div class="c8ap-body">' +
        '<div class="c8ap-item-head">' +
          '<div class="c8ap-item-title">' + esc(a.title) + '</div>' +
          '<div class="c8ap-item-meta">' +
            '<span class="c8ap-cat">' + esc(a.category || 'general') + '</span>' +
            '<span class="c8ap-due">' + esc(dueLabel) + '</span>' +
          '</div>' +
        '</div>' +
        (a.detail ? '<div class="c8ap-detail">' + esc(a.detail) + '</div>' : '') +
      '</div>' +
      '<div class="c8ap-actions">' +
        (done
          ? '<button class="c8ap-btn" data-c8ap-action="reopen" data-c8ap-id="' + esc(a.id) + '">Reopen</button>'
          : '<button class="c8ap-btn primary" data-c8ap-action="complete" data-c8ap-id="' + esc(a.id) + '" title="Mark done">✓ Done</button>' +
            '<button class="c8ap-btn" data-c8ap-action="snooze" data-c8ap-id="' + esc(a.id) + '" title="Snooze 7 days">⏱ Snooze</button>' +
            '<button class="c8ap-btn outline" data-c8ap-action="ask" data-c8ap-id="' + esc(a.id) + '" title="Ask AI">💬 Ask</button>'
        ) +
      '</div>' +
    '</div>';
  }

  // ===========================================================
  // 5) FLOATING DASH CHAT
  // ===========================================================
  var DASHCHAT = { open: false, context: null, messages: [] };

  function dashChat_init(opts) {
    opts = opts || {};
    DASHCHAT.context = opts.context || '';
    DASHCHAT.opener = opts.openerLabel || 'Ask Camp 8 AI';
    if (document.getElementById('c8dashchat-fab')) return;

    // Suppress nav.js's generic chat bubble — we have a context-aware one.
    function hideNavBubble() {
      var b = document.getElementById('camp8-chat-bubble');
      if (b) b.style.display = 'none';
    }
    hideNavBubble();
    // nav.js injects its bubble after a 800ms timeout — hide it again once it appears.
    setTimeout(hideNavBubble, 900);

    var fab = document.createElement('button');
    fab.id = 'c8dashchat-fab';
    fab.setAttribute('aria-label', 'Open Camp 8 AI');
    fab.innerHTML =
      '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/></svg>' +
      '<span class="c8dashchat-fab-lbl">' + esc(DASHCHAT.opener) + '</span>';
    fab.addEventListener('click', dashChat_toggle);
    document.body.appendChild(fab);

    var panel = document.createElement('div');
    panel.id = 'c8dashchat-panel';
    panel.setAttribute('aria-hidden', 'true');
    panel.innerHTML =
      '<div class="c8dashchat-head">' +
        '<div><div class="c8dashchat-title">Camp 8 AI</div><div class="c8dashchat-sub">Knows your profile + latest rating</div></div>' +
        '<button class="c8dashchat-close" aria-label="Close">✕</button>' +
      '</div>' +
      '<div class="c8dashchat-messages" id="c8dashchat-messages"></div>' +
      '<div class="c8dashchat-suggest" id="c8dashchat-suggest"></div>' +
      '<div class="c8dashchat-input-row">' +
        '<textarea id="c8dashchat-input" placeholder="Ask about your rating, next camp, or a coach email…" rows="1"></textarea>' +
        '<button id="c8dashchat-send" aria-label="Send">' +
          '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>' +
        '</button>' +
      '</div>';
    document.body.appendChild(panel);

    panel.querySelector('.c8dashchat-close').addEventListener('click', dashChat_toggle);
    var input = panel.querySelector('#c8dashchat-input');
    var send = panel.querySelector('#c8dashchat-send');
    input.addEventListener('input', function() { this.style.height='auto'; this.style.height=Math.min(this.scrollHeight,120)+'px'; });
    input.addEventListener('keydown', function(e) { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); dashChat_send(); } });
    send.addEventListener('click', dashChat_send);

    dashChat_renderSuggest(opts.suggestions || [
      'What should I work on this week?',
      'Draft a thank-you email to my top offer.',
      'How does my rating compare to other QBs in Georgia?',
      'What drills raise my 40-yard dash?'
    ]);

    // Greeting
    dashChat_appendBot('Hey — I\'ve got your profile, offers, camps, and latest rating loaded. Ask anything.');
  }

  function dashChat_updateContext(ctx) { DASHCHAT.context = ctx || ''; }

  function dashChat_renderSuggest(list) {
    var el = document.getElementById('c8dashchat-suggest');
    if (!el) return;
    el.innerHTML = list.map(function(q) { return '<button class="c8dashchat-suggest-chip">' + esc(q) + '</button>'; }).join('');
    el.querySelectorAll('.c8dashchat-suggest-chip').forEach(function(b) {
      b.addEventListener('click', function() {
        var input = document.getElementById('c8dashchat-input');
        if (!input) return;
        input.value = b.textContent;
        dashChat_send();
      });
    });
  }

  function dashChat_toggle() {
    DASHCHAT.open = !DASHCHAT.open;
    var panel = document.getElementById('c8dashchat-panel');
    var fab = document.getElementById('c8dashchat-fab');
    if (panel) {
      panel.classList.toggle('open', DASHCHAT.open);
      panel.setAttribute('aria-hidden', DASHCHAT.open ? 'false' : 'true');
    }
    if (fab) fab.classList.toggle('hidden', DASHCHAT.open);
    if (DASHCHAT.open) { var i = document.getElementById('c8dashchat-input'); if (i) i.focus(); }
  }

  function dashChat_open(prefill) {
    if (!DASHCHAT.open) dashChat_toggle();
    if (prefill) {
      var input = document.getElementById('c8dashchat-input');
      if (input) { input.value = prefill; input.focus(); }
    }
  }

  function dashChat_appendUser(text) {
    var el = document.getElementById('c8dashchat-messages'); if (!el) return;
    var d = document.createElement('div'); d.className = 'c8dashchat-msg user'; d.textContent = text;
    el.appendChild(d); el.scrollTop = el.scrollHeight;
  }
  function dashChat_appendBot(text) {
    var el = document.getElementById('c8dashchat-messages'); if (!el) return;
    var d = document.createElement('div'); d.className = 'c8dashchat-msg bot';
    d.innerHTML = text.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;')
      .replace(/\*\*(.+?)\*\*/g,'<strong>$1</strong>').replace(/\n/g, '<br>');
    el.appendChild(d); el.scrollTop = el.scrollHeight; return d;
  }
  function dashChat_appendTyping() {
    var el = document.getElementById('c8dashchat-messages'); if (!el) return null;
    var d = document.createElement('div'); d.className = 'c8dashchat-msg bot typing';
    d.innerHTML = '<span></span><span></span><span></span>';
    el.appendChild(d); el.scrollTop = el.scrollHeight; return d;
  }

  async function dashChat_send() {
    var input = document.getElementById('c8dashchat-input');
    if (!input) return;
    var text = input.value.trim();
    if (!text) return;
    input.value = ''; input.style.height='auto';
    dashChat_appendUser(text);
    DASHCHAT.messages.push({ role:'user', content: text });
    var t = dashChat_appendTyping();
    try {
      if (typeof CAMP8_AI === 'undefined') throw new Error('AI module not loaded');
      var system = 'You are Camp 8 AI, an elite recruiting advisor. Use this athlete context when answering:\n\n' + DASHCHAT.context + '\n\nBe specific, reference the athlete\'s actual numbers/offers/camps. Keep answers short — 2–4 sentences unless asked for a draft.';
      var reply = await CAMP8_AI.send({ messages: DASHCHAT.messages, system: system, max_tokens: 600 });
      if (t) t.remove();
      dashChat_appendBot(reply);
      DASHCHAT.messages.push({ role:'assistant', content: reply });
    } catch (err) {
      if (t) t.remove();
      dashChat_appendBot('Sorry — I hit an error reaching the AI. ' + (err && err.message ? err.message : ''));
    }
  }

  // ===========================================================
  // Public API
  // ===========================================================
  global.C8 = {
    calendar: {
      render: calendar_render,
      refresh: calendar_paint,
      close: calendar_closeDetail,
      openAdd: calendar_openAddModal,
      TYPE_STYLE: TYPE_STYLE
    },
    nilBars:  { render: nilBars_render },
    radar:    { render: radar_render, deriveFactors: radar_deriveFactors, FACTORS: RADAR_FACTORS },
    actionPlan: { render: actions_render },
    dashChat: { init: dashChat_init, open: dashChat_open, updateContext: dashChat_updateContext }
  };

})(window);
