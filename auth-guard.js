// ============================================
// Camp 8 — Auth Guard
// Hard gate: every page requires login.
// Add this script tag to EVERY HTML page:
// <script src="auth-guard.js"></script>
// Place it BEFORE nav.js and any other scripts.
// ============================================

(function () {
  'use strict';

  // Pages that are always public (no redirect)
  const PUBLIC_PAGES = ['login.html', 'onboarding.html', 'index.html', 'nil-central.html', 'ncaa-rules.html', 'powerhouse.html', 'recruits.html', 'commitments.html', 'transfer-portal.html', 'camps.html'];

  const currentPage = window.location.pathname.split('/').pop() || 'index.html';

  // Don't gate the login page itself
  if (PUBLIC_PAGES.includes(currentPage)) return;

  // Hide body immediately to prevent flash of content
  document.documentElement.style.visibility = 'hidden';

  // Load Supabase and check session
  function checkAuth() {
    const SUPABASE_URL = 'https://afikpptrkkfpoatadhyg.supabase.co';
    const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFmaWtwcHRya2tmcG9hdGFkaHlnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzUwMDM4MjIsImV4cCI6MjA5MDU3OTgyMn0.fSpFH4kP_iyDAptTlTIQLL5tjhzjFe6PWFDMdWV55uI';

    if (typeof window.supabase === 'undefined') {
      // SDK not loaded yet — wait briefly
      setTimeout(checkAuth, 100);
      return;
    }

    const sb = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

    sb.auth.getSession().then(function (result) {
      const session = result.data?.session;

      if (!session) {
        // Save where they were trying to go
        sessionStorage.setItem('camp8_redirect', window.location.href);
        window.location.replace('login.html');
        return;
      }

      // Logged in — check if onboarding is complete
      const skipOnboarding = ['onboarding.html', 'login.html'];
      if (!skipOnboarding.includes(currentPage)) {
        sb.from('athletes').select('onboarding_complete').eq('user_id', session.user.id).single().then(function(res) {
          if (!res.data || !res.data.onboarding_complete) {
            window.location.replace('onboarding.html');
            return;
          }
          document.documentElement.style.visibility = '';
        }).catch(function() {
          document.documentElement.style.visibility = '';
        });
      } else {
        document.documentElement.style.visibility = '';
      }
    }).catch(function () {
      // On error, redirect to login to be safe
      window.location.replace('login.html');
    });
  }

  // Wait for Supabase CDN to load, then check
  if (typeof window.supabase !== 'undefined') {
    checkAuth();
  } else {
    window.addEventListener('load', checkAuth);
  }
})();
