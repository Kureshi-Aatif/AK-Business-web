/**
 * Individual Service Detail Page Template
 */

export function renderServiceDetailPage(site, service) {
  return `
<main id="main-content">
  <!-- Breadcrumbs -->
  <div class="container">
    <nav class="breadcrumbs" aria-label="Breadcrumb">
      <ol>
        <li><a href="/">Home</a></li>
        <li><a href="/services/">Services</a></li>
        <li aria-current="page">${escapeHtml(service.title)}</li>
      </ol>
    </nav>
  </div>

  <!-- Service Hero Section with 3D Illustration -->
  <section class="section section--ice" aria-labelledby="service-title">
    <div class="container">
      <div class="service-hero-grid">
        <div class="reveal">
          <span class="badge badge--orange section-badge">${escapeHtml(service.badge)}</span>
          <h1 id="service-title" style="margin-bottom: 18px;">${escapeHtml(service.heroHeadline)}</h1>
          <p style="font-size: 1.15rem; color: var(--color-slate); margin-bottom: 28px; line-height: 1.6;">
            ${escapeHtml(service.heroSubtitle)}
          </p>

          <div style="display: flex; flex-wrap: wrap; gap: 8px; margin-bottom: 32px;">
            ${service.chips.map(chip => `
              <span class="pill-item">${escapeHtml(chip)}</span>
            `).join('')}
          </div>

          <div style="display: flex; flex-wrap: wrap; gap: 14px;">
            <a href="/inquiry/?interest=${encodeURIComponent(service.title)}" class="btn btn--primary btn--lg">
              Inquire about this service
            </a>
            <a href="/plans/" class="btn btn--outline btn--lg">
              View Website Plans
            </a>
          </div>
        </div>

        <div class="reveal" style="text-align: center;">
          <img src="${service.illustration}" alt="${escapeHtml(service.title)} illustration in Surat" width="380" height="380" style="max-height: 380px; width: auto; margin: 0 auto;">
        </div>
      </div>
    </div>
  </section>

  <!-- "What We Offer" Grid -->
  <section class="section" aria-labelledby="offer-heading">
    <div class="container">
      <div class="section-header reveal">
        <span class="badge badge--sky section-badge">What We Offer</span>
        <h2 id="offer-heading">What We Deliver for Your Brand in Surat</h2>
        <p>Every deliverable is custom-engineered with production-ready standards, zero fluff, and full ownership transferred to you upon completion.</p>
      </div>

      <div class="offerings-grid">
        ${service.offerings.map(item => `
          <div class="offering-card reveal">
            <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 14px;">
              <div style="width: 32px; height: 32px; border-radius: 8px; background: var(--color-sky); display: flex; align-items: center; justify-content: center; color: var(--color-royal);">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"></polyline></svg>
              </div>
              <h3 style="font-size: 1.15rem; margin: 0;">${escapeHtml(item.title)}</h3>
            </div>
            <p style="font-size: 0.94rem; color: var(--color-slate); margin: 0;">
              ${escapeHtml(item.desc)}
            </p>
          </div>
        `).join('')}
      </div>
    </div>
  </section>

  <!-- "Perfect For" Pills & Tech Stack -->
  <section class="section section--ice" aria-labelledby="perfect-for-heading">
    <div class="container">
      <div style="display: grid; grid-template-columns: 1fr; gap: 40px; align-items: start;" class="tech-perfect-grid">
        <!-- Perfect For -->
        <div class="card reveal" style="padding: 40px;">
          <span class="badge badge--sky" style="margin-bottom: 12px;">Target Sectors</span>
          <h3 id="perfect-for-heading" style="margin-bottom: 16px;">Perfect For These Businesses</h3>
          <p style="margin-bottom: 24px;">Our solutions are custom tuned for specific commercial workflows across Surat and Gujarat:</p>
          <div class="pills-cloud">
            ${service.perfectFor.map(item => `
              <div class="pill-item" style="background: #ffffff; border-color: var(--color-line); font-weight: 700;">
                <span style="color: var(--color-orange); margin-right: 4px;">&bull;</span> ${escapeHtml(item)}
              </div>
            `).join('')}
          </div>
        </div>

        <!-- Tech Stack & Direct Collaboration -->
        <div class="card card--navy reveal" style="padding: 40px;">
          <span class="badge badge--orange" style="margin-bottom: 12px;">Standard Specifications</span>
          <h3 style="color: #fff; margin-bottom: 16px;">Technologies &amp; Quality Tools</h3>
          <p style="color: var(--color-sky); margin-bottom: 24px;">Built using industry-standard production tools and verified methodologies:</p>
          <div class="pills-cloud">
            <div class="pill-item" style="background: rgba(255, 255, 255, 0.1); border-color: rgba(255, 255, 255, 0.2); color: #fff;">Semantic HTML5 &amp; CSS3</div>
            <div class="pill-item" style="background: rgba(255, 255, 255, 0.1); border-color: rgba(255, 255, 255, 0.2); color: #fff;">Vanilla JS (No Framework Bloat)</div>
            <div class="pill-item" style="background: rgba(255, 255, 255, 0.1); border-color: rgba(255, 255, 255, 0.2); color: #fff;">Google Maps &amp; Schema SEO</div>
            <div class="pill-item" style="background: rgba(255, 255, 255, 0.1); border-color: rgba(255, 255, 255, 0.2); color: #fff;">WhatsApp Automation Triggers</div>
            <div class="pill-item" style="background: rgba(255, 255, 255, 0.1); border-color: rgba(255, 255, 255, 0.2); color: #fff;">Cloudflare Edge CDN</div>
          </div>

          <div style="margin-top: 32px; border-top: 1px solid rgba(255, 255, 255, 0.15); padding-top: 24px;">
            <a href="/inquiry/?interest=${encodeURIComponent(service.title)}" class="btn btn--primary" style="width: 100%;">
              Get a tailored quote for ${service.title.split(' ')[0]}
            </a>
          </div>
        </div>
      </div>
    </div>
  </section>

  <!-- CTA Band -->
  <section class="section" style="padding-top: 0;">
    <div class="container">
      <div class="cta-band reveal">
        <h2>Start Your ${escapeHtml(service.title)} Project</h2>
        <p>Get in touch with Aatif Kureshi to discuss your requirements, review timeline options, and receive a fixed transparent quote.</p>
        <div class="cta-band-actions">
          <a href="/inquiry/?interest=${encodeURIComponent(service.title)}" class="btn btn--primary btn--lg">Request project quote</a>
          <a href="/contact/" class="btn btn--white btn--lg">Contact studio</a>
        </div>
      </div>
    </div>
  </section>
</main>
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
