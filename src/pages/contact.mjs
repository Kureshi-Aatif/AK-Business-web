/**
 * Contact Page Template
 */

export function renderContactPage(site) {
  return `
<main id="main-content">
  <!-- Breadcrumbs -->
  <div class="container">
    <nav class="breadcrumbs" aria-label="Breadcrumb">
      <ol>
        <li><a href="/">Home</a></li>
        <li aria-current="page">Contact Us</li>
      </ol>
    </nav>
  </div>

  <!-- Page Header -->
  <section class="section section--ice" style="padding-bottom: 40px;">
    <div class="container text-center">
      <div class="section-header reveal" style="margin-bottom: 0;">
        <span class="badge badge--orange section-badge">Get In Touch</span>
        <h1>Contact AK Digital Studio in Surat, Gujarat</h1>
        <p>
          Have questions about web development, pricing, or local SEO? We’re based in Surat, Gujarat and ready to assist you.
        </p>
      </div>
    </div>
  </section>

  <!-- Contact Layout Grid: Form + Navy Info Card & Process -->
  <section class="section">
    <div class="container">
      <div class="contact-layout-grid">
        <!-- Col 1: Contact Form -->
        <div class="form-container-card edge-corner-frame reveal">
          <h2 style="font-size: 1.6rem; margin-bottom: 8px;">Send a Direct Message</h2>
          <p style="margin-bottom: 24px; font-size: 0.95rem; color: var(--color-slate);">
            Fill out the form below for general inquiries, collaborations, or custom project questions.
          </p>

          <form id="contact-form" method="POST" action="/api/contact" novalidate>
            <!-- Anti-Spam Honeypots -->
            <input type="text" name="_gotcha" class="hp-field" tabindex="-1" autocomplete="off" aria-hidden="true" style="display:none!important;">
            <input type="text" name="website_url_hp" class="hp-field" tabindex="-1" autocomplete="off" aria-hidden="true" style="display:none!important;">
            <input type="hidden" name="_form_time" value="">

            <div class="form-grid">
              <!-- Name -->
              <div class="form-group">
                <label for="c_name" class="form-label">Your Name <span class="required">*</span></label>
                <input 
                  type="text" 
                  id="c_name" 
                  name="name" 
                  class="form-control" 
                  placeholder="e.g. Sameer Patel" 
                  required
                >
                <div class="form-error-msg"></div>
              </div>

              <!-- Email -->
              <div class="form-group">
                <label for="c_email" class="form-label">Email Address <span class="required">*</span></label>
                <input 
                  type="email" 
                  id="c_email" 
                  name="email" 
                  class="form-control" 
                  placeholder="e.g. sameer@example.com" 
                  required
                >
                <div class="form-error-msg"></div>
              </div>

              <!-- Phone (optional) -->
              <div class="form-group">
                <label for="c_phone" class="form-label">Phone / WhatsApp Number</label>
                <input 
                  type="tel" 
                  id="c_phone" 
                  name="phone" 
                  class="form-control" 
                  placeholder="e.g. +91 98251 23456"
                >
                <div class="form-error-msg"></div>
              </div>

              <!-- Subject -->
              <div class="form-group">
                <label for="c_subject" class="form-label">Subject <span class="required">*</span></label>
                <input 
                  type="text" 
                  id="c_subject" 
                  name="subject" 
                  class="form-control" 
                  placeholder="e.g. Inquiry about Standard Catalogue plan" 
                  required
                >
                <div class="form-error-msg"></div>
              </div>

              <!-- Message -->
              <div class="form-group">
                <label for="c_message" class="form-label">Your Message <span class="required">*</span></label>
                <textarea 
                  id="c_message" 
                  name="message" 
                  class="form-control" 
                  rows="5" 
                  placeholder="How can we assist you?" 
                  required
                ></textarea>
                <div class="form-error-msg"></div>
              </div>

              <!-- DPDP Consent -->
              <div class="form-group">
                <label class="checkbox-label">
                  <input type="checkbox" name="consent" value="true" required checked>
                  <span>I agree to be contacted regarding my message in compliance with the <a href="/privacy/" target="_blank" style="color: var(--color-royal); text-decoration: underline;">Privacy Policy</a>.</span>
                </label>
                <div class="form-error-msg"></div>
              </div>

              <!-- Submit -->
              <div style="margin-top: 14px;">
                <button type="submit" class="btn btn--primary btn--lg" style="width: 100%;">
                  Send Message
                </button>
              </div>
            </div>
          </form>
        </div>

        <!-- Col 2: Navy Info Card + QR Code + 3-Step Process -->
        <div style="display: flex; flex-direction: column; gap: 30px;">
          <!-- Official Studio Details Navy Info Card -->
          <div class="card card--navy reveal" style="padding: 36px;">
            <span class="badge badge--orange" style="margin-bottom: 14px;">Direct Studio Line</span>
            <h2 style="color: #fff; font-size: 1.6rem; margin-bottom: 12px;">Surat Studio Headquarters</h2>
            <p style="color: var(--color-sky); font-size: 0.96rem; margin-bottom: 24px;">
              Connect directly with Lead Developer Aatif Kureshi for immediate consultations, technical proposals, or pricing reviews.
            </p>

            <div class="details-items-row" style="margin-bottom: 28px;">
              <div class="details-badge-item">
                <div class="details-icon-box">
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
                </div>
                <div>
                  <div class="label">Lead Developer</div>
                  <div class="value">${escapeHtml(site.leadDeveloper)}</div>
                </div>
              </div>

              <div class="details-badge-item">
                <div class="details-icon-box">
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>
                </div>
                <div>
                  <div class="label">Location</div>
                  <div class="value">${escapeHtml(site.address)}</div>
                </div>
              </div>

              <div class="details-badge-item">
                <div class="details-icon-box">
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path></svg>
                </div>
                <div>
                  <div class="label">Phone / WhatsApp</div>
                  <div class="value"><a href="${site.phoneTel}" style="color: #fff;">${site.phoneDisplay}</a></div>
                </div>
              </div>

              <div class="details-badge-item">
                <div class="details-icon-box">
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></svg>
                </div>
                <div>
                  <div class="label">Direct Email</div>
                  <div class="value"><a href="${site.emailMailto}" style="color: #fff;">${escapeHtml(site.email)}</a></div>
                </div>
              </div>
            </div>

            <!-- 3 Required Action Buttons -->
            <div style="display: flex; gap: 12px; flex-wrap: wrap;">
              <a href="${site.whatsappLink}" target="_blank" rel="noopener" class="btn btn--primary" style="flex: 1 1 auto; text-align: center;">
                Chat on WhatsApp
              </a>
              <a href="${site.phoneTel}" class="btn btn--white" style="flex: 1 1 auto; text-align: center;">
                Call now
              </a>
              <a href="/portfolio/" class="btn btn--outline-sky" style="flex: 1 1 auto; text-align: center;">
                Portfolio
              </a>
            </div>
          </div>

          <!-- 3-Step Process Panel -->
          <div class="card reveal" style="padding: 32px; border: 1px solid var(--color-line);">
            <span class="badge badge--sky" style="margin-bottom: 12px;">Simple Workflow</span>
            <h3 style="margin-bottom: 18px;">How We Work With You</h3>

            <div style="display: flex; flex-direction: column; gap: 16px;">
              <div style="display: flex; gap: 14px; align-items: flex-start;">
                <div style="width: 32px; height: 32px; border-radius: 50%; background: var(--color-sky); color: var(--color-royal); display: flex; align-items: center; justify-content: center; font-weight: 800; font-family: var(--font-heading); flex-shrink: 0;">1</div>
                <div>
                  <h4 style="margin-bottom: 4px; font-size: 1.02rem;">Consultation</h4>
                  <p style="font-size: 0.9rem; color: var(--color-slate); margin: 0;">We analyze your requirements, recommend the optimal plan, and confirm the fixed price and delivery timeline.</p>
                </div>
              </div>

              <div style="display: flex; gap: 14px; align-items: flex-start;">
                <div style="width: 32px; height: 32px; border-radius: 50%; background: var(--color-sky); color: var(--color-royal); display: flex; align-items: center; justify-content: center; font-weight: 800; font-family: var(--font-heading); flex-shrink: 0;">2</div>
                <div>
                  <h4 style="margin-bottom: 4px; font-size: 1.02rem;">Creation &amp; Testing</h4>
                  <p style="font-size: 0.9rem; color: var(--color-slate); margin: 0;">We design, code, optimize speeds, configure Google Maps, and test forms across real mobile devices.</p>
                </div>
              </div>

              <div style="display: flex; gap: 14px; align-items: flex-start;">
                <div style="width: 32px; height: 32px; border-radius: 50%; background: var(--color-sky); color: var(--color-royal); display: flex; align-items: center; justify-content: center; font-weight: 800; font-family: var(--font-heading); flex-shrink: 0;">3</div>
                <div>
                  <h4 style="margin-bottom: 4px; font-size: 1.02rem;">Launch &amp; Grow</h4>
                  <p style="font-size: 0.9rem; color: var(--color-slate); margin: 0;">We deploy your site live to high-speed CDN, set up domain SSL, and back you with 1 year of setup support.</p>
                </div>
              </div>
            </div>
          </div>

          <!-- Instagram QR Code (Pointing to Official Instagram Profile) -->
          <div class="card reveal" style="padding: 28px; text-align: center; border: 1px solid var(--color-line); background: #ffffff;">
            <span class="badge badge--orange" style="margin-bottom: 12px;">Social Feed</span>
            <h4 style="margin-bottom: 8px;">Scan to Follow on Instagram</h4>
            <p style="font-size: 0.88rem; color: var(--color-slate); margin-bottom: 16px;">
              Scan this QR code with your phone camera or click to view our latest creative design projects.
            </p>
            <div style="display: inline-block; padding: 10px; background: #fff; border-radius: 12px; border: 1px solid var(--color-line); box-shadow: var(--shadow-sm);">
              <a href="${site.instagramUrl}" target="_blank" rel="noopener" aria-label="Open AK Digital Studio Instagram Profile">
                <img src="/img/qr-instagram.svg" alt="Instagram QR Code for AK Digital Studio" width="160" height="160" style="display: block; margin: 0 auto;">
              </a>
            </div>
            <div style="margin-top: 14px;">
              <a href="${site.instagramUrl}" target="_blank" rel="noopener" style="font-weight: 700; color: var(--color-royal); font-size: 0.92rem;">
                ${escapeHtml(site.instagram)} ↗
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</main>
<script type="module" src="/js/forms.js"></script>
`;
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
