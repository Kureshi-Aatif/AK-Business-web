/**
 * AK Digital Studio - Form Handler
 * Handles validation, AJAX submissions, anti-spam timers, CSRF injection, GA4 tracking & thank-you states
 */

document.addEventListener('DOMContentLoaded', () => {
  setupAjaxForm('inquiry-form', '/api/inquiries', 'inquiry_submit');
  setupAjaxForm('contact-form', '/api/contacts', 'contact_submit');
});

function getCsrfTokenFromCookie() {
  const match = document.cookie.match(new RegExp('(^| )ak_csrf_token=([^;]+)'));
  if (match) return match[2];
  const meta = document.querySelector('input[name="_csrf"]');
  return meta ? meta.value : '';
}

function setupAjaxForm(formId, endpoint, conversionEvent) {
  const form = document.getElementById(formId);
  if (!form) return;

  const submitBtn = form.querySelector('button[type="submit"]');
  const originalBtnText = submitBtn ? submitBtn.innerHTML : 'Submit';
  const successContainer = document.getElementById(`${formId}-success`);

  // Record render time for minimum fill-time anti-spam check (min 3s)
  const timeInput = form.querySelector('input[name="_form_time"]');
  if (timeInput) {
    timeInput.value = Date.now().toString();
  }

  // Clear errors on field input
  form.querySelectorAll('input, select, textarea').forEach((input) => {
    input.addEventListener('input', () => {
      clearFieldError(input);
    });
  });

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    // Prevent double submission
    if (form.dataset.submitting === 'true') return;

    // Reset previous errors
    clearAllErrors(form);

    // Client-side quick checks
    let hasClientError = false;
    const requiredInputs = form.querySelectorAll('[required]');
    requiredInputs.forEach((input) => {
      if (input.type === 'checkbox' && !input.checked) {
        showFieldError(input, 'This checkbox is required.');
        hasClientError = true;
      } else if (!input.value.trim()) {
        showFieldError(input, 'This field is required.');
        hasClientError = true;
      }
    });

    if (hasClientError) {
      const firstInvalid = form.querySelector('.is-invalid');
      if (firstInvalid) firstInvalid.focus();
      return;
    }

    // Set submitting state
    form.dataset.submitting = 'true';
    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.innerHTML = `
        <svg class="spinner" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="animation: spin 0.8s linear infinite;">
          <circle cx="12" cy="12" r="10" stroke-opacity="0.25"></circle>
          <path d="M12 2 A10 10 0 0 1 22 12"></path>
        </svg>
        <span>Sending...</span>
      `;
    }

    // Collect form data
    const formData = new FormData(form);
    const payload = {};
    formData.forEach((value, key) => {
      payload[key] = value;
    });

    // Ensure CSRF token is attached
    if (!payload._csrf) {
      payload._csrf = getCsrfTokenFromCookie();
    }

    // Capture stored UTM parameters
    ['utm_source', 'utm_medium', 'utm_campaign'].forEach((param) => {
      if (!payload[param]) {
        payload[param] = sessionStorage.getItem(`ak_${param}`) || '';
      }
    });

    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'X-CSRF-Token': payload._csrf
        },
        body: JSON.stringify(payload)
      });

      const data = await response.json();

      if (response.ok && data.ok) {
        // Trigger GA4 conversion event
        if (typeof window.gtag === 'function') {
          window.gtag('event', conversionEvent, {
            reference: data.reference,
            page_location: window.location.pathname
          });
        }

        // Success state
        form.style.display = 'none';
        if (successContainer) {
          successContainer.style.display = 'block';

          // Update reference display if present
          const refEl = successContainer.querySelector('.ref-id-display');
          if (refEl && data.reference) {
            refEl.textContent = data.reference;
          }

          // Update WhatsApp button with reference
          const waBtn = successContainer.querySelector('.btn-wa-action');
          if (waBtn && data.reference) {
            const currentHref = waBtn.getAttribute('href') || '';
            const updatedHref = `${currentHref}%20(Reference:%20${data.reference})`;
            waBtn.setAttribute('href', updatedHref);
          }

          successContainer.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      } else {
        // Validation or Rate Limit Errors
        form.dataset.submitting = 'false';
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.innerHTML = originalBtnText;
        }

        if (data.errors) {
          let focused = false;
          for (const [field, message] of Object.entries(data.errors)) {
            const input = form.querySelector(`[name="${field}"]`);
            if (input) {
              showFieldError(input, message);
              if (!focused) {
                input.focus();
                focused = true;
              }
            } else {
              showFormError(form, message);
            }
          }
        } else {
          showFormError(form, data.error || 'An unexpected error occurred. Please try again.');
        }
      }
    } catch (err) {
      form.dataset.submitting = 'false';
      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.innerHTML = originalBtnText;
      }
      showFormError(form, 'Network connection issue. Please verify your connection or message us directly on WhatsApp.');
    }
  });
}

function showFieldError(input, message) {
  input.classList.add('is-invalid');
  const parent = input.closest('.form-group') || input.parentElement;
  let errorEl = parent.querySelector('.form-error-msg');
  if (!errorEl) {
    errorEl = document.createElement('div');
    errorEl.className = 'form-error-msg is-visible';
    parent.appendChild(errorEl);
  }
  errorEl.textContent = message;
  errorEl.classList.add('is-visible');
}

function clearFieldError(input) {
  input.classList.remove('is-invalid');
  const parent = input.closest('.form-group') || input.parentElement;
  const errorEl = parent.querySelector('.form-error-msg');
  if (errorEl) {
    errorEl.classList.remove('is-visible');
    errorEl.textContent = '';
  }
}

function clearAllErrors(form) {
  form.querySelectorAll('.is-invalid').forEach((el) => el.classList.remove('is-invalid'));
  form.querySelectorAll('.form-error-msg').forEach((el) => {
    el.classList.remove('is-visible');
    el.textContent = '';
  });
  const formError = form.querySelector('.form-general-error');
  if (formError) formError.style.display = 'none';
}

function showFormError(form, message) {
  let formError = form.querySelector('.form-general-error');
  if (!formError) {
    formError = document.createElement('div');
    formError.className = 'form-general-error';
    formError.style.cssText = 'background: #FEE2E2; color: #991B1B; padding: 12px 16px; border-radius: 8px; margin-bottom: 16px; font-weight: 600; font-size: 0.92rem;';
    form.prepend(formError);
  }
  formError.textContent = message;
  formError.style.display = 'block';
  formError.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}
