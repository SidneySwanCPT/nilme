// ============================================
// Camp 8 — Shared Utilities
// File: shared.js
// Loaded by all pages that need common helpers
// ============================================

// ---- HTML escape ----
function esc(s) {
  var d = document.createElement('div');
  d.textContent = String(s || '');
  return d.innerHTML;
}

// ---- Format numbers ----
function formatNum(n) {
  if (!n && n !== 0) return '—';
  return Number(n).toLocaleString();
}

// ---- Format date ----
function formatDate(str) {
  if (!str) return '—';
  try {
    return new Date(str).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  } catch(e) { return str; }
}

// ---- Truncate text ----
function truncate(str, len) {
  if (!str) return '';
  return str.length > len ? str.slice(0, len) + '…' : str;
}

// ---- Division badge HTML ----
function divBadge(div) {
  var colors = {
    FBS: 'rgba(212,168,67,.15);color:#d4a843',
    FCS: 'rgba(74,144,217,.15);color:#4a90d9',
    D2:  'rgba(80,200,120,.15);color:#50c878',
    D3:  'rgba(232,135,43,.15);color:#e8872b',
    JUCO:'rgba(196,30,58,.15);color:#c41e3a',
    NAIA:'rgba(160,80,200,.15);color:#a050c8'
  };
  var style = colors[div] || 'rgba(255,255,255,.06);color:#888';
  return '<span style="padding:2px 8px;border-radius:100px;font-size:.65rem;font-weight:700;text-transform:uppercase;background:' + style + '">' + esc(div || '') + '</span>';
}

// ---- State badge ----
function stateBadge(state) {
  if (!state) return '';
  return '<span style="padding:2px 8px;border-radius:100px;font-size:.65rem;font-weight:700;background:rgba(255,255,255,.06);color:#888">' + esc(state) + '</span>';
}

// ---- Show/hide loading spinner ----
function showLoading(elId, msg) {
  var el = document.getElementById(elId);
  if (!el) return;
  el.innerHTML = '<div style="display:flex;align-items:center;justify-content:center;padding:var(--space-xl);color:var(--text-muted);gap:10px">' +
    '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="animation:spin 1s linear infinite"><path d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" opacity=".2"/><path d="M21 12a9 9 0 01-9 9"/></svg>' +
    esc(msg || 'Loading…') +
    '</div>';
}

function showEmpty(elId, msg) {
  var el = document.getElementById(elId);
  if (!el) return;
  el.innerHTML = '<div style="padding:var(--space-xl);text-align:center;color:var(--text-muted);font-size:.88rem">' + esc(msg || 'Nothing here yet.') + '</div>';
}

// ---- Toast notification ----
function showToast(msg, type) {
  var existing = document.getElementById('camp8-toast');
  if (existing) existing.remove();
  var colors = { success: '#50c878', error: '#c41e3a', info: '#4a90d9', warning: '#e8872b' };
  var color = colors[type] || colors.info;
  var el = document.createElement('div');
  el.id = 'camp8-toast';
  el.style.cssText = 'position:fixed;bottom:24px;right:24px;z-index:99999;padding:12px 20px;background:rgba(10,10,22,.97);border:1px solid ' + color + ';border-radius:8px;font-size:.84rem;color:' + color + ';font-family:var(--font-body);max-width:320px;line-height:1.4;box-shadow:0 8px 32px rgba(0,0,0,.5);transition:opacity .3s';
  el.textContent = msg;
  document.body.appendChild(el);
  setTimeout(function() { el.style.opacity = '0'; setTimeout(function() { el.remove(); }, 300); }, 3500);
}

// ---- Copy to clipboard ----
function copyToClipboard(text, feedbackEl) {
  navigator.clipboard.writeText(text).then(function() {
    if (feedbackEl) {
      var orig = feedbackEl.textContent;
      feedbackEl.textContent = '✓ Copied!';
      setTimeout(function() { feedbackEl.textContent = orig; }, 2000);
    }
    showToast('Copied to clipboard', 'success');
  }).catch(function() {
    showToast('Copy failed — try manually', 'error');
  });
}

// ---- Require login redirect ----
function requireLogin(msg) {
  sessionStorage.setItem('camp8_redirect', window.location.href);
  var overlay = document.getElementById('loginOverlay');
  if (overlay) {
    overlay.style.display = 'flex';
    return;
  }
  // Fallback: redirect to login
  window.location.href = 'login.html';
}

// ---- Supabase client shortcut ----
// (only works on pages that load supabase-client.js first)
function getSB() {
  if (typeof SUPABASE_URL !== 'undefined' && typeof SUPABASE_ANON_KEY !== 'undefined' && window.supabase) {
    return window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  }
  return null;
}

// ---- Spin animation ----
(function() {
  if (!document.getElementById('camp8-spin-style')) {
    var s = document.createElement('style');
    s.id = 'camp8-spin-style';
    s.textContent = '@keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}';
    document.head.appendChild(s);
  }
})();

// ---- Debounce ----
function debounce(fn, ms) {
  var timer;
  return function() {
    clearTimeout(timer);
    var args = arguments;
    timer = setTimeout(function() { fn.apply(this, args); }, ms);
  };
}

// ---- Format position ----
function fmtPos(pos) {
  var map = {
    'QB': 'Quarterback', 'RB': 'Running Back', 'WR': 'Wide Receiver',
    'TE': 'Tight End', 'OL': 'Offensive Line', 'DL': 'Defensive Line',
    'DE': 'Defensive End', 'LB': 'Linebacker', 'CB': 'Cornerback',
    'S': 'Safety', 'K': 'Kicker', 'P': 'Punter'
  };
  return map[pos] || pos || '—';
}
