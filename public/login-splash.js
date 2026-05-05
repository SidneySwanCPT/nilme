// ============================================
// Camp 8 — Post-login motivational splash
// Used by login.html right before redirect.
// Usage: await showLoginSplash({ name, position }); window.location.href = next;
//
// Curated list of exactly 20 messages: 10 position-aware + 10 general.
// Displays for 2.5 seconds, then resolves.
// ============================================
(function(global) {
  'use strict';

  // Exactly 20 messages. Each has an optional `position` tag to pick
  // position-aware ones first when we know the athlete's position.
  var MESSAGES = [
    { line: "Eyes up. Feet set. Own the pocket.",                                     author: "Camp 8",              position: 'QB' },
    { line: "One cut, full speed, no hesitation.",                                    author: "Camp 8",              position: 'RB' },
    { line: "Separation is earned in the top of the stem.",                           author: "Camp 8",              position: 'WR' },
    { line: "The game is won in the trenches.",                                       author: "Vince Lombardi",      position: 'OL' },
    { line: "Edge rush is effort plus technique.",                                    author: "Camp 8",              position: 'DE' },
    { line: "See it. Hit it. Own it.",                                                author: "Camp 8",              position: 'LB' },
    { line: "Short memory. Long speed.",                                              author: "Deion Sanders",       position: 'CB' },
    { line: "Be the eraser. Be the last line.",                                       author: "Camp 8",              position: 'S'  },
    { line: "Matchup nightmares are made, not born.",                                 author: "Camp 8",              position: 'TE' },
    { line: "Win the gap. Win the game.",                                             author: "Camp 8",              position: 'DL' },
    { line: "The will to win is nothing without the will to prepare to win.",         author: "Bobby Knight" },
    { line: "Hard work beats talent when talent doesn't work hard.",                  author: "Tim Notke" },
    { line: "Champions aren't made in gyms. They're made from something deep inside.", author: "Muhammad Ali" },
    { line: "Discipline is doing what you hate, like you love it.",                   author: "Mike Tyson" },
    { line: "Pressure is a privilege.",                                               author: "Billie Jean King" },
    { line: "The man on top of the mountain didn't fall there.",                      author: "Vince Lombardi" },
    { line: "Don't count the days. Make the days count.",                             author: "Muhammad Ali" },
    { line: "You miss 100% of the shots you don't take.",                             author: "Wayne Gretzky" },
    { line: "Your film is your résumé. Make every rep count.",                        author: "Camp 8" },
    { line: "The scoreboard doesn't care how you felt Tuesday. Train anyway.",        author: "Camp 8" }
  ];

  function pickMessage(position) {
    var pos = position ? String(position).toUpperCase().trim() : null;
    // If we know the position and there's a position-specific message, 60% chance to use it.
    if (pos && Math.random() > 0.4) {
      var matched = MESSAGES.filter(function(m) { return m.position === pos; });
      if (matched.length) return matched[Math.floor(Math.random() * matched.length)];
    }
    // Otherwise — uniform random across the full 20.
    return MESSAGES[Math.floor(Math.random() * MESSAGES.length)];
  }

  function showLoginSplash(opts) {
    opts = opts || {};
    var msg = pickMessage(opts.position);
    var firstName = opts.name ? String(opts.name).trim().split(/\s+/)[0] : null;
    var greeting = firstName ? 'Welcome back, ' + firstName : 'Welcome back';

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
      '#camp8-login-splash .c8ls-fill{height:100%;width:0;background:#d4a843;border-radius:999px;animation:c8lsFill 2.5s ease forwards}' +
      '@keyframes c8lsFade{from{opacity:0}to{opacity:1}}' +
      '@keyframes c8lsRise{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)}}' +
      '@keyframes c8lsFill{from{width:0}to{width:100%}}';

    document.head.appendChild(style);
    document.body.appendChild(overlay);

    // Stays on screen 2.5s, then fades out.
    return new Promise(function(resolve) {
      setTimeout(function() {
        overlay.style.transition = 'opacity .25s';
        overlay.style.opacity = '0';
        setTimeout(function() { overlay.remove(); resolve(); }, 250);
      }, 2500);
    });
  }

  function escapeHTML(s) {
    var d = document.createElement('div');
    d.textContent = String(s == null ? '' : s);
    return d.innerHTML;
  }

  global.showLoginSplash = showLoginSplash;
})(window);
