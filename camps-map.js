// ============================================
// Prospect Camps Map + List Logic
// ============================================

(function () {
  'use strict';

  // ---- State ----
  let map;
  let markerCluster;
  let allMarkers = [];
  let currentView = 'map';
  let filters = {
    type: 'all',
    tier: 'all',
    division: 'all',
    state: 'all',
    access: 'all',
    search: ''
  };
  let sortField = 'tier';
  let sortAsc = true;

  // ---- Tier colors ----
  const TIER_COLORS = {
    1: '#FFD700',
    2: '#c41e3a',
    3: '#e8872b',
    4: '#4a90d9',
    5: '#7a7a9a'
  };

  const TIER_SIZES = {
    1: 12,
    2: 10,
    3: 9,
    4: 8,
    5: 7
  };

  // ---- Initialize ----
  function init() {
    initMap();
    populateStateDropdowns();
    buildMarkers();
    renderList();
    applyFilters();
  }

  function initMap() {
    map = L.map('map', {
      center: [39.5, -98.35],
      zoom: 4,
      minZoom: 3,
      maxZoom: 18,
      zoomControl: true
    });

    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
      attribution: '&copy; <a href="https://carto.com/">CARTO</a>',
      subdomains: 'abcd',
      maxZoom: 19
    }).addTo(map);

    markerCluster = L.markerClusterGroup({
      maxClusterRadius: 40,
      spiderfyOnMaxZoom: true,
      showCoverageOnHover: false,
      iconCreateFunction: function (cluster) {
        var count = cluster.getChildCount();
        var size = count < 10 ? 'small' : count < 30 ? 'medium' : 'large';
        return L.divIcon({
          html: '<div><span>' + count + '</span></div>',
          className: 'marker-cluster marker-cluster-' + size,
          iconSize: L.point(40, 40)
        });
      }
    });

    map.addLayer(markerCluster);
  }

  function populateStateDropdowns() {
    var states = {};
    CAMPS_DATA.forEach(function (c) {
      if (c.state) states[c.state] = (states[c.state] || 0) + 1;
    });

    var sorted = Object.keys(states).sort();
    var html = '<option value="all">All States (' + CAMPS_DATA.length + ')</option>';
    sorted.forEach(function (s) {
      html += '<option value="' + s + '">' + s + ' (' + states[s] + ')</option>';
    });

    document.getElementById('stateFilter').innerHTML = html;
    document.getElementById('listStateFilter').innerHTML = html;
  }

  // ---- Markers ----
  function buildMarkers() {
    allMarkers = [];
    CAMPS_DATA.forEach(function (camp) {
      if (!camp.lat || !camp.lng) return;

      var color = TIER_COLORS[camp.tier] || '#7a7a9a';
      var size = TIER_SIZES[camp.tier] || 8;

      var icon = L.divIcon({
        className: 'camp-marker-wrap',
        html: '<div class="camp-marker" style="width:' + size + 'px;height:' + size + 'px;background:' + color + ';"></div>',
        iconSize: [size + 4, size + 4],
        iconAnchor: [(size + 4) / 2, (size + 4) / 2]
      });

      var marker = L.marker([camp.lat, camp.lng], { icon: icon });
      marker.campData = camp;
      marker.bindPopup(function () { return buildPopup(camp); }, {
        maxWidth: 360,
        minWidth: 260,
        className: 'camp-popup-wrapper'
      });

      allMarkers.push(marker);
    });
  }

  function buildPopup(camp) {
    var tierClass = 'tier-' + camp.tier;
    var tierLabel = camp.tierLabel;

    var html = '<div class="camp-popup">';
    html += '<h3>' + esc(camp.name) + '</h3>';

    // Badges
    html += '<div class="camp-popup-badges">';
    html += '<span class="tier-badge ' + tierClass + '">' + tierLabel + '</span>';
    if (camp.division && camp.division !== 'N/A') {
      html += ' <span class="div-badge">' + esc(camp.division) + '</span>';
    }
    if (camp.inviteOnly) {
      html += ' <span class="invite-badge">Invite Only</span>';
    } else {
      html += ' <span class="open-badge">Open</span>';
    }
    html += '</div>';

    // Details
    html += '<div class="camp-popup-detail">';
    html += '<div class="detail-row"><span class="detail-icon">📍</span><span><strong>' + esc(camp.city) + ', ' + esc(camp.stateAbbrev) + '</strong></span></div>';
    html += '<div class="detail-row"><span class="detail-icon">📅</span><span>' + esc(camp.dates || 'TBD') + '</span></div>';
    if (camp.cost) {
      html += '<div class="detail-row"><span class="detail-icon">💲</span><span>' + esc(camp.cost) + '</span></div>';
    }
    if (camp.ages) {
      html += '<div class="detail-row"><span class="detail-icon">👤</span><span>' + esc(camp.ages) + '</span></div>';
    }
    if (camp.host && camp.host !== camp.name) {
      html += '<div class="detail-row"><span class="detail-icon">🏟</span><span>' + esc(camp.host) + '</span></div>';
    }
    if (camp.conference) {
      html += '<div class="detail-row"><span class="detail-icon">🏆</span><span>' + esc(camp.conference) + '</span></div>';
    }
    html += '</div>';

    // Description
    if (camp.description) {
      var desc = camp.description.length > 200 ? camp.description.substring(0, 200) + '...' : camp.description;
      html += '<div class="camp-popup-desc">' + esc(desc) + '</div>';
    }

    // Registration link
    if (camp.registrationUrl) {
      html += '<a href="' + esc(camp.registrationUrl) + '" target="_blank" rel="noopener" class="camp-popup-register">';
      html += '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>';
      html += ' Register</a>';
    }

    html += '</div>';
    return html;
  }

  // ---- Filtering ----
  window.setFilter = function (category, value, btn) {
    filters[category] = value;

    // Update active state
    var container = btn.parentElement;
    container.querySelectorAll('.filter-btn').forEach(function (b) {
      b.classList.remove('active');
    });
    btn.classList.add('active');

    applyFilters();
  };

  window.applyFilters = function () {
    // Sync search
    var searchEl = document.getElementById('campSearch');
    var listSearchEl = document.getElementById('listSearch');
    filters.search = (searchEl ? searchEl.value : '').toLowerCase().trim();
    if (listSearchEl && listSearchEl.value !== searchEl.value) {
      listSearchEl.value = searchEl.value;
    }

    // Sync state filter
    var stateEl = document.getElementById('stateFilter');
    var listStateEl = document.getElementById('listStateFilter');
    if (stateEl) filters.state = stateEl.value;
    if (listStateEl && listStateEl.value !== stateEl.value) {
      listStateEl.value = stateEl.value;
    }

    // Filter markers on map
    markerCluster.clearLayers();
    var visibleCount = 0;

    allMarkers.forEach(function (marker) {
      if (passesFilter(marker.campData)) {
        markerCluster.addLayer(marker);
        visibleCount++;
      }
    });

    // Update count badge
    document.getElementById('campCount').textContent = visibleCount + ' camp' + (visibleCount !== 1 ? 's' : '');

    // Update list
    renderList();
  };

  window.resetFilters = function () {
    filters = { type: 'all', tier: 'all', division: 'all', state: 'all', access: 'all', search: '' };

    // Reset all filter button groups
    document.querySelectorAll('.filter-buttons').forEach(function (group) {
      group.querySelectorAll('.filter-btn').forEach(function (btn, idx) {
        btn.classList.toggle('active', idx === 0);
      });
    });

    // Reset dropdowns
    document.getElementById('stateFilter').value = 'all';
    document.getElementById('listStateFilter').value = 'all';
    document.getElementById('listTypeFilter').value = 'all';
    document.getElementById('listTierFilter').value = 'all';
    document.getElementById('listDivFilter').value = 'all';

    // Reset search
    document.getElementById('campSearch').value = '';
    document.getElementById('listSearch').value = '';

    applyFilters();
  };

  window.syncListFilter = function (category, value) {
    filters[category] = value;
    applyFilters();
  };

  function passesFilter(camp) {
    if (filters.type !== 'all' && camp.hostType !== filters.type) return false;
    if (filters.tier !== 'all' && String(camp.tier) !== filters.tier) return false;
    if (filters.division !== 'all') {
      var div = camp.division.toUpperCase();
      var filterDiv = filters.division.toUpperCase();
      if (filterDiv === 'JUCO') {
        if (!div.includes('JUCO')) return false;
      } else {
        if (div !== filterDiv) return false;
      }
    }
    if (filters.state !== 'all' && camp.state !== filters.state) return false;
    if (filters.access === 'invite' && !camp.inviteOnly) return false;
    if (filters.access === 'open' && camp.inviteOnly) return false;
    if (filters.search) {
      var hay = (camp.name + ' ' + camp.host + ' ' + camp.university + ' ' + camp.city + ' ' + camp.state + ' ' + camp.description).toLowerCase();
      if (hay.indexOf(filters.search) === -1) return false;
    }
    return true;
  }

  // ---- List View ----
  function renderList() {
    var filtered = CAMPS_DATA.filter(passesFilter);

    // Sort
    filtered.sort(function (a, b) {
      var av = getSortValue(a, sortField);
      var bv = getSortValue(b, sortField);
      if (av < bv) return sortAsc ? -1 : 1;
      if (av > bv) return sortAsc ? 1 : -1;
      return 0;
    });

    var tbody = document.getElementById('campsTableBody');
    if (!tbody) return;

    var html = '';
    filtered.forEach(function (camp) {
      var tierClass = 'tier-' + camp.tier;
      html += '<tr>';
      html += '<td class="camp-name-cell">';
      if (camp.registrationUrl) {
        html += '<a href="' + esc(camp.registrationUrl) + '" target="_blank" rel="noopener">' + esc(camp.name) + '</a>';
      } else {
        html += esc(camp.name);
      }
      html += '</td>';
      html += '<td>' + esc(camp.host || camp.university || '') + '</td>';
      html += '<td>' + esc(camp.city) + ', ' + esc(camp.stateAbbrev) + '</td>';
      html += '<td>' + esc(camp.dates || 'TBD') + '</td>';
      html += '<td><span class="tier-badge ' + tierClass + '">' + esc(camp.tierLabel) + '</span></td>';
      html += '<td><span class="div-badge">' + esc(camp.division || 'N/A') + '</span></td>';
      html += '<td>' + esc(camp.cost || '—') + '</td>';
      html += '<td>';
      if (camp.inviteOnly) {
        html += '<span class="invite-badge">Invite</span>';
      } else {
        html += '<span class="open-badge">Open</span>';
      }
      html += '</td>';
      html += '</tr>';
    });

    tbody.innerHTML = html;
  }

  function getSortValue(camp, field) {
    switch (field) {
      case 'name': return camp.name.toLowerCase();
      case 'host': return (camp.host || camp.university || '').toLowerCase();
      case 'state': return camp.state.toLowerCase();
      case 'dates': return camp.dates || 'zzz';
      case 'tier': return camp.tier;
      case 'division': return camp.division || 'zzz';
      case 'cost': return camp.cost || 'zzz';
      default: return camp.tier;
    }
  }

  window.sortTable = function (field) {
    if (sortField === field) {
      sortAsc = !sortAsc;
    } else {
      sortField = field;
      sortAsc = true;
    }
    renderList();
  };

  // ---- View Toggle ----
  window.switchView = function (view) {
    currentView = view;
    document.querySelectorAll('.view-btn').forEach(function (btn) {
      btn.classList.toggle('active', btn.dataset.view === view);
    });

    var mapViewEl = document.getElementById('mapView');
    var listViewEl = document.getElementById('listView');

    if (view === 'map') {
      mapViewEl.style.display = '';
      listViewEl.style.display = 'none';
      map.invalidateSize();
    } else {
      mapViewEl.style.display = 'none';
      listViewEl.style.display = '';
      renderList();
    }
  };

  // ---- Utilities ----
  function esc(str) {
    if (!str) return '';
    var div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }

  // ---- Auto-open camp from URL param (e.g. camps.html?openCamp=123) ----
  function checkAutoOpen() {
    var params = new URLSearchParams(window.location.search);
    var campId = params.get('openCamp');
    if (!campId) return;

    var targetId = parseInt(campId);
    // Find the camp data
    var camp = CAMPS_DATA.find(function(c) { return c.id === targetId; });
    if (!camp || !camp.lat || !camp.lng) return;

    // Fly the map to that camp
    map.setView([camp.lat, camp.lng], 10);

    // Find and open the matching marker
    var found = allMarkers.find(function(m) {
      return m.campData && m.campData.id === targetId;
    });

    if (found) {
      // Small delay to let map settle
      setTimeout(function() {
        markerCluster.zoomToShowLayer(found, function() {
          found.openPopup();
        });
      }, 500);
    }
  }

  // ---- Boot ----
  function initAndCheck() {
    init();
    // After markers are built, check for auto-open
    setTimeout(checkAutoOpen, 800);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initAndCheck);
  } else {
    initAndCheck();
  }
})();

// ============================================
// CALENDAR VIEW
// ============================================
(function() {
  'use strict';

  var calYear  = new Date().getFullYear();
  var calMonth = new Date().getMonth();
  var TC = {1:'#FFD700',2:'#c41e3a',3:'#e8872b',4:'#4a90d9',5:'#7a7a9a'};
  var MONTHS = ['January','February','March','April','May','June',
                'July','August','September','October','November','December'];

  function parseCalDate(str) {
    if (!str) return null;
    var clean = str.split('\u2013')[0].split('\u2014')[0].split('-')[0].trim();
    var d = new Date(clean);
    if (!isNaN(d)) return d;
    d = new Date(clean + ' 1');
    return isNaN(d) ? null : d;
  }

  function buildCalendar() {
    if (typeof CAMPS_DATA === 'undefined') return;
    var title = document.getElementById('calMonthTitle');
    if (title) title.textContent = MONTHS[calMonth] + ' ' + calYear;

    var grid = document.getElementById('calGrid');
    if (!grid) return;
    grid.innerHTML = '';

    // Build map of day -> camps for this month
    var dayMap = {};
    CAMPS_DATA.forEach(function(c) {
      var d = parseCalDate(c.dates);
      if (!d) return;
      if (d.getFullYear() !== calYear || d.getMonth() !== calMonth) return;
      var day = d.getDate();
      if (!dayMap[day]) dayMap[day] = [];
      dayMap[day].push(c);
    });

    var firstDay = new Date(calYear, calMonth, 1).getDay();
    var daysInMonth = new Date(calYear, calMonth + 1, 0).getDate();
    var prevDays = new Date(calYear, calMonth, 0).getDate();
    var today = new Date(); today.setHours(0,0,0,0);

    // Previous month cells
    for (var i = firstDay - 1; i >= 0; i--) {
      var cell = document.createElement('div');
      cell.className = 'cal-cell other-month';
      cell.innerHTML = '<div class="cal-day-num">' + (prevDays - i) + '</div>';
      grid.appendChild(cell);
    }

    // Current month cells
    for (var d = 1; d <= daysInMonth; d++) {
      var cellDate = new Date(calYear, calMonth, d);
      var cell = document.createElement('div');
      var isToday = cellDate.getTime() === today.getTime();
      var camps = dayMap[d] || [];
      cell.className = 'cal-cell' + (isToday ? ' today' : '') + (camps.length ? ' has-camps' : '');
      
      var html = '<div class="cal-day-num">' + d + '</div>';
      var showCount = Math.min(camps.length, 3);
      
      camps.slice(0, showCount).forEach(function(camp) {
        var color = TC[camp.tier] || '#7a7a9a';
        html += '<div class="cal-camp-dot" onclick="showCalDay(' + d + ',event)">' +
          '<span class="cal-dot-color" style="background:' + color + '"></span>' +
          esc(camp.name) + '</div>';
      });

      if (camps.length > showCount) {
        html += '<div class="cal-more-badge" onclick="showCalDay(' + d + ',event)">+' + (camps.length - showCount) + ' more</div>';
      }

      cell.innerHTML = html;
      if (camps.length) {
        (function(day) {
          cell.addEventListener('click', function(e) {
            if (e.target === cell) showCalDay(day, e);
          });
        })(d);
      }
      grid.appendChild(cell);
    }

    // Next month filler
    var total = firstDay + daysInMonth;
    var remaining = total % 7 === 0 ? 0 : 7 - (total % 7);
    for (var n = 1; n <= remaining; n++) {
      var cell = document.createElement('div');
      cell.className = 'cal-cell other-month';
      cell.innerHTML = '<div class="cal-day-num">' + n + '</div>';
      grid.appendChild(cell);
    }
  }

  window.showCalDay = function(day, e) {
    if (e) e.stopPropagation();
    var camps = [];
    CAMPS_DATA.forEach(function(c) {
      var d = parseCalDate(c.dates);
      if (d && d.getFullYear() === calYear && d.getMonth() === calMonth && d.getDate() === day) {
        camps.push(c);
      }
    });

    var detail = document.getElementById('calDayDetail');
    var detailDate = document.getElementById('calDetailDate');
    var detailList = document.getElementById('calDetailList');
    if (!detail) return;

    detailDate.textContent = MONTHS[calMonth] + ' ' + day + ', ' + calYear + ' — ' + camps.length + ' camp' + (camps.length !== 1 ? 's' : '');
    detailList.innerHTML = '';

    camps.forEach(function(camp) {
      var color = TC[camp.tier] || '#7a7a9a';
      var item = document.createElement('a');
      item.className = 'cal-detail-item';
      item.href = 'camps.html?openCamp=' + camp.id;
      item.innerHTML =
        '<div class="cal-detail-dot" style="background:' + color + '"></div>' +
        '<div class="cal-detail-name">' + esc(camp.name) + '</div>' +
        '<div class="cal-detail-loc">' + esc(camp.city) + ', ' + esc(camp.stateAbbrev) + '</div>' +
        '<div class="cal-detail-tier" style="color:' + color + '">' + esc(camp.tierLabel) + '</div>';
      detailList.appendChild(item);
    });

    detail.style.display = 'block';
    detail.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  };

  window.calNav = function(dir) {
    calMonth += dir;
    if (calMonth > 11) { calMonth = 0; calYear++; }
    if (calMonth < 0)  { calMonth = 11; calYear--; }
    document.getElementById('calDayDetail').style.display = 'none';
    buildCalendar();
  };

  // Hook into switchView
  var origSwitch = window.switchView;
  window.switchView = function(view) {
    origSwitch(view);
    var calEl = document.getElementById('calendarView');
    if (!calEl) return;
    if (view === 'calendar') {
      calEl.style.display = '';
      buildCalendar();
      // Hide map and list
      var mapEl = document.getElementById('mapView');
      var listEl = document.getElementById('listView');
      if (mapEl) mapEl.style.display = 'none';
      if (listEl) listEl.style.display = 'none';
    } else {
      calEl.style.display = 'none';
    }
  };

  function esc(s) {
    var d = document.createElement('div');
    d.textContent = String(s || '');
    return d.innerHTML;
  }

  // Auto-initialize if calendar is current view (it won't be by default)
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function() {
      // start calendar at current month but don't show — user must click
    });
  }
})();
