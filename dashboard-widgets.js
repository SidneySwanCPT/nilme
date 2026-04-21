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
  // 1) CAMPS CALENDAR
  // ===========================================================
  var CAL_STATE = { monthOffset: 0, camps: [], onPrep: null };

  function calendar_render(root, camps, opts) {
    CAL_STATE.camps = Array.isArray(camps) ? camps.slice() : [];
    CAL_STATE.onPrep = opts && opts.onPrep ? opts.onPrep : null;
    if (!root) return;
    root.innerHTML =
      '<div class="c8cal">' +
        '<div class="c8cal-main">' +
          '<div class="c8cal-head">' +
            '<button class="c8cal-nav" data-c8cal-nav="-1" aria-label="Previous month">‹</button>' +
            '<div class="c8cal-title" id="c8calTitle"></div>' +
            '<button class="c8cal-nav" data-c8cal-nav="1" aria-label="Next month">›</button>' +
            '<button class="c8cal-today" data-c8cal-nav="today">Today</button>' +
          '</div>' +
          '<div class="c8cal-dow">' + ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'].map(function(d){ return '<div>'+d+'</div>'; }).join('') + '</div>' +
          '<div class="c8cal-grid" id="c8calGrid"></div>' +
        '</div>' +
        '<aside class="c8cal-side">' +
          '<div class="c8cal-side-title">Upcoming camps</div>' +
          '<div class="c8cal-side-list" id="c8calSideList"></div>' +
        '</aside>' +
      '</div>' +
      '<div class="c8cal-detail" id="c8calDetail" aria-hidden="true"></div>';
    // Attach click delegate once per root element.
    if (!root._c8calBound) { root.addEventListener('click', calendar_clickDelegate); root._c8calBound = true; }
    calendar_paint();
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
    var eventEl = e.target.closest && e.target.closest('[data-c8cal-event]');
    if (eventEl) {
      calendar_openDetail(eventEl.getAttribute('data-c8cal-event'));
      return;
    }
    var closeBtn = e.target.closest && e.target.closest('[data-c8cal-close]');
    if (closeBtn) { calendar_closeDetail(); return; }
    // Click on backdrop (the overlay itself, not the sheet) closes the detail.
    if (e.target && e.target.id === 'c8calDetail' && e.target.classList.contains('open')) {
      calendar_closeDetail();
    }
  }

  function calendar_paint() {
    var today = new Date(); today.setHours(0,0,0,0);
    var view = new Date(today.getFullYear(), today.getMonth() + CAL_STATE.monthOffset, 1);
    var titleEl = document.getElementById('c8calTitle');
    if (titleEl) titleEl.textContent = view.toLocaleDateString('en-US', { month:'long', year:'numeric' });

    var gridEl = document.getElementById('c8calGrid');
    if (!gridEl) return;
    var firstDow = view.getDay();
    var daysInMonth = new Date(view.getFullYear(), view.getMonth()+1, 0).getDate();
    var prevMonthDays = new Date(view.getFullYear(), view.getMonth(), 0).getDate();

    // Index camps by yyyy-mm-dd
    var byDate = {};
    CAL_STATE.camps.forEach(function(c) {
      var d = parseCampStart(c.camp_dates);
      if (!d) return;
      var key = d.getFullYear() + '-' + (d.getMonth()+1) + '-' + d.getDate();
      (byDate[key] = byDate[key] || []).push(c);
    });

    var html = '';
    var cells = 42;
    for (var i = 0; i < cells; i++) {
      var dayNum, cellDate, inMonth = true;
      if (i < firstDow) {
        dayNum = prevMonthDays - firstDow + i + 1;
        cellDate = new Date(view.getFullYear(), view.getMonth()-1, dayNum);
        inMonth = false;
      } else if (i >= firstDow + daysInMonth) {
        dayNum = i - firstDow - daysInMonth + 1;
        cellDate = new Date(view.getFullYear(), view.getMonth()+1, dayNum);
        inMonth = false;
      } else {
        dayNum = i - firstDow + 1;
        cellDate = new Date(view.getFullYear(), view.getMonth(), dayNum);
      }
      var key = cellDate.getFullYear() + '-' + (cellDate.getMonth()+1) + '-' + cellDate.getDate();
      var events = byDate[key] || [];
      var isToday = sameDay(cellDate, today);

      html += '<div class="c8cal-cell' + (inMonth ? '' : ' out') + (isToday ? ' today' : '') + '">' +
        '<div class="c8cal-cell-num">' + dayNum + '</div>';
      events.slice(0, 3).forEach(function(ev) {
        var cls = 'c8cal-event tier-' + (ev.camp_tier || 3);
        if (ev.status === 'registered') cls += ' registered';
        html += '<button class="' + cls + '" data-c8cal-event="' + esc(ev.id) + '" title="' + esc(ev.camp_name) + '">' +
          '<span class="c8cal-ev-dot"></span>' + esc(ev.camp_name) +
        '</button>';
      });
      if (events.length > 3) html += '<div class="c8cal-more">+' + (events.length - 3) + ' more</div>';
      html += '</div>';
    }
    gridEl.innerHTML = html;

    // Side list — next 6 upcoming
    var upcoming = CAL_STATE.camps
      .map(function(c) { var d = parseCampStart(c.camp_dates); return { c: c, d: d }; })
      .filter(function(x) { return x.d && x.d >= today; })
      .sort(function(a, b) { return a.d - b.d })
      .slice(0, 6);
    var sideEl = document.getElementById('c8calSideList');
    if (sideEl) {
      if (!upcoming.length) {
        sideEl.innerHTML = '<div class="c8cal-empty">Nothing scheduled.<br><a href="camps.html">Browse camps →</a></div>';
      } else {
        sideEl.innerHTML = upcoming.map(function(x) {
          var days = daysBetween(today, x.d);
          var countdown = days === 0 ? 'Today' : days === 1 ? 'Tomorrow' : ('in ' + days + ' days');
          return '<button class="c8cal-side-item tier-' + (x.c.camp_tier || 3) + '" data-c8cal-event="' + esc(x.c.id) + '">' +
            '<div class="c8cal-side-date">' + fmt(x.d, { month:'short', day:'numeric' }) + '</div>' +
            '<div class="c8cal-side-body">' +
              '<div class="c8cal-side-name">' + esc(x.c.camp_name) + '</div>' +
              '<div class="c8cal-side-loc">' + esc(x.c.camp_city || '') + (x.c.camp_state ? ', ' + esc(x.c.camp_state) : '') + '</div>' +
              '<div class="c8cal-side-cd">' + countdown + '</div>' +
            '</div>' +
          '</button>';
        }).join('');
      }
    }
  }

  function calendar_openDetail(campId) {
    var camp = CAL_STATE.camps.find(function(c) { return String(c.id) === String(campId); });
    if (!camp) return;
    var el = document.getElementById('c8calDetail');
    if (!el) return;
    var d = parseCampStart(camp.camp_dates);
    var today = new Date(); today.setHours(0,0,0,0);
    var days = d ? daysBetween(today, d) : null;
    var tierLabel = camp.camp_tier === 1 ? 'Elite' : camp.camp_tier === 2 ? 'Showcase' : 'Regional';
    var register = camp.registration_url || (typeof CAMPS_DATA !== 'undefined' && (function() {
      var match = CAMPS_DATA.find(function(cd) { return cd.id === camp.camp_id; });
      return match ? match.registration_url : null;
    })());

    // Build AI prep timeline based on days-to-camp
    var prepTimeline = buildPrepTimeline(days);

    el.innerHTML =
      '<div class="c8cal-sheet" role="dialog" aria-modal="true">' +
        '<button class="c8cal-close" data-c8cal-close aria-label="Close">✕</button>' +
        '<div class="c8cal-sheet-tier tier-' + (camp.camp_tier || 3) + '">' + esc(tierLabel) + ' Camp</div>' +
        '<h3 class="c8cal-sheet-title">' + esc(camp.camp_name) + '</h3>' +
        '<div class="c8cal-sheet-meta">' +
          '<span>📅 ' + esc(camp.camp_dates || 'TBD') + '</span>' +
          '<span>📍 ' + esc(camp.camp_city || '') + (camp.camp_state ? ', ' + esc(camp.camp_state) : '') + '</span>' +
          (camp.status ? '<span class="c8cal-status ' + esc(camp.status) + '">' + esc(camp.status) + '</span>' : '') +
        '</div>' +
        (days != null ? '<div class="c8cal-countdown">' + (days === 0 ? 'Happening today' : days < 0 ? 'Past event' : (days + ' days out')) + '</div>' : '') +
        '<div class="c8cal-sheet-section-title">AI Prep Plan</div>' +
        '<div class="c8cal-prep">' + prepTimeline + '</div>' +
        '<div class="c8cal-sheet-actions">' +
          (register ? '<a class="c8cal-btn primary" href="' + esc(register) + '" target="_blank" rel="noopener">Register / More Info</a>' : '') +
          '<button class="c8cal-btn" data-c8cal-close>Close</button>' +
          (CAL_STATE.onPrep ? '<button class="c8cal-btn outline" id="c8calAskAi">Ask Camp 8 AI about this camp</button>' : '') +
        '</div>' +
      '</div>';
    el.setAttribute('aria-hidden', 'false');
    el.classList.add('open');

    var askBtn = document.getElementById('c8calAskAi');
    if (askBtn && CAL_STATE.onPrep) askBtn.addEventListener('click', function() { CAL_STATE.onPrep(camp); calendar_closeDetail(); });
  }

  function calendar_closeDetail() {
    var el = document.getElementById('c8calDetail');
    if (!el) return;
    el.classList.remove('open');
    el.setAttribute('aria-hidden', 'true');
    setTimeout(function() { el.innerHTML = ''; }, 180);
  }

  function buildPrepTimeline(days) {
    if (days == null) return '<div class="c8cal-prep-empty">Add a date to generate an AI prep plan.</div>';
    var milestones = [
      { cut: 45, title: '6+ weeks out', items: ['Start a camp-specific training block (position drills, 3x/week).','Book any travel/lodging and check medical paperwork.','Reach out to 2–3 coaches who will attend.'] },
      { cut: 21, title: '2–3 weeks out', items: ['Dial in your 40-yard-dash start.','Record new highlight reel for recruiters you want to see you.','Update your profile with latest stats.'] },
      { cut: 7,  title: 'Week of camp', items: ['Taper intensity — prioritize sleep + hydration.','Walk through the schedule with a parent/coach.','Prep gear bag: cleats, mouthpiece, two jerseys, ID.'] },
      { cut: 2,  title: '48 hours out', items: ['Light shakeout session only.','Pack camp day snacks + fluids.','Print roster confirmation and medical forms.'] },
      { cut: 0,  title: 'Camp day', items: ['Arrive 45 min early. Warm up sharp.','Introduce yourself to every coach by name + position.','Compete every rep. Film if allowed.'] },
      { cut: -9999, title: 'After the camp', items: ['Send personalized thank-you email within 24 hours.','Post 1 clip to IG/TikTok with @tags to the coaches.','Save your combine numbers to your dashboard.'] }
    ];
    var html = '';
    milestones.forEach(function(m, idx) {
      var active;
      if (days >= m.cut) {
        // find the next milestone cut (smaller number) to pick the right bucket
        var nextCut = idx < milestones.length - 1 ? milestones[idx+1].cut : -9999;
        active = days > nextCut;
      }
      if (days < 0 && m.cut === -9999) active = true;
      html +=
        '<div class="c8cal-prep-step' + (active ? ' active' : '') + '">' +
          '<div class="c8cal-prep-dot"></div>' +
          '<div class="c8cal-prep-body">' +
            '<div class="c8cal-prep-title">' + esc(m.title) + '</div>' +
            '<ul class="c8cal-prep-list">' + m.items.map(function(i){ return '<li>' + esc(i) + '</li>'; }).join('') + '</ul>' +
          '</div>' +
        '</div>';
    });
    return html;
  }

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
    calendar: { render: calendar_render, refresh: calendar_paint, close: calendar_closeDetail },
    nilBars:  { render: nilBars_render },
    radar:    { render: radar_render, deriveFactors: radar_deriveFactors, FACTORS: RADAR_FACTORS },
    actionPlan: { render: actions_render },
    dashChat: { init: dashChat_init, open: dashChat_open, updateContext: dashChat_updateContext }
  };

})(window);
