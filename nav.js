// ============================================
// Camp 8 — Universal Navigation
// Edit this ONE file to update nav on ALL pages
// ============================================

(function () {
  'use strict';

  // ---- Page map: filename → { label, parent, parentLabel } ----
  const PAGE_MAP = {
    'index.html':          { label: 'Home',                parent: null,        parentLabel: null },
    'nil-central.html':    { label: 'NIL Central',         parent: null,        parentLabel: null },
    'nil-rating.html':     { label: 'NIL Rating Tool',     parent: 'nil',       parentLabel: 'NIL Central' },
    'nil-sponsors.html':   { label: 'Sponsor Directory',   parent: 'nil',       parentLabel: 'NIL Central' },
    'recruits.html':       { label: 'Top Prospects',         parent: 'recruiting', parentLabel: 'Recruiting' },
    'camps.html':          { label: 'Prospect Camps',      parent: 'recruiting', parentLabel: 'Recruiting' },
    'combine-eval.html':   { label: 'Combine Evaluator',   parent: 'recruiting', parentLabel: 'Recruiting' },
    'powerhouse.html':     { label: 'Powerhouse Central',  parent: 'recruiting', parentLabel: 'Recruiting' },
    'commitments.html':    { label: 'Commitment Tracker',  parent: 'recruiting', parentLabel: 'Recruiting' },
    'transfer-portal.html':{ label: 'Transfer Portal',     parent: 'recruiting', parentLabel: 'Recruiting' },
    'ncaa-rules.html':     { label: 'NCAA Recruiting Rules', parent: 'recruiting', parentLabel: 'Recruiting' },
    'dashboard.html':      { label: 'My Dashboard',         parent: null,        parentLabel: null },
    'admin.html':          { label: 'Admin',                 parent: null,        parentLabel: null },
    'by-school.html':      { label: 'By School',           parent: 'recruiting', parentLabel: 'Recruiting' },
  };

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

    <!-- NIL Central -->
    <li class="nav-dropdown" id="dd-nil">
      <a href="nil-central.html" class="nav-dropdown-trigger" id="trigger-nil">
        NIL Central
        <svg class="dd-chevron" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="6 9 12 15 18 9"/></svg>
      </a>
      <ul class="nav-dropdown-menu" id="menu-nil">
<li><a href="nil-central.html#nil-rules" data-page="nil-central.html">
          <span class="ddm-icon">📋</span>Rules &amp; Regulations
        </a></li>
        <li><a href="nil-central.html#nil-deals" data-page="nil-central.html">
          <span class="ddm-icon">💰</span>Deals Tracker
        </a></li>
        <li><a href="nil-sponsors.html" data-page="nil-sponsors.html">
          <span class="ddm-icon">🤝</span>Sponsor Directory
        </a></li>
      </ul>
    </li>

    <!-- Recruiting -->
    <li class="nav-dropdown" id="dd-recruiting">
      <a href="recruits.html" class="nav-dropdown-trigger" id="trigger-recruiting">
        Recruiting
        <svg class="dd-chevron" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="6 9 12 15 18 9"/></svg>
      </a>
      <ul class="nav-dropdown-menu" id="menu-recruiting">
        <li><a href="recruits.html" data-page="recruits.html">
          <span class="ddm-icon">🗺️</span>Top Prospects
        </a></li>
        <li><a href="camps.html" data-page="camps.html">
          <span class="ddm-icon">🏕️</span>Prospect Camps
        </a></li>
        <li><a href="combine-eval.html" data-page="combine-eval.html">
          <span class="ddm-icon">⚡</span>Combine Evaluator
        </a></li>
        <li><a href="powerhouse.html" data-page="powerhouse.html">
          <span class="ddm-icon">🏆</span>Powerhouse Central
        </a></li>
      </ul>
    </li>

  </ul>

  <!-- External buttons -->
  <div class="nav-external">
<a href="https://www.hudl.com" target="_blank" rel="noopener" class="ext-btn">Hudl</a>
    <a href="https://www.maxpreps.com" target="_blank" rel="noopener" class="ext-btn">MaxPreps</a>
    <a href="https://247sports.com" target="_blank" rel="noopener" class="ext-btn">247Sports</a>
    <a href="https://www.on3.com" target="_blank" rel="noopener" class="ext-btn">On3</a>
  </div>
</nav>
`;

  // ---- Breadcrumb HTML ----
  function buildBreadcrumb(page) {
    const info = PAGE_MAP[page];
    if (!info || page === 'index.html') return '';

    let crumbs = '<a href="index.html" class="bc-item">Home</a>';
    crumbs += '<span class="bc-sep">›</span>';

    if (info.parent && info.parentLabel) {
      // Parent link
      const parentHref = info.parent === 'nil' ? 'nil-central.html' : 'recruits.html';
      crumbs += '<a href="' + parentHref + '" class="bc-item">' + info.parentLabel + '</a>';
      crumbs += '<span class="bc-sep">›</span>';
    }

    crumbs += '<span class="bc-item bc-current">' + info.label + '</span>';

    return '<div class="breadcrumb-bar" id="camp8-breadcrumb"><div class="bc-inner">' + crumbs + '</div></div>';
  }

  // ---- Inject nav + breadcrumb ----
  function injectNav() {
    const root = document.getElementById('nav-root');
    if (root) {
      root.outerHTML = NAV_HTML;
    } else {
      document.body.insertAdjacentHTML('afterbegin', NAV_HTML);
    }

    // Determine current page
    const path = window.location.pathname.split('/').pop() || 'index.html';
    const info  = PAGE_MAP[path];

    // Mark active states
    // Top-level trigger
    if (info && info.parent) {
      const trigger = document.getElementById('trigger-' + info.parent);
      if (trigger) trigger.classList.add('active');
    }

    // Dropdown item — match by data-page attribute
    document.querySelectorAll('#camp8-nav .nav-dropdown-menu a[data-page]').forEach(function(a) {
      if (a.getAttribute('data-page') === path) {
        a.classList.add('active');
      }
    });

    // Brand active if home
    if (path === 'index.html' || path === '') {
      const brand = document.querySelector('#camp8-nav .nav-brand');
      if (brand) brand.classList.add('active');
    }

    // Inject breadcrumb after the nav
    const bc = buildBreadcrumb(path);
    if (bc) {
      const nav = document.getElementById('camp8-nav');
      if (nav) nav.insertAdjacentHTML('afterend', bc);
      document.body.classList.add('has-breadcrumb');
    }

    // ---- Dropdown hover with delay (fix for closing too fast) ----
    var closeTimers = {};

    document.querySelectorAll('.nav-dropdown').forEach(function(dd) {
      var menu = dd.querySelector('.nav-dropdown-menu');
      if (!menu) return;
      var id = dd.id;

      dd.addEventListener('mouseenter', function() {
        clearTimeout(closeTimers[id]);
        menu.classList.add('open');
        dd.querySelector('.dd-chevron') && dd.querySelector('.dd-chevron').classList.add('rotated');
      });

      dd.addEventListener('mouseleave', function() {
        closeTimers[id] = setTimeout(function() {
          menu.classList.remove('open');
          dd.querySelector('.dd-chevron') && dd.querySelector('.dd-chevron').classList.remove('rotated');
        }, 220); // 220ms grace period — enough to move mouse into menu
      });

      menu.addEventListener('mouseenter', function() {
        clearTimeout(closeTimers[id]);
      });

      menu.addEventListener('mouseleave', function() {
        closeTimers[id] = setTimeout(function() {
          menu.classList.remove('open');
          dd.querySelector('.dd-chevron') && dd.querySelector('.dd-chevron').classList.remove('rotated');
        }, 120);
      });
    });

    // Mobile toggle
    const toggle = document.getElementById('navToggle');
    const links  = document.getElementById('navLinks');
    if (toggle && links) {
      toggle.addEventListener('click', function() {
        links.classList.toggle('open');
      });
    }

    // Close mobile nav on link click
    document.querySelectorAll('#navLinks a').forEach(function(a) {
      a.addEventListener('click', function() {
        if (links) links.classList.remove('open');
      });
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', injectNav);
  } else {
    injectNav();
  }

  // ---- Inject floating chat bubble ----
  function injectChatBubble() {
    // Don't show on chat page itself
    const path = window.location.pathname.split('/').pop() || 'index.html';
    if (path === 'chat.html') return;

    const bubble = document.createElement('div');
    bubble.id = 'camp8-chat-bubble';
    bubble.innerHTML = `
      <a href="chat.html" title="AI Assistant" style="display:flex;align-items:center;justify-content:center;width:100%;height:100%;text-decoration:none;color:#0a0a12">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/></svg>
      </a>
      <div id="camp8-bubble-tooltip">AI Assistant</div>
    `;
    document.body.appendChild(bubble);

    // Inject bubble CSS
    const style = document.createElement('style');
    style.textContent = `
      #camp8-chat-bubble {
        position: fixed;
        bottom: 24px;
        right: 24px;
        width: 52px;
        height: 52px;
        border-radius: 50%;
        background: #d4a843;
        box-shadow: 0 4px 20px rgba(212,168,67,0.45);
        z-index: 8000;
        cursor: pointer;
        transition: all 0.2s ease;
        animation: bubblePop 0.4s ease;
      }
      #camp8-chat-bubble:hover {
        transform: scale(1.1);
        box-shadow: 0 6px 28px rgba(212,168,67,0.6);
      }
      #camp8-bubble-tooltip {
        position: absolute;
        bottom: calc(100% + 8px);
        right: 0;
        background: rgba(10,10,22,0.95);
        border: 1px solid rgba(255,255,255,0.1);
        border-radius: 8px;
        padding: 5px 10px;
        font-size: 0.72rem;
        font-weight: 600;
        color: #eeeef8;
        white-space: nowrap;
        pointer-events: none;
        opacity: 0;
        transition: opacity 0.15s;
      }
      #camp8-chat-bubble:hover #camp8-bubble-tooltip { opacity: 1; }
      .nav-ai-btn { color: #d4a843 !important; border-color: rgba(212,168,67,0.4) !important; background: rgba(212,168,67,0.1) !important; }
      .nav-ai-btn:hover { background: rgba(212,168,67,0.2) !important; }
      @keyframes bubblePop { 0% { transform: scale(0); opacity: 0; } 80% { transform: scale(1.1); } 100% { transform: scale(1); opacity: 1; } }
    `;
    document.head.appendChild(style);
  }

  // Inject bubble after a short delay so it doesn't flash on load
  setTimeout(injectChatBubble, 800);
})();
