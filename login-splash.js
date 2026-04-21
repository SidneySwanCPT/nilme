// ============================================
// Camp 8 — Post-login motivational splash
// Used by login.html right before redirect.
// Usage: await showLoginSplash({ name, position }); window.location.href = next;
// ============================================
(function(global) {
  'use strict';

  var MESSAGES = {
    QB: [
      { line: "Eyes up. Feet set. Own the pocket.", author: "Camp 8" },
      { line: "Great quarterbacks don't just throw — they decide.", author: "Coach Saban" },
      { line: "Read it. Trust it. Rip it.", author: "Camp 8" }
    ],
    RB: [
      { line: "One cut, full speed, no hesitation.", author: "Camp 8" },
      { line: "Broken tackles are built on Mondays.", author: "Camp 8" },
      { line: "Pad level wins the down.", author: "Coach's mantra" }
    ],
    WR: [
      { line: "Run every route like it's a touchdown.", author: "Camp 8" },
      { line: "Separation is earned in the top of the stem.", author: "Camp 8" },
      { line: "Hands soft. Feet fast. Mind ready.", author: "Camp 8" }
    ],
    TE: [
      { line: "Block like a lineman, catch like a receiver.", author: "Camp 8" },
      { line: "Matchup nightmares are made, not born.", author: "Camp 8" }
    ],
    OL: [
      { line: "The game is won in the trenches.", author: "Coach Lombardi" },
      { line: "First step sets the tone.", author: "Camp 8" },
      { line: "Protect your QB. Move mountains for your RB.", author: "Camp 8" }
    ],
    DL: [
      { line: "Win the gap. Win the game.", author: "Camp 8" },
      { line: "Disrupt on every snap.", author: "Camp 8" }
    ],
    DE: [
      { line: "Edge rush is effort plus technique.", author: "Camp 8" },
      { line: "Set the edge. Take the corner.", author: "Camp 8" }
    ],
    LB: [
      { line: "See it. Hit it. Own it.", author: "Camp 8" },
      { line: "The middle of the field belongs to you.", author: "Camp 8" }
    ],
    CB: [
      { line: "Short memory. Long speed.", author: "Deion" },
      { line: "Cover like it's personal.", author: "Camp 8" }
    ],
    S: [
      { line: "Be the eraser. Be the last line.", author: "Camp 8" },
      { line: "Read the QB's eyes. Trust your break.", author: "Camp 8" }
    ],
    K: [
      { line: "Same swing. Every time. Every pressure.", author: "Camp 8" }
    ],
    P: [
      { line: "Flip the field. Control the game.", author: "Camp 8" }
    ],
    GENERAL: [
      { line: "The will to win is nothing without the will to prepare to win.", author: "Bobby Knight" },
      { line: "Hard work beats talent when talent doesn't work hard.", author: "Tim Notke" },
      { line: "Champions aren't made in gyms. They're made from something deep inside.", author: "Muhammad Ali" },
      { line: "It's not the size of the dog in the fight — it's the size of the fight in the dog.", author: "Mark Twain" },
      { line: "Discipline is doing what you hate, like you love it.", author: "Mike Tyson" },
      { line: "Pressure is a privilege.", author: "Billie Jean King" },
      { line: "The man on top of the mountain didn't fall there.", author: "Vince Lombardi" },
      { line: "You miss 100% of the shots you don't take.", author: "Wayne Gretzky" },
      { line: "Don't count the days. Make the days count.", author: "Muhammad Ali" },
      { line: "Let your game speak. Your film is your résumé.", author: "Camp 8" }
    ]
  };

  function pickMessage(position) {
    var bucket = null;
    if (position) {
      var key = String(position).toUpperCase().trim();
      if (MESSAGES[key]) bucket = MESSAGES[key];
    }
    // 50% position-specific when available, otherwise general
    if (bucket && Math.random() > 0.4) {
      return bucket[Math.floor(Math.random() * bucket.length)];
    }
    var gen = MESSAGES.GENERAL;
    return gen[Math.floor(Math.random() * gen.length)];
  }

  function showLoginSplash(opts) {
    opts = opts || {};
    var msg = pickMessage(opts.position);
    var greeting = opts.name ? 'Welcome back, ' + String(opts.name).split(' ')[0] : 'Welcome back';

    var overlay = document.createElement('div');
    overlay.id = 'camp8-login-splash';
    overlay.setAttribute('role', 'status');
    overlay.setAttribute('aria-live', 'polite');
    overlay.innerHTML =
      '<div class="c8ls-inner">' +
        '<div class="c8ls-logo">' +
          '<svg viewBox="0 0 32 32" width="54" height="54" fill="none" xmlns="http://www.w3.org/2000/svg">' +
            '<ellipse cx="16" cy="16" rx="10" ry="7" stroke="#d4a843" stroke-width="2" fill="none"/>' +
            '<path d="M16 9v14M10 12.5c2-1.5 4-2 6-2s4 .5 6 2" stroke="#d4a843" stroke-width="1.5" stroke-linecap="round" fill="none"/>' +
            '<path d="M10 19.5c2 1.5 4 2 6 2s4-.5 6-2" stroke="#d4a843" stroke-width="1.5" stroke-linecap="round" fill="none"/>' +
          '</svg>' +
        '</div>' +
        '<div class="c8ls-greeting">' + escapeHTML(greeting) + '</div>' +
        '<div class="c8ls-quote">&ldquo;' + escapeHTML(msg.line) + '&rdquo;</div>' +
        '<div class="c8ls-author">— ' + escapeHTML(msg.author) + '</div>' +
        '<div class="c8ls-bar"><div class="c8ls-fill"></div></div>' +
      '</div>';

    var style = document.createElement('style');
    style.textContent =
      '#camp8-login-splash{position:fixed;inset:0;z-index:99999;background:radial-gradient(circle at 50% 30%,rgba(212,168,67,.12),rgba(8,8,16,.98) 60%);display:flex;align-items:center;justify-content:center;padding:24px;animation:c8lsFade .35s ease}' +
      '#camp8-login-splash .c8ls-inner{max-width:520px;text-align:center;transform:translateY(12px);animation:c8lsRise .55s .1s ease forwards;opacity:0}' +
      '#camp8-login-splash .c8ls-logo{display:inline-flex;padding:14px;border-radius:50%;background:rgba(212,168,67,.08);border:1px solid rgba(212,168,67,.25);margin-bottom:20px}' +
      '#camp8-login-splash .c8ls-greeting{font-size:.78rem;letter-spacing:.18em;text-transform:uppercase;color:#d4a843;font-weight:700;margin-bottom:12px}' +
      '#camp8-login-splash .c8ls-quote{font-family:"Bebas Neue","DM Sans",sans-serif;font-size:2rem;line-height:1.2;color:#eeeef8;margin-bottom:14px;letter-spacing:.01em}' +
      '#camp8-login-splash .c8ls-author{font-size:.85rem;color:rgba(255,255,255,.5);font-style:italic;margin-bottom:28px}' +
      '#camp8-login-splash .c8ls-bar{width:180px;height:3px;margin:0 auto;background:rgba(255,255,255,.08);border-radius:999px;overflow:hidden}' +
      '#camp8-login-splash .c8ls-fill{height:100%;width:0;background:#d4a843;border-radius:999px;animation:c8lsFill 2.1s ease forwards}' +
      '@keyframes c8lsFade{from{opacity:0}to{opacity:1}}' +
      '@keyframes c8lsRise{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)}}' +
      '@keyframes c8lsFill{from{width:0}to{width:100%}}';

    document.head.appendChild(style);
    document.body.appendChild(overlay);

    return new Promise(function(resolve) {
      setTimeout(function() {
        overlay.style.transition = 'opacity .25s';
        overlay.style.opacity = '0';
        setTimeout(function() { overlay.remove(); resolve(); }, 250);
      }, 2200);
    });
  }

  function escapeHTML(s) {
    var d = document.createElement('div');
    d.textContent = String(s == null ? '' : s);
    return d.innerHTML;
  }

  global.showLoginSplash = showLoginSplash;
})(window);
