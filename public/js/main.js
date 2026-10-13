/**
 * AK Digital Studio - Main JavaScript
 * Includes: Navigation, Scroll Reveal, Cookie Consent, UTM Capture & GA4 Analytics
 */

document.addEventListener('DOMContentLoaded', () => {
  // 1. Mobile Menu Toggle
  const menuToggle = document.getElementById('menu-toggle');
  const mobileNav = document.getElementById('mobile-nav');

  if (menuToggle && mobileNav) {
    menuToggle.addEventListener('click', () => {
      const isOpen = mobileNav.classList.toggle('is-open');
      menuToggle.classList.toggle('is-open', isOpen);
      menuToggle.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
      document.body.style.overflow = isOpen ? 'hidden' : '';
    });

    // Close when clicking outside or on link
    mobileNav.querySelectorAll('a').forEach((link) => {
      link.addEventListener('click', () => {
        mobileNav.classList.remove('is-open');
        menuToggle.classList.remove('is-open');
        menuToggle.setAttribute('aria-expanded', 'false');
        document.body.style.overflow = '';
      });
    });
  }

  // 2. Scroll Reveal Animations (respects prefers-reduced-motion)
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (!prefersReducedMotion) {
    const revealElements = document.querySelectorAll('.reveal');
    if (revealElements.length > 0 && 'IntersectionObserver' in window) {
      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              entry.target.classList.add('is-visible');
              observer.unobserve(entry.target);
            }
          });
        },
        { threshold: 0.1, rootMargin: '0px 0px -40px 0px' }
      );

      revealElements.forEach((el) => observer.observe(el));
    } else {
      revealElements.forEach((el) => el.classList.add('is-visible'));
    }
  }

  // 3. UTM Parameter Capture in Session Storage
  try {
    const urlParams = new URLSearchParams(window.location.search);
    ['utm_source', 'utm_medium', 'utm_campaign'].forEach((param) => {
      if (urlParams.has(param)) {
        sessionStorage.setItem(`ak_${param}`, urlParams.get(param));
      }
    });

    // Auto-populate hidden UTM inputs in forms if present
    const forms = document.querySelectorAll('form');
    forms.forEach((form) => {
      ['utm_source', 'utm_medium', 'utm_campaign'].forEach((param) => {
        const storedVal = sessionStorage.getItem(`ak_${param}`);
        if (storedVal) {
          let input = form.querySelector(`input[name="${param}"]`);
          if (!input) {
            input = document.createElement('input');
            input.type = 'hidden';
            input.name = param;
            form.appendChild(input);
          }
          input.value = storedVal;
        }
      });
    });
  } catch (e) {
    // Session storage fallback
  }

  // 4. DPDP-Compliant Cookie Consent & Google Analytics 4 Loader
  const consentBanner = document.getElementById('cookie-consent-banner');
  const acceptBtn = document.getElementById('cookie-accept-btn');
  const rejectBtn = document.getElementById('cookie-reject-btn');
  const CONSENT_KEY = 'ak_cookie_consent';

  function initAnalytics() {
    if (!window.GA_MEASUREMENT_ID) return;
    if (window._gaLoaded) return;
    window._gaLoaded = true;

    // Load GA4 gtag.js
    const script = document.createElement('script');
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtag/js?id=${window.GA_MEASUREMENT_ID}`;
    document.head.appendChild(script);

    window.dataLayer = window.dataLayer || [];
    function gtag() {
      window.dataLayer.push(arguments);
    }
    window.gtag = gtag;

    gtag('js', new Date());
    gtag('config', window.GA_MEASUREMENT_ID, {
      anonymize_ip: true,
      send_page_view: true
    });
  }

  const existingConsent = localStorage.getItem(CONSENT_KEY);
  if (existingConsent === 'accepted') {
    initAnalytics();
  } else if (!existingConsent && consentBanner) {
    consentBanner.style.display = 'block';
  }

  if (acceptBtn) {
    acceptBtn.addEventListener('click', () => {
      localStorage.setItem(CONSENT_KEY, 'accepted');
      if (consentBanner) consentBanner.style.display = 'none';
      initAnalytics();
    });
  }

  if (rejectBtn) {
    rejectBtn.addEventListener('click', () => {
      localStorage.setItem(CONSENT_KEY, 'rejected');
      if (consentBanner) consentBanner.style.display = 'none';
    });
  }

  // 5. Analytics Conversion Event Listeners
  function trackEvent(eventName, params = {}) {
    if (typeof window.gtag === 'function') {
      window.gtag('event', eventName, params);
    }
  }

  // WhatsApp click tracking
  document.querySelectorAll('a[href*="wa.me"], a[href*="whatsapp"]').forEach((el) => {
    el.addEventListener('click', () => {
      trackEvent('whatsapp_click', {
        page_location: window.location.pathname
      });
    });
  });

  // Phone click tracking
  document.querySelectorAll('a[href^="tel:"]').forEach((el) => {
    el.addEventListener('click', () => {
      trackEvent('phone_click', {
        phone_number: el.getAttribute('href')
      });
    });
  });

  // Email click tracking
  document.querySelectorAll('a[href^="mailto:"]').forEach((el) => {
    el.addEventListener('click', () => {
      trackEvent('email_click', {
        email: el.getAttribute('href')
      });
    });
  });

  // Plan choose click tracking
  document.querySelectorAll('a[href*="/inquiry?plan="]').forEach((el) => {
    el.addEventListener('click', () => {
      const url = new URL(el.href, window.location.origin);
      const planName = url.searchParams.get('plan') || 'Custom';
      trackEvent('plan_choose', {
        plan_name: planName
      });
    });
  });

  // Service enquire tracking
  document.querySelectorAll('a[href*="/inquiry?service="]').forEach((el) => {
    el.addEventListener('click', () => {
      const url = new URL(el.href, window.location.origin);
      const serviceName = url.searchParams.get('service') || 'General';
      trackEvent('service_enquire', {
        service_name: serviceName
      });
    });
  });

  // Copy plan link button helper
  document.querySelectorAll('.btn-copy-plan').forEach((btn) => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const planSlug = btn.getAttribute('data-plan-slug');
      const shareUrl = `${window.location.origin}/plans#${planSlug}`;
      navigator.clipboard.writeText(shareUrl).then(() => {
        const originalText = btn.textContent;
        btn.textContent = '✓ Copied Link!';
        setTimeout(() => {
          btn.textContent = originalText;
        }, 2000);
      });
    });
  });
});
