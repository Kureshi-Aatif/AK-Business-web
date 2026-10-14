/**
 * Plans & Pricing Page Template
 */

export function renderPlansPage(site) {
  const plansCardsHtml = site.plans.map((p) => {
    const isFeatured = p.featured;
    const badgeHtml = isFeatured && p.badge
      ? `<div class="pricing-card__badge">${p.badge}</div>`
      : '';
    const featuredClass = isFeatured ? ' pricing-card--featured' : '';
    const btnClass = isFeatured ? 'btn--primary' : 'btn--outline';
    const turnaroundStyle = isFeatured ? ' style="color: var(--color-bright);"' : '';
    const priceStyle = isFeatured ? ' style="color: var(--color-royal);"' : '';

    const featuresHtml = p.features.map(f => `
            <li>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"></polyline></svg>
              <span>${f}</span>
            </li>`).join('');

    return `
        <!-- ${p.name} -->
        <article class="pricing-card${featuredClass} reveal" id="${p.id}">
          ${badgeHtml}
          <div class="plan-header">
            <h3 class="plan-name">${p.name}</h3>
            <div class="plan-turnaround"${turnaroundStyle}>Delivery: ${p.delivery}</div>
            <div class="plan-price-box">
              <span class="plan-price"${priceStyle}>${p.price}</span>
              <span class="plan-price-suffix">${p.suffix}</span>
            </div>
            <p class="plan-desc">
              ${p.desc}
            </p>
          </div>

          <ul class="plan-features">
            ${featuresHtml}
          </ul>

          <a href="/inquiry/?plan=${encodeURIComponent(p.name).replace(/%20/g, '+')}" class="btn ${btnClass}" style="width: 100%;">
            Choose ${p.name}
          </a>
        </article>`;
  }).join('\n');

  return `
<main id="main-content">
  <!-- Breadcrumbs -->
  <div class="container">
    <nav class="breadcrumbs" aria-label="Breadcrumb">
      <ol>
        <li><a href="/">Home</a></li>
        <li aria-current="page">Plans &amp; Pricing</li>
      </ol>
    </nav>
  </div>

  <!-- Page Header -->
  <section class="section section--ice" style="padding-bottom: 40px;">
    <div class="container text-center">
      <div class="section-header reveal" style="margin-bottom: 0;">
        <span class="badge badge--orange section-badge">Transparent Pricing</span>
        <h1>Transparent Website Design Plans in Surat</h1>
        <p>
          Fair, upfront investments starting at ₹4,999 tailored for startups, retail catalogues, and expanding e-commerce brands in Surat and Gujarat.
        </p>
        <div style="margin-top: 18px; display: flex; justify-content: center; gap: 12px; flex-wrap: wrap;">
          <button type="button" class="btn btn--outline-sky btn--sm btn-copy-plan" data-plan-slug="standard-catalogue">
            🔗 Copy plans link
          </button>
          <a href="${site.brochureUrl}" download="AK_Digital_Studio_Brochure.pdf" class="btn btn--white btn--sm" style="display: inline-flex; align-items: center; gap: 6px;">
            📄 Download brochure PDF
          </a>
        </div>
      </div>
    </div>
  </section>

  <!-- Website Plans Cards Section -->
  <section class="section">
    <div class="container">
      <div class="plans-grid">
${plansCardsHtml}
      </div>

      <!-- Add-ons with Dotted Leaders (All "onwards") -->
      <div class="addons-card reveal">
        <div style="text-align: center; max-width: 680px; margin: 0 auto 30px auto;">
          <span class="badge badge--sky" style="margin-bottom: 12px;">Customize Your Package</span>
          <h3>Popular Add-Ons &amp; Enhancements</h3>
          <p>Need extra features or specialized integrations? Combine any of our modular add-ons to fit your exact business goals.</p>
        </div>

        <div class="addons-list">
          <div class="addon-row">
            <span class="addon-title">Additional website page</span>
            <span class="addon-leader"></span>
            <span class="addon-price">₹800 onwards</span>
          </div>

          <div class="addon-row">
            <span class="addon-title">Dedicated landing page</span>
            <span class="addon-leader"></span>
            <span class="addon-price">₹2,000 onwards</span>
          </div>

          <div class="addon-row">
            <span class="addon-title">Advanced WhatsApp setup</span>
            <span class="addon-leader"></span>
            <span class="addon-price">₹500 onwards</span>
          </div>

          <div class="addon-row">
            <span class="addon-title">Custom contact/booking form</span>
            <span class="addon-leader"></span>
            <span class="addon-price">₹500 onwards</span>
          </div>

          <div class="addon-row">
            <span class="addon-title">Google Business Profile setup</span>
            <span class="addon-leader"></span>
            <span class="addon-price">₹1,000 onwards</span>
          </div>

          <div class="addon-row">
            <span class="addon-title">Basic on-page SEO for existing sites</span>
            <span class="addon-leader"></span>
            <span class="addon-price">₹2,000 onwards</span>
          </div>

          <div class="addon-row">
            <span class="addon-title">Content formatting &amp; upload</span>
            <span class="addon-leader"></span>
            <span class="addon-price">₹500 onwards</span>
          </div>
        </div>

        <!-- Hosting & Support Policy Note -->
        <div class="addons-note">
          <p>
            <strong>Important note:</strong> Hosting and domain costs are separate (Hostinger/MilesWeb); <strong>1 year of basic setup support</strong> included with every new website.
          </p>
        </div>
      </div>
    </div>
  </section>
</main>
`;
}
