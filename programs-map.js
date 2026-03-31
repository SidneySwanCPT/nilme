// ============================================
// Program Success Heat Map — Map Logic
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

  // Dark tile layer
  L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
    maxZoom: 19,
    subdomains: 'abcd'
  }).addTo(map);

  // Attribution (minimal)
  L.control.attribution({ position: 'bottomleft', prefix: false })
    .addAttribution('&copy; <a href="https://carto.com/">CARTO</a>')
    .addTo(map);

  // Tier config
  function getTier(titles) {
    if (titles >= 8) return { name: 'Elite', color: '#FFD700', radius: 16, fillOpacity: 0.55, cssClass: 'elite' };
    if (titles >= 5) return { name: 'Powerhouse', color: '#c41e3a', radius: 13, fillOpacity: 0.5, cssClass: 'powerhouse' };
    if (titles >= 3) return { name: 'Contender', color: '#e8872b', radius: 11, fillOpacity: 0.45, cssClass: 'contender' };
    if (titles >= 1) return { name: 'Playoff Regular', color: '#4a90d9', radius: 8, fillOpacity: 0.4, cssClass: 'playoff' };
    return { name: 'Developing', color: '#666', radius: 5, fillOpacity: 0.3, cssClass: 'developing' };
  }

  // Build popup content
  function buildPopup(program) {
    const tier = getTier(program.titles);
    let yearsLine = '';
    if (program.years) {
      yearsLine = `<div style="margin-top:6px;font-size:0.75rem;color:#a0a0b8;"><strong style="color:#f0f0f0;">Years:</strong> ${program.years}</div>`;
    }
    const mpUrl = 'https://www.maxpreps.com/search/default.aspx?search=' + encodeURIComponent(program.school + ' ' + program.city + ' ' + (program.state||'')) + '&sport=football';
    return `
      <div class="popup-content">
        <h3>${program.school}</h3>
        <div class="popup-detail">
          <div><strong>City:</strong> ${program.city}, ${program.state || ''}</div>
          <div><strong>Championships:</strong> ${program.titles}</div>
          <div><strong>Classification:</strong> ${program.classification}</div>
        </div>
        ${yearsLine}
        <span class="popup-badge ${tier.cssClass}">${tier.name}</span>
        <div style="margin-top:10px;">
          <a href="${mpUrl}" target="_blank" rel="noopener" style="display:inline-flex;align-items:center;gap:5px;padding:4px 12px;background:rgba(255,255,255,0.06);border:1px solid rgba(255,255,255,0.12);border-radius:100px;font-size:0.72rem;font-weight:700;color:#eeeef8;text-decoration:none;">
            MaxPreps Football →
          </a>
        </div>
      </div>
    `;
  }

  // Add markers
  const markers = [];
  PROGRAMS.forEach(p => {
    const tier = getTier(p.titles);
    const marker = L.circleMarker([p.lat, p.lng], {
      radius: tier.radius,
      fillColor: tier.color,
      color: tier.color,
      weight: 1.5,
      opacity: 0.7,
      fillOpacity: tier.fillOpacity
    }).addTo(map);

    marker.bindPopup(buildPopup(p), { maxWidth: 280, className: 'dark-popup' });

    // Hover effect
    marker.on('mouseover', function() {
      this.setStyle({ fillOpacity: 0.85, weight: 2.5, opacity: 1 });
      this.setRadius(tier.radius + 3);
    });
    marker.on('mouseout', function() {
      this.setStyle({ fillOpacity: tier.fillOpacity, weight: 1.5, opacity: 0.7 });
      this.setRadius(tier.radius);
    });

    markers.push({ marker, program: p, tier });
  });

  // Update sidebar stats
  const tiers = { elite: 0, powerhouse: 0, contender: 0, playoff: 0, developing: 0 };
  let totalChamps = 0;

  PROGRAMS.forEach(p => {
    const tier = getTier(p.titles);
    totalChamps += p.titles;
    if (p.titles >= 8) tiers.elite++;
    else if (p.titles >= 5) tiers.powerhouse++;
    else if (p.titles >= 3) tiers.contender++;
    else if (p.titles >= 1) tiers.playoff++;
    else tiers.developing++;
  });

  document.getElementById('total-programs').textContent = PROGRAMS.length;
  document.getElementById('total-championships').textContent = totalChamps;
  document.getElementById('count-elite').textContent = tiers.elite;
  document.getElementById('count-powerhouse').textContent = tiers.powerhouse;
  document.getElementById('count-contender').textContent = tiers.contender;
  document.getElementById('count-playoff').textContent = tiers.playoff;
  document.getElementById('count-developing').textContent = tiers.developing;

  // Top programs list
  const topPrograms = [...PROGRAMS].sort((a, b) => b.titles - a.titles).slice(0, 10);
  const topContainer = document.getElementById('top-programs');
  topPrograms.forEach((p, i) => {
    const tier = getTier(p.titles);
    const mpUrl = 'https://www.maxpreps.com/search/default.aspx?search=' + encodeURIComponent(p.school + ' ' + p.city + ' ' + (p.state||'')) + '&sport=football';
    const row = document.createElement('div');
    row.className = 'stat-row';
    row.style.cursor = 'pointer';
    row.innerHTML = `
      <span class="stat-label">
        <span style="color:${tier.color};font-weight:700;width:18px;text-align:right;display:inline-block;margin-right:4px;">${i + 1}.</span>
        ${p.school}
      </span>
      <div style="display:flex;align-items:center;gap:6px;">
        <span class="stat-value" style="color:${tier.color}">${p.titles}</span>
        <a href="${mpUrl}" target="_blank" rel="noopener" onclick="event.stopPropagation()" style="font-size:0.62rem;padding:1px 6px;border-radius:100px;border:1px solid rgba(255,255,255,0.12);color:var(--text-muted);text-decoration:none;white-space:nowrap;">MP</a>
      </div>
    `;
    row.addEventListener('click', () => {
      map.setView([p.lat, p.lng], 12);
      const m = markers.find(m => m.program === p);
      if (m) m.marker.openPopup();
    });
    topContainer.appendChild(row);
  });
})();
