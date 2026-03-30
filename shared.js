// ============================================
// Shared functionality across all pages
// ============================================

(function() {
  'use strict';

  // Mobile sidebar toggle
  function initMobileSidebar() {
    const sidebar = document.getElementById('sidebar');
    const header = sidebar?.querySelector('.sidebar-header');
    if (!sidebar || !header) return;

    function isMobile() {
      return window.innerWidth <= 768;
    }

    // Start collapsed on mobile
    if (isMobile()) {
      sidebar.classList.add('mobile-collapsed');
    }

    header.addEventListener('click', function() {
      if (isMobile()) {
        sidebar.classList.toggle('mobile-collapsed');
      }
    });

    // Reset on resize
    window.addEventListener('resize', function() {
      if (!isMobile()) {
        sidebar.classList.remove('mobile-collapsed');
      }
    });
  }

  // Run on DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initMobileSidebar);
  } else {
    initMobileSidebar();
  }
})();
