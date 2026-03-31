// ============================================
// Camp 8 — Universal Navigation
// Edit this ONE file to update nav on ALL pages
// ============================================

(function () {
  'use strict';

  const NAV_HTML = `
<nav class="nav" id="camp8-nav">
  <a href="index.html" class="nav-brand">
    <svg viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M16 2C10 2 4 8 4 16s6 14 12 14c2 0 4-2 4-4v-1c0-1-.5-2-1-2.5-.5-.5-1-1.5-1-2.5 0-2 1.5-3.5 3.5-3.5H25c3.3 0 6-2.7 6-6C31 7.5 24.5 2 16 2z" fill="#d4a843" opacity="0.15"/>
      <ellipse cx="16" cy="16" rx="10" ry="7" stroke="#d4a843" stroke-width="2" fill="none"/>
      <path d="M16 9v14M10 12.5c2-1.5 4-2 6-2s4 .5 6 2" stroke="#d4a843" stroke-width="1.5" stroke-linecap="round" fill="none"/>
      <path d="M10 19.5c2 1.5 4 2 6 2s4-.5 6-2" stroke="#d4a843" stroke-width="1.5" stroke-linecap="round" fill="none"/>
    </svg>
    <span class="nav-brand-text">Camp <span>8</span></span>
  </a>

  <button class="nav-toggle" id="navToggle" aria-label="Toggle menu">
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
      <line x1="3" y1="6" x2="21" y2="6"/>
      <line x1="3" y1="12" x2="21" y2="12"/>
      <line x1="3" y1="18" x2="21" y2="18"/>
    </svg>
  </button>

  <ul class="nav-links" id="navLinks">

    <!-- NIL Central with anchor dropdowns -->
    <li class="nav-dropdown">
      <a href="nil-central.html" class="nav-dropdown-trigger">
        NIL Central
        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="6 9 12 15 18 9"/></svg>
      </a>
      <ul class="nav-dropdown-menu">
        <li><a href="nil-central.html#nil-rating">
          <span class="ddm-icon">⭐</span>NIL Rating Tool
        </a></li>
        <li><a href="nil-central.html#nil-rules">
          <span class="ddm-icon">📋</span>Rules &amp; Regulations
        </a></li>
        <li><a href="nil-central.html#nil-deals">
          <span class="ddm-icon">💰</span>Deals Tracker
        </a></li>
        <li><a href="nil-sponsors.html">
          <span class="ddm-icon">🤝</span>Sponsor Directory
        </a></li>
      </ul>
    </li>

    <!-- Recruiting dropdown -->
    <li class="nav-dropdown">
      <a href="recruits.html" class="nav-dropdown-trigger">
        Recruiting
        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="6 9 12 15 18 9"/></svg>
      </a>
      <ul class="nav-dropdown-menu">
        <li><a href="recruits.html">
          <span class="ddm-icon">🗺️</span>Recruit Map
        </a></li>
        <li><a href="camps.html">
          <span class="ddm-icon">🏕️</span>Prospect Camps
        </a></li>
        <li><a href="combine-eval.html">
          <span class="ddm-icon">⚡</span>Combine Evaluator
        </a></li>
        <li><a href="powerhouse.html">
          <span class="ddm-icon">🏆</span>Powerhouse Central
        </a></li>
        <li class="ddm-divider"></li>
        <li><a href="commitments.html">
          <span class="ddm-icon">✅</span>Commitment Tracker
        </a></li>
        <li><a href="transfer-portal.html">
          <span class="ddm-icon">🔄</span>Transfer Portal
        </a></li>
      </ul>
    </li>

  </ul>

  <!-- External resource links -->
  <div class="nav-external">
    <a href="https://www.hudl.com" target="_blank" rel="noopener" class="ext-btn" title="Hudl">Hudl</a>
    <a href="https://www.maxpreps.com" target="_blank" rel="noopener" class="ext-btn" title="MaxPreps">MaxPreps</a>
    <a href="https://247sports.com" target="_blank" rel="noopener" class="ext-btn" title="247Sports">247Sports</a>
    <a href="https://www.on3.com" target="_blank" rel="noopener" class="ext-btn" title="On3">On3</a>
  </div>
</nav>
`;

  // Inject nav into every page
  function injectNav() {
    // Look for placeholder div first
    const root = document.getElementById('nav-root');
    if (root) {
      root.outerHTML = NAV_HTML;
    } else {
      // Fallback: prepend to body
      document.body.insertAdjacentHTML('afterbegin', NAV_HTML);
    }

    // Set active state based on current page
    const path = window.location.pathname.split('/').pop() || 'index.html';
    document.querySelectorAll('#camp8-nav a').forEach(function (a) {
      const href = a.getAttribute('href') || '';
      const hrefPage = href.split('#')[0].split('/').pop();
      if (hrefPage && hrefPage === path) {
        a.classList.add('active');
        // Also mark parent dropdown trigger active
        const parentLi = a.closest('.nav-dropdown');
        if (parentLi) {
          const trigger = parentLi.querySelector('.nav-dropdown-trigger');
          if (trigger) trigger.classList.add('active');
        }
      }
    });

    // Mobile toggle
    const toggle = document.getElementById('navToggle');
    const links  = document.getElementById('navLinks');
    if (toggle && links) {
      toggle.addEventListener('click', function () {
        links.classList.toggle('open');
      });
    }

    // Close mobile nav on link click
    document.querySelectorAll('#navLinks a').forEach(function (a) {
      a.addEventListener('click', function () {
        if (links) links.classList.remove('open');
      });
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', injectNav);
  } else {
    injectNav();
  }
})();
