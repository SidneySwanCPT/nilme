// ============================================
// Athletes by School — Map Logic
// ============================================

(function() {
  'use strict';

  // Initialize map
  const map = L.map('map', {
    center: [32.7, -83.5],
    zoom: 7,
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

  function starString(n) {
    return '★'.repeat(n) + '☆'.repeat(5 - n);
  }

  function getStarColor(stars) {
    if (stars === 5) return '#FFD700';
    if (stars === 4) return '#c41e3a';
    return '#4a90d9';
  }

  // Group recruits by school
  const schoolMap = {};
  RECRUITS.forEach(r => {
    const key = r.school;
    if (!schoolMap[key]) {
      schoolMap[key] = {
        school: r.school,
        city: r.city,
        lat: r.lat,
        lng: r.lng,
        recruits: []
      };
    }
    schoolMap[key].recruits.push(r);
  });

  const schools = Object.values(schoolMap).sort((a, b) => b.recruits.length - a.recruits.length);

  // Color based on recruit count
  function getSchoolColor(count) {
    if (count >= 4) return '#FFD700';
    if (count >= 3) return '#c41e3a';
    if (count >= 2) return '#e8872b';
    return '#4a90d9';
  }

  // Build popup
  function buildSchoolPopup(schoolData) {
    let html = `<div class="popup-content">`;
    html += `<h3>${schoolData.school}</h3>`;
    html += `<div style="font-size:0.75rem;color:var(--text-muted);margin-bottom:8px;">${schoolData.city} &middot; ${schoolData.recruits.length} recruit${schoolData.recruits.length > 1 ? 's' : ''}</div>`;
    html += '<div class="recruit-list">';

    // Sort by stars descending
    const sorted = [...schoolData.recruits].sort((a, b) => b.stars - a.stars);
    sorted.forEach(r => {
      const color = getStarColor(r.stars);
      html += `
        <div class="recruit-item">
          <div class="recruit-name">${r.name}</div>
          <div class="recruit-meta">
            <span class="stars" style="color:${color}">${starString(r.stars)}</span> &middot;
            ${r.pos} &middot; Class of ${r.classYear}
          </div>
        </div>
      `;
    });

    html += '</div></div>';
    return html;
  }

  // Add markers
  const markers = [];
  schools.forEach(schoolData => {
    const count = schoolData.recruits.length;
    const color = getSchoolColor(count);
    const baseRadius = 6 + count * 3;

    const marker = L.circleMarker([schoolData.lat, schoolData.lng], {
      radius: Math.min(baseRadius, 22),
      fillColor: color,
      color: color,
      weight: 1.5,
      opacity: 0.7,
      fillOpacity: 0.5
    }).addTo(map);

    marker.bindPopup(buildSchoolPopup(schoolData), { maxWidth: 320, maxHeight: 350 });

    marker.on('mouseover', function() {
      this.setStyle({ fillOpacity: 0.85, weight: 2.5, opacity: 1 });
    });
    marker.on('mouseout', function() {
      this.setStyle({ fillOpacity: 0.5, weight: 1.5, opacity: 0.7 });
    });

    markers.push({ marker, schoolData });
  });

  // Update sidebar stats
  document.getElementById('total-schools').textContent = schools.length;
  document.getElementById('total-recruits').textContent = RECRUITS.length;
  document.getElementById('avg-per-school').textContent = (RECRUITS.length / schools.length).toFixed(1);

  // Top schools list in sidebar
  const topContainer = document.getElementById('top-schools');
  schools.slice(0, 15).forEach((s, i) => {
    const color = getSchoolColor(s.recruits.length);
    const row = document.createElement('div');
    row.className = 'stat-row';
    row.style.cursor = 'pointer';
    row.innerHTML = `
      <span class="stat-label">
        <span style="color:${color};font-weight:700;width:20px;text-align:right;display:inline-block;margin-right:4px;">${i + 1}.</span>
        <span style="font-size:0.8rem;">${s.school}</span>
      </span>
      <span class="stat-value" style="color:${color}">${s.recruits.length}</span>
    `;
    row.addEventListener('click', () => {
      map.setView([s.lat, s.lng], 12);
      const m = markers.find(m => m.schoolData === s);
      if (m) m.marker.openPopup();
    });
    topContainer.appendChild(row);
  });

  // Populate table
  const tbody = document.getElementById('school-tbody');
  schools.forEach((s, i) => {
    const topStar = Math.max(...s.recruits.map(r => r.stars));
    const color = getSchoolColor(s.recruits.length);
    const starColor = getStarColor(topStar);
    const tr = document.createElement('tr');
    tr.style.cursor = 'pointer';
    tr.innerHTML = `
      <td>${i + 1}</td>
      <td class="school-name" style="color:${color}">${s.school}</td>
      <td>${s.city}</td>
      <td><strong>${s.recruits.length}</strong></td>
      <td><span style="color:${starColor}">${starString(topStar)}</span></td>
    `;
    tr.addEventListener('click', () => {
      map.setView([s.lat, s.lng], 12);
      const m = markers.find(m => m.schoolData === s);
      if (m) m.marker.openPopup();
    });
    tbody.appendChild(tr);
  });

  // Table sorting
  let currentSort = { key: 'count', dir: 'desc' };
  document.querySelectorAll('.data-table th').forEach(th => {
    th.addEventListener('click', () => {
      const key = th.dataset.sort;
      if (currentSort.key === key) {
        currentSort.dir = currentSort.dir === 'asc' ? 'desc' : 'asc';
      } else {
        currentSort.key = key;
        currentSort.dir = 'desc';
      }

      const rows = Array.from(tbody.querySelectorAll('tr'));
      rows.sort((a, b) => {
        const cells = { a: a.cells, b: b.cells };
        let valA, valB;

        switch(key) {
          case 'rank':
            valA = parseInt(cells.a[0].textContent);
            valB = parseInt(cells.b[0].textContent);
            break;
          case 'school':
            valA = cells.a[1].textContent.toLowerCase();
            valB = cells.b[1].textContent.toLowerCase();
            return currentSort.dir === 'asc'
              ? valA.localeCompare(valB)
              : valB.localeCompare(valA);
          case 'city':
            valA = cells.a[2].textContent.toLowerCase();
            valB = cells.b[2].textContent.toLowerCase();
            return currentSort.dir === 'asc'
              ? valA.localeCompare(valB)
              : valB.localeCompare(valA);
          case 'count':
            valA = parseInt(cells.a[3].textContent);
            valB = parseInt(cells.b[3].textContent);
            break;
          case 'topStar':
            valA = cells.a[4].textContent.split('★').length - 1;
            valB = cells.b[4].textContent.split('★').length - 1;
            break;
        }

        return currentSort.dir === 'asc' ? valA - valB : valB - valA;
      });

      rows.forEach(row => tbody.appendChild(row));
    });
  });
})();
