/**
 * Why a Website Page Template
 */

export function renderWhyWebsitePage(site) {
  return `
<main id="main-content">
  <!-- Breadcrumbs -->
  <div class="container">
    <nav class="breadcrumbs" aria-label="Breadcrumb">
      <ol>
        <li><a href="/">Home</a></li>
        <li aria-current="page">Why a Website</li>
      </ol>
    </nav>
  </div>

  <!-- Page Header -->
  <section class="section section--ice" style="padding-bottom: 40px;">
    <div class="container text-center">
      <div class="section-header reveal" style="margin-bottom: 0;">
        <span class="badge badge--orange section-badge">Why a Website</span>
        <h1>Why Every Local Business in Surat Needs a Website</h1>
        <p style="font-size: 1.25rem; font-weight: 700; color: var(--color-royal); margin-top: 8px;">
          Turn clicks into customers.
        </p>
        <p style="max-width: 720px; margin: 12px auto 0;">
          In today’s digital era, your website is your 24/7 digital storefront, top salesperson, and definitive trust verification for every customer in Surat and worldwide.
        </p>
      </div>
    </div>
  </section>

  <!-- 4 Core Benefit Cards -->
  <section class="section">
    <div class="container">
      <div class="benefits-grid">
        <!-- Benefit 1 -->
        <article class="card benefit-card reveal">
          <div class="benefit-icon-badge">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg>
          </div>
          <h3 style="margin-bottom: 12px;">Build Instant Credibility</h3>
          <p>
            84% of consumers believe a business with a dedicated, polished website is dramatically more trustworthy than one having only an unverified social media profile. A custom domain immediately proves you are legitimate, professional, and serious about your craft.
          </p>
        </article>

        <!-- Benefit 2 -->
        <article class="card benefit-card reveal">
          <div class="benefit-icon-badge">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
          </div>
          <h3 style="margin-bottom: 12px;">Generate Leads 24/7</h3>
          <p>
            While your physical office or retail shutter closes for the evening, your website continues serving product details, receiving quotation requests, and funneling interested buyers directly to your WhatsApp line round-the-clock without missing a single lead.
          </p>
        </article>

        <!-- Benefit 3 -->
        <article class="card benefit-card reveal">
          <div class="benefit-icon-badge">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>
          </div>
          <h3 style="margin-bottom: 12px;">Rank on Google Maps</h3>
          <p>
            When customers search for your products in Surat or Gujarat, Google favors verified businesses with linked, mobile-friendly websites with rich schema. Dominate local keyword searches and appear in the coveted Google Local 3-Pack.
          </p>
        </article>

        <!-- Benefit 4 -->
        <article class="card benefit-card reveal">
          <div class="benefit-icon-badge">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><line x1="12" y1="1" x2="12" y2="23"></line><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path></svg>
          </div>
          <h3 style="margin-bottom: 12px;">Cost-Effective Marketing</h3>
          <p>
            Physical pamphlets, newspaper advertisements, and banners get discarded within days. A custom website is an enduring digital asset that compounds in value over time, providing continuous customer acquisition for a fraction of recurring ad costs.
          </p>
        </article>
      </div>
    </div>
  </section>

  <!-- Dark "Without a Website vs With a Website" Comparison Band -->
  <section class="section" style="padding-top: 0;">
    <div class="container">
      <div class="comparison-band reveal">
        <div style="text-align: center; max-width: 680px; margin: 0 auto 30px auto;">
          <span class="badge badge--orange" style="margin-bottom: 14px;">Direct Reality Check</span>
          <h2 style="color: #fff; margin-bottom: 14px;">The Cost of Staying Invisible</h2>
          <p style="color: var(--color-sky);">
            Compare how your business performs when competing in modern local and national commerce:
          </p>
        </div>

        <div class="comparison-grid">
          <!-- Column 1: Without a Website -->
          <div class="comp-col comp-col--without">
            <h3 style="color: #F87171; display: flex; align-items: center; gap: 8px;">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="10"></circle><line x1="15" y1="9" x2="9" y2="15"></line><line x1="9" y1="9" x2="15" y2="15"></line></svg>
              <span>Without a Website</span>
            </h3>
            <ul style="list-style: none; margin: 20px 0 0 0; display: flex; flex-direction: column; gap: 14px;">
              <li style="display: flex; gap: 10px; color: #FCA5A5;">
                <span style="font-weight: 800;">&times;</span>
                <span>Invisible on Google when local customers search for your products</span>
              </li>
              <li style="display: flex; gap: 10px; color: #FCA5A5;">
                <span style="font-weight: 800;">&times;</span>
                <span>Prospective clients question your legitimacy or assume you closed</span>
              </li>
              <li style="display: flex; gap: 10px; color: #FCA5A5;">
                <span style="font-weight: 800;">&times;</span>
                <span>Zero sales leads captured after your physical store shutters at night</span>
              </li>
              <li style="display: flex; gap: 10px; color: #FCA5A5;">
                <span style="font-weight: 800;">&times;</span>
                <span>Forced to repeatedly type out product catalogs and prices on WhatsApp manually</span>
              </li>
              <li style="display: flex; gap: 10px; color: #FCA5A5;">
                <span style="font-weight: 800;">&times;</span>
                <span>Dependent entirely on unpredictable third-party social media algorithms</span>
              </li>
            </ul>
          </div>

          <!-- Column 2: With an AK Digital Studio Website -->
          <div class="comp-col comp-col--with">
            <h3 style="color: #3CCB5A; display: flex; align-items: center; gap: 8px;">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"></polyline></svg>
              <span>With an AK Digital Website</span>
            </h3>
            <ul style="list-style: none; margin: 20px 0 0 0; display: flex; flex-direction: column; gap: 14px;">
              <li style="display: flex; gap: 10px; color: #86EFAC;">
                <span style="font-weight: 800;">✓</span>
                <span>High-ranking Google Maps presence driving daily local phone calls</span>
              </li>
              <li style="display: flex; gap: 10px; color: #86EFAC;">
                <span style="font-weight: 800;">✓</span>
                <span>Instant brand trust with a professional domain and custom design</span>
              </li>
              <li style="display: flex; gap: 10px; color: #86EFAC;">
                <span style="font-weight: 800;">✓</span>
                <span>24/7 automated inquiry capture directly connected to your WhatsApp</span>
              </li>
              <li style="display: flex; gap: 10px; color: #86EFAC;">
                <span style="font-weight: 800;">✓</span>
                <span>Interactive product catalogue with images, specifications &amp; quick quote triggers</span>
              </li>
              <li style="display: flex; gap: 10px; color: #86EFAC;">
                <span style="font-weight: 800;">✓</span>
                <span>100% digital asset ownership with zero commission fees</span>
              </li>
            </ul>
          </div>
        </div>

        <div style="text-align: center; margin-top: 36px;">
          <a href="/plans/" class="btn btn--primary btn--lg">Explore affordable website plans</a>
        </div>
      </div>
    </div>
  </section>
</main>
`;
}
