// ============================================
// Top Recruits Map — Map Logic
// ============================================

(function() {
  'use strict';

  // Initialize map
  const map = L.map('map', {
    center: [32.5, -95.0],
    zoom: 5,
    zoomControl: true,
    attributionControl: false
  });

  L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
    maxZoom: 19,
    subdomains: 'abcd'
  }).addTo(map);

  L.control.attribution({ position: 'bottomleft', prefix: false })
    .addAttribution('&copy; <a href="https://carto.com/">CARTO</a>')
    .addTo(map);

  // Star rating config
  function getStarConfig(stars) {
    if (stars === 5) return { color: '#FFD700', radius: 10, fillOpacity: 0.7 };
    if (stars === 4) return { color: '#c41e3a', radius: 8, fillOpacity: 0.6 };
    return { color: '#4a90d9', radius: 6, fillOpacity: 0.5 };
  }

  function starString(n) {
    return '★'.repeat(n) + '☆'.repeat(5 - n);
  }

  // Active filters
  let activeFilters = { year: 'all', stars: 'all', pos: 'all', state: 'all' };

  // Cluster group
  let clusterGroup = L.markerClusterGroup({
    maxClusterRadius: 35,
    spiderfyOnMaxZoom: true,
    showCoverageOnHover: false,
    iconCreateFunction: function(cluster) {
      const count = cluster.getChildCount();
      let size = 'small';
      if (count > 10) size = 'large';
      else if (count > 5) size = 'medium';
      return L.divIcon({
        html: '<div>' + count + '</div>',
        className: 'marker-cluster marker-cluster-' + size,
        iconSize: L.point(40, 40)
      });
    }
  });
  map.addLayer(clusterGroup);

  // Build popup for a group of recruits at same location
  function buildGroupPopup(recruits) {
    const city = recruits[0].city;
    const stateLabel = recruits[0].state || '';
    let html = `<div class="popup-content"><h3>${city}${stateLabel ? ', ' + stateLabel : ''}</h3>`;
    html += `<div style="font-size:0.75rem;color:var(--text-muted);margin-bottom:8px;">${recruits.length} recruit${recruits.length > 1 ? 's' : ''}</div>`;
    html += '<div class="recruit-list">';
    recruits.forEach(r => {
      const cfg = getStarConfig(r.stars);
      // Profile links
      let links = '';
      if (r.links247) links += `<a href="${r.links247}" target="_blank" rel="noopener" class="profile-link" title="247Sports">247</a>`;
      if (r.linksOn3) links += `<a href="${r.linksOn3}" target="_blank" rel="noopener" class="profile-link" title="On3">On3</a>`;
      if (r.linksHudl) links += `<a href="${r.linksHudl}" target="_blank" rel="noopener" class="profile-link" title="Hudl">Hudl</a>`;
      // Commit badge
      const commitBadge = r.commit
        ? `<span style="display:inline-block;padding:1px 7px;border-radius:100px;font-size:0.65rem;font-weight:700;background:rgba(212,168,67,0.15);color:var(--gold);margin-left:4px;">→ ${r.commit}</span>`
        : '';
      html += `
        <div class="recruit-item">
          <div class="recruit-name">${r.name}${commitBadge}</div>
          <div class="recruit-meta">
            <span class="stars" style="color:${cfg.color}">${starString(r.stars)}</span> &middot;
            ${r.pos} &middot; Class of ${r.classYear}
          </div>
          <div class="recruit-meta">${r.school}</div>
          ${links ? `<div class="profile-links">${links}</div>` : ''}
        </div>
      `;
    });
    html += '</div></div>';
    return html;
  }

  // Render markers based on filters
  function renderMarkers() {
    clusterGroup.clearLayers();

    const filtered = RECRUITS.filter(r => {
      if (activeFilters.year !== 'all' && r.classYear !== parseInt(activeFilters.year)) return false;
      if (activeFilters.stars !== 'all' && r.stars !== parseInt(activeFilters.stars)) return false;
      if (activeFilters.state !== 'all' && r.state !== activeFilters.state) return false;
      if (activeFilters.pos !== 'all') {
        const posValues = activeFilters.pos.split(',');
        if (!posValues.includes(r.pos)) return false;
      }
      return true;
    });

    // Group by location
    const groups = {};
    filtered.forEach(r => {
      const key = `${r.lat},${r.lng}`;
      if (!groups[key]) groups[key] = [];
      groups[key].push(r);
    });

    Object.values(groups).forEach(group => {
      // Use the highest-rated recruit's color for the marker
      const topRecruit = group.reduce((a, b) => b.stars > a.stars ? b : a, group[0]);
      const cfg = getStarConfig(topRecruit.stars);

      const marker = L.circleMarker([group[0].lat, group[0].lng], {
        radius: cfg.radius + Math.min(group.length * 1.5, 6),
        fillColor: cfg.color,
        color: cfg.color,
        weight: 1.5,
        opacity: 0.7,
        fillOpacity: cfg.fillOpacity
      });

      marker.bindPopup(buildGroupPopup(group), { maxWidth: 320, maxHeight: 350 });

      marker.on('mouseover', function() {
        this.setStyle({ fillOpacity: 0.9, weight: 2.5, opacity: 1 });
      });
      marker.on('mouseout', function() {
        this.setStyle({ fillOpacity: cfg.fillOpacity, weight: 1.5, opacity: 0.7 });
      });

      clusterGroup.addLayer(marker);
    });

    updateStats(filtered);
  }

  // Update stats panel
  function updateStats(filtered) {
    const stars5 = filtered.filter(r => r.stars === 5).length;
    const stars4 = filtered.filter(r => r.stars === 4).length;
    const stars3 = filtered.filter(r => r.stars === 3).length;

    document.getElementById('showing-count').textContent = filtered.length;
    document.getElementById('count-5star').textContent = stars5;
    document.getElementById('count-4star').textContent = stars4;
    document.getElementById('count-3star').textContent = stars3;

    // Position breakdown
    const posMap = {};
    filtered.forEach(r => {
      const pos = r.pos;
      posMap[pos] = (posMap[pos] || 0) + 1;
    });

    const posContainer = document.getElementById('pos-breakdown');
    posContainer.innerHTML = '';

    const sortedPositions = Object.entries(posMap).sort((a, b) => b[1] - a[1]);
    sortedPositions.forEach(([pos, count]) => {
      const row = document.createElement('div');
      row.className = 'stat-row';
      row.innerHTML = `
        <span class="stat-label">${pos}</span>
        <span class="stat-value">${count}</span>
      `;
      posContainer.appendChild(row);
    });
  }

  // Filter button handlers
  function setupFilterGroup(groupId, filterKey) {
    const container = document.getElementById(groupId);
    const buttons = container.querySelectorAll('.filter-btn');

    buttons.forEach(btn => {
      btn.addEventListener('click', () => {
        buttons.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        activeFilters[filterKey] = btn.dataset.value;
        renderMarkers();
      });
    });
  }

  setupFilterGroup('filter-year', 'year');
  setupFilterGroup('filter-stars', 'stars');
  setupFilterGroup('filter-pos', 'pos');
  setupFilterGroup('filter-state', 'state');

  // Initial render
  renderMarkers();
})();
