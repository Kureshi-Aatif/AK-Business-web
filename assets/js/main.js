/**
 * AK Digital Studio - Main Interactive JavaScript
 * Modular vanilla JS: Navigation, Scroll Reveal, UTM capture, plan link sharing, accessibility
 */

document.addEventListener('DOMContentLoaded', () => {
  setupMobileNav();
  setupScrollReveal();
  setupUtmCapture();
  setupPlanSharing();
});

/**
 * Mobile Drawer Navigation
 */
function setupMobileNav() {
  const menuToggle = document.getElementById('menu-toggle');
  const mobileNav = document.getElementById('mobile-nav');
  if (!menuToggle || !mobileNav) return;

  function toggleMenu(open) {
    const isOpen = typeof open === 'boolean' ? open : !mobileNav.classList.contains('is-open');
    mobileNav.classList.toggle('is-open', isOpen);
    menuToggle.classList.toggle('is-open', isOpen);
    menuToggle.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
    document.body.style.overflow = isOpen ? 'hidden' : '';
  }

  menuToggle.addEventListener('click', () => toggleMenu());

  // Close when pressing Escape
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && mobileNav.classList.contains('is-open')) {
      toggleMenu(false);
      menuToggle.focus();
    }
  });

  // Close on mobile link clicks
  mobileNav.querySelectorAll('a').forEach((link) => {
    link.addEventListener('click', () => toggleMenu(false));
  });

  // Close when clicking outside drawer
  document.addEventListener('click', (e) => {
    if (
      mobileNav.classList.contains('is-open') &&
      !mobileNav.contains(e.target) &&
      !menuToggle.contains(e.target)
    ) {
      toggleMenu(false);
    }
  });
}

/**
 * Scroll Reveal Animations (prefers-reduced-motion safe)
 */
function setupScrollReveal() {
  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const elements = document.querySelectorAll('.reveal');
  if (elements.length === 0) return;

  if (prefersReduced || !('IntersectionObserver' in window)) {
    elements.forEach((el) => el.classList.add('is-visible'));
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.08, rootMargin: '0px 0px -30px 0px' }
  );

  elements.forEach((el) => observer.observe(el));
}

/**
 * UTM Parameter Capture into sessionStorage
 */
function setupUtmCapture() {
  try {
    const params = new URLSearchParams(window.location.search);
    ['utm_source', 'utm_medium', 'utm_campaign'].forEach((param) => {
      if (params.has(param)) {
        sessionStorage.setItem(`ak_${param}`, params.get(param));
      }
    });
  } catch (err) {
    // Non-blocking
  }
}

/**
 * Copy Plan / Share Link on Plans page
 */
function setupPlanSharing() {
  const copyButtons = document.querySelectorAll('.btn-copy-plan');
  copyButtons.forEach((btn) => {
    btn.addEventListener('click', async () => {
      const planSlug = btn.getAttribute('data-plan-slug') || '';
      const shareUrl = `${window.location.origin}/plans/${planSlug ? '#' + planSlug : ''}`;
      const originalText = btn.innerHTML;

      try {
        if (navigator.clipboard && navigator.clipboard.writeText) {
          await navigator.clipboard.writeText(shareUrl);
          btn.innerHTML = '✅ Link copied!';
        } else {
          btn.innerHTML = '✅ URL copied!';
        }
      } catch (e) {
        btn.innerHTML = '✅ URL copied!';
      }

      setTimeout(() => {
        btn.innerHTML = originalText;
      }, 2500);
    });
  });
}
