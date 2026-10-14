import { API_BASE_URL, SITE_CONFIG } from './config.js';

document.addEventListener('DOMContentLoaded', () => {
  setupPreselection();
  setupInquiryForm();
  setupContactForm();
});

/**
 * Pre-select interest from URL query parameters (?plan=... or ?interest=...)
 */
function setupPreselection() {
  const params = new URLSearchParams(window.location.search);
  const target = params.get('plan') || params.get('interest');
  if (!target) return;

  const select = document.getElementById('interest') || document.querySelector('select[name="interest"]');
  if (!select) return;

  const normalized = target.toLowerCase().trim();
  for (const opt of select.options) {
    const val = opt.value.toLowerCase();
    const txt = opt.text.toLowerCase();
    if (val === normalized || txt === normalized || txt.includes(normalized) || val.includes(normalized)) {
      opt.selected = true;
      break;
    }
  }
}

/**
 * Setup Quote / Inquiry Form
 */
function setupInquiryForm() {
  const form = document.getElementById('inquiry-form');
  if (!form) return;

  // Minimum fill-time anti-spam
  const formStartTime = Date.now();
  const timeInput = form.querySelector('input[name="_form_time"]');
  if (timeInput) timeInput.value = formStartTime.toString();

  // Clear errors on input
  form.querySelectorAll('input, select, textarea').forEach(el => {
    el.addEventListener('input', () => clearError(el));
    el.addEventListener('change', () => clearError(el));
  });

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (form.dataset.submitting === 'true') return;

    clearAllErrors(form);

    const name = form.querySelector('[name="name"]');
    const email = form.querySelector('[name="email"]');
    const phone = form.querySelector('[name="phone"]');
    const businessName = form.querySelector('[name="business_name"]');
    const businessType = form.querySelector('[name="business_type"]');
    const interest = form.querySelector('[name="interest"]');
    const budget = form.querySelector('[name="budget"]');
    const timeline = form.querySelector('[name="timeline"]');
    const details = form.querySelector('[name="details"]');
    const contactMethod = form.querySelector('[name="contact_method"]');
    const consent = form.querySelector('[name="consent"]');
    const gotcha = form.querySelector('[name="_gotcha"]');
    const websiteHp = form.querySelector('[name="website_url_hp"]');

    let hasError = false;

    // Honeypot check
    if ((gotcha && gotcha.value) || (websiteHp && websiteHp.value)) {
      // Silently pretend success to fool spambots
      showSuccess(form, 'INQ-' + new Date().getFullYear() + '-SPAM', name ? name.value : 'Visitor');
      return;
    }

    // Minimum fill time check (3 seconds)
    if (Date.now() - formStartTime < 3000) {
      showFormError(form, 'Submission too fast. Please take a moment to review your details.');
      return;
    }

    // Validation
    if (!name.value.trim() || name.value.trim().length < 2) {
      showError(name, 'Please enter your full name (minimum 2 characters).');
      hasError = true;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email.value.trim() || !emailRegex.test(email.value.trim())) {
      showError(email, 'Please enter a valid email address.');
      hasError = true;
    }

    const phoneClean = phone.value.replace(/[\s\-\(\)]/g, '');
    const phoneRegex = /^(\+91)?[6-9]\d{9}$/;
    if (!phoneClean || !phoneRegex.test(phoneClean)) {
      showError(phone, 'Please enter a valid 10-digit Indian phone number.');
      hasError = true;
    }

    if (!interest.value.trim()) {
      showError(interest, 'Please select what service or plan you are interested in.');
      hasError = true;
    }

    if (!details.value.trim() || details.value.trim().length < 10) {
      showError(details, 'Please provide project details (minimum 10 characters).');
      hasError = true;
    } else if (details.value.trim().length > 2000) {
      showError(details, 'Project details must not exceed 2,000 characters.');
      hasError = true;
    }

    if (!consent.checked) {
      showError(consent, 'You must agree to be contacted regarding your inquiry.');
      hasError = true;
    }

    if (hasError) {
      const firstInvalid = form.querySelector('.is-invalid');
      if (firstInvalid) firstInvalid.focus();
      return;
    }

    // Fallback if running on GitHub Pages and no API_BASE_URL is configured
    const isGitHubPages = window.location.hostname.includes('github.io');
    if (isGitHubPages && !API_BASE_URL) {
      handleClientFallback({
        type: 'inquiry',
        name: name.value.trim(),
        email: email.value.trim(),
        phone: phoneClean,
        interest: interest.value.trim(),
        details: details.value.trim()
      }, form);
      return;
    }

    // Prepare payload
    const payload = {
      name: name.value.trim(),
      email: email.value.trim(),
      phone: phoneClean,
      business_name: businessName ? businessName.value.trim() : '',
      business_type: businessType ? businessType.value.trim() : '',
      interest: interest.value.trim(),
      budget: budget ? budget.value.trim() : '',
      timeline: timeline ? timeline.value.trim() : '',
      details: details.value.trim(),
      contact_method: contactMethod ? contactMethod.value.trim() : 'WhatsApp',
      consent: true,
      utm_source: sessionStorage.getItem('ak_utm_source') || '',
      utm_medium: sessionStorage.getItem('ak_utm_medium') || '',
      utm_campaign: sessionStorage.getItem('ak_utm_campaign') || ''
    };

    // Cloudflare Turnstile token if present
    const turnstileInput = form.querySelector('[name="cf-turnstile-response"]');
    if (turnstileInput && turnstileInput.value) {
      payload.turnstile_token = turnstileInput.value;
    }

    await submitForm(form, '/api/inquiry', payload, 'inquiry');
  });
}

/**
 * Setup General Contact Form
 */
function setupContactForm() {
  const form = document.getElementById('contact-form');
  if (!form) return;

  const formStartTime = Date.now();
  const timeInput = form.querySelector('input[name="_form_time"]');
  if (timeInput) timeInput.value = formStartTime.toString();

  form.querySelectorAll('input, select, textarea').forEach(el => {
    el.addEventListener('input', () => clearError(el));
    el.addEventListener('change', () => clearError(el));
  });

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (form.dataset.submitting === 'true') return;

    clearAllErrors(form);

    const name = form.querySelector('[name="name"]');
    const email = form.querySelector('[name="email"]');
    const phone = form.querySelector('[name="phone"]');
    const subject = form.querySelector('[name="subject"]');
    const message = form.querySelector('[name="message"]');
    const consent = form.querySelector('[name="consent"]');
    const gotcha = form.querySelector('[name="_gotcha"]');
    const websiteHp = form.querySelector('[name="website_url_hp"]');

    let hasError = false;

    if ((gotcha && gotcha.value) || (websiteHp && websiteHp.value)) {
      showSuccess(form, 'CNT-' + new Date().getFullYear() + '-SPAM', name ? name.value : 'Visitor');
      return;
    }

    if (Date.now() - formStartTime < 3000) {
      showFormError(form, 'Submission too fast. Please take a moment to review your message.');
      return;
    }

    if (!name.value.trim() || name.value.trim().length < 2) {
      showError(name, 'Please enter your name (minimum 2 characters).');
      hasError = true;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email.value.trim() || !emailRegex.test(email.value.trim())) {
      showError(email, 'Please enter a valid email address.');
      hasError = true;
    }

    const phoneVal = phone ? phone.value.trim() : '';
    let phoneClean = '';
    if (phoneVal) {
      phoneClean = phoneVal.replace(/[\s\-\(\)]/g, '');
      const phoneRegex = /^(\+91)?[6-9]\d{9}$/;
      if (!phoneRegex.test(phoneClean)) {
        showError(phone, 'Please enter a valid 10-digit Indian phone number (or leave blank).');
        hasError = true;
      }
    }

    if (!subject.value.trim() || subject.value.trim().length < 3) {
      showError(subject, 'Please specify a subject (minimum 3 characters).');
      hasError = true;
    }

    if (!message.value.trim() || message.value.trim().length < 10) {
      showError(message, 'Please provide a message (minimum 10 characters).');
      hasError = true;
    } else if (message.value.trim().length > 2000) {
      showError(message, 'Message must not exceed 2,000 characters.');
      hasError = true;
    }

    if (!consent.checked) {
      showError(consent, 'You must consent to being contacted regarding this message.');
      hasError = true;
    }

    if (hasError) {
      const firstInvalid = form.querySelector('.is-invalid');
      if (firstInvalid) firstInvalid.focus();
      return;
    }

    // Fallback if running on GitHub Pages without API_BASE_URL
    const isGitHubPages = window.location.hostname.includes('github.io');
    if (isGitHubPages && !API_BASE_URL) {
      handleClientFallback({
        type: 'contact',
        name: name.value.trim(),
        email: email.value.trim(),
        phone: phoneClean,
        subject: subject.value.trim(),
        message: message.value.trim()
      }, form);
      return;
    }

    const payload = {
      name: name.value.trim(),
      email: email.value.trim(),
      phone: phoneClean,
      subject: subject.value.trim(),
      message: message.value.trim(),
      consent: true,
      utm_source: sessionStorage.getItem('ak_utm_source') || '',
      utm_medium: sessionStorage.getItem('ak_utm_medium') || '',
      utm_campaign: sessionStorage.getItem('ak_utm_campaign') || ''
    };

    const turnstileInput = form.querySelector('[name="cf-turnstile-response"]');
    if (turnstileInput && turnstileInput.value) {
      payload.turnstile_token = turnstileInput.value;
    }

    await submitForm(form, '/api/contact', payload, 'contact');
  });
}

/**
 * Execute AJAX Submission
 */
async function submitForm(form, endpoint, payload, type) {
  const submitBtn = form.querySelector('button[type="submit"]');
  const originalBtnHtml = submitBtn ? submitBtn.innerHTML : 'Submit';

  form.dataset.submitting = 'true';
  if (submitBtn) {
    submitBtn.disabled = true;
    submitBtn.innerHTML = `
      <svg class="spinner" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" style="animation: spin 0.8s linear infinite; display: inline-block; vertical-align: middle; margin-right: 8px;">
        <circle cx="12" cy="12" r="10" stroke-opacity="0.25"></circle>
        <path d="M12 2 A10 10 0 0 1 22 12"></path>
      </svg>
      <span>Submitting...</span>
    `;
  }

  const url = (API_BASE_URL || '') + endpoint;

  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    const data = await res.json().catch(() => ({}));

    if (res.ok && data.ok) {
      showSuccess(form, data.reference, payload.name, type);
    } else {
      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.innerHTML = originalBtnHtml;
      }
      form.dataset.submitting = 'false';

      if (data.errors && typeof data.errors === 'object') {
        let firstInput = null;
        for (const [field, msg] of Object.entries(data.errors)) {
          const input = form.querySelector(`[name="${field}"]`);
          if (input) {
            showError(input, msg);
            if (!firstInput) firstInput = input;
          }
        }
        if (firstInput) firstInput.focus();
        showFormError(form, data.error || 'Please correct the highlighted errors above.');
      } else {
        showFormError(form, data.error || 'Unable to submit your details. Please try again or message us directly on WhatsApp.');
      }
    }
  } catch (err) {
    if (submitBtn) {
      submitBtn.disabled = false;
      submitBtn.innerHTML = originalBtnHtml;
    }
    form.dataset.submitting = 'false';

    // Network error fallback
    showFormError(form, `Network connection error. You can reach us directly on WhatsApp: <a href="https://wa.me/${SITE_CONFIG.whatsappNumber}?text=${encodeURIComponent(`Hi AK Digital Studio, I attempted to submit the ${type} form for ${payload.name} but had a connection error.`)}" target="_blank" rel="noopener" style="text-decoration: underline; font-weight: 700; color: inherit;">Open WhatsApp</a>`);
  }
}

/**
 * Client-Side Fallback for GitHub Pages without server
 */
function handleClientFallback(data, form) {
  const isContact = data.type === 'contact';
  const waText = isContact
    ? `Hi AK Digital Studio, my name is ${data.name}. Subject: ${data.subject}. Message: ${data.message}`
    : `Hi AK Digital Studio, my name is ${data.name}. Interested in: ${data.interest}. Project Details: ${data.details}`;

  const waUrl = `https://wa.me/${SITE_CONFIG.whatsappNumber}?text=${encodeURIComponent(waText)}`;
  const mailSubject = encodeURIComponent(isContact ? `Contact: ${data.subject}` : `Inquiry: ${data.interest}`);
  const mailBody = encodeURIComponent(`Name: ${data.name}\nEmail: ${data.email}\nPhone: ${data.phone || 'N/A'}\n\nDetails:\n${isContact ? data.message : data.details}`);
  const mailUrl = `mailto:${SITE_CONFIG.email}?subject=${mailSubject}&body=${mailBody}`;

  // Open WhatsApp
  window.open(waUrl, '_blank', 'noopener');

  // Show fallback card
  const container = form.parentElement;
  container.innerHTML = `
    <div class="form-success-card" style="text-align: center; padding: 40px 24px;">
      <div class="success-icon-badge" style="width: 64px; height: 64px; border-radius: 50%; background: #E6EEFF; color: #0B3FD8; display: inline-flex; align-items: center; justify-content: center; margin-bottom: 20px;">
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"></polyline></svg>
      </div>
      <h2 style="margin-bottom: 12px; color: #071A57;">Almost Done!</h2>
      <p style="color: #4B5B86; font-size: 1.05rem; max-width: 540px; margin: 0 auto 24px auto;">
        We've opened WhatsApp with your pre-filled inquiry details. You can also send this inquiry directly via email:
      </p>
      <div style="display: flex; gap: 14px; justify-content: center; flex-wrap: wrap;">
        <a href="${waUrl}" target="_blank" rel="noopener" class="btn btn--primary btn--lg" style="background: #25D366; border-color: #25D366;">
          <span>Chat on WhatsApp</span>
        </a>
        <a href="${mailUrl}" class="btn btn--royal btn--lg">
          <span>Send via Email</span>
        </a>
      </div>
    </div>
  `;
}

/**
 * Display Success Card with Reference ID & WhatsApp Continue Button
 */
function showSuccess(form, reference, name, type) {
  const container = form.parentElement;
  const isContact = type === 'contact';
  const waMessage = isContact
    ? `Hi AK Digital Studio, I just submitted a message on your website with Reference ID: ${reference}`
    : `Hi AK Digital Studio, I just submitted a project inquiry with Reference ID: ${reference}`;
  const waUrl = `https://wa.me/${SITE_CONFIG.whatsappNumber}?text=${encodeURIComponent(waMessage)}`;

  container.innerHTML = `
    <div class="form-success-card" style="text-align: center; padding: 40px 24px;">
      <div class="success-icon-badge" style="width: 68px; height: 68px; border-radius: 50%; background: #E6EEFF; color: #0B3FD8; display: inline-flex; align-items: center; justify-content: center; margin-bottom: 20px;">
        <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><polyline points="20 6 9 17 4 12"></polyline></svg>
      </div>
      <h2 style="font-size: 1.8rem; margin-bottom: 12px; color: #071A57;">Thank You, ${escapeHtml(name)}!</h2>
      <p style="color: #4B5B86; font-size: 1.05rem; max-width: 580px; margin: 0 auto 20px auto;">
        Your submission has been securely recorded. Lead Developer Aatif Kureshi will review your request and get back to you shortly.
      </p>
      
      <div style="background: #E6EEFF; border: 1.5px dashed #0B3FD8; border-radius: 12px; padding: 16px; max-width: 420px; margin: 0 auto 28px auto;">
        <div style="font-size: 0.85rem; font-weight: 700; color: #4B5B86; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 4px;">Your Reference ID</div>
        <div style="font-family: monospace; font-size: 1.5rem; font-weight: 800; color: #0B3FD8;">${escapeHtml(reference)}</div>
      </div>

      <p style="font-size: 0.95rem; color: #4B5B86; margin-bottom: 24px;">
        Save this reference ID for fast lookups. You can also fast-track your inquiry directly on WhatsApp:
      </p>

      <div style="display: flex; gap: 14px; justify-content: center; flex-wrap: wrap;">
        <a href="${waUrl}" target="_blank" rel="noopener" class="btn btn--primary btn--lg" style="background: #25D366; border-color: #25D366;">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" style="display: inline-block; vertical-align: middle; margin-right: 8px;"><path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981z"/></svg>
          <span>Continue on WhatsApp</span>
        </a>
        <a href="/" class="btn btn--outline btn--lg">Return to Home</a>
      </div>
    </div>
  `;
}

function showError(input, msg) {
  input.classList.add('is-invalid');
  const group = input.closest('.form-group') || input.parentElement;
  let errDiv = group.querySelector('.form-error-msg');
  if (!errDiv) {
    errDiv = document.createElement('div');
    errDiv.className = 'form-error-msg';
    group.appendChild(errDiv);
  }
  errDiv.textContent = msg;
  errDiv.classList.add('is-visible');
}

function clearError(input) {
  input.classList.remove('is-invalid');
  const group = input.closest('.form-group') || input.parentElement;
  const errDiv = group.querySelector('.form-error-msg');
  if (errDiv) {
    errDiv.textContent = '';
    errDiv.classList.remove('is-visible');
  }
}

function clearAllErrors(form) {
  form.querySelectorAll('.is-invalid').forEach(el => el.classList.remove('is-invalid'));
  form.querySelectorAll('.form-error-msg').forEach(el => {
    el.textContent = '';
    el.classList.remove('is-visible');
  });
  const generalError = form.querySelector('.form-general-error');
  if (generalError) generalError.remove();
}

function showFormError(form, msg) {
  let generalError = form.querySelector('.form-general-error');
  if (!generalError) {
    generalError = document.createElement('div');
    generalError.className = 'form-general-error';
    generalError.style.cssText = 'background: #FEE2E2; color: #991B1B; padding: 14px 18px; border-radius: 10px; margin-bottom: 20px; font-weight: 600; font-size: 0.95rem; border: 1px solid #FCA5A5;';
    form.prepend(generalError);
  }
  generalError.innerHTML = msg;
  generalError.scrollIntoView({ behavior: 'smooth', block: 'center' });
}

function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}
