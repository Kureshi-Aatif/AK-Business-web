/**
 * Portfolio Page Template
 */

export function renderPortfolioPage(site) {
  return `
<main id="main-content">
  <!-- Breadcrumbs -->
  <div class="container">
    <nav class="breadcrumbs" aria-label="Breadcrumb">
      <ol>
        <li><a href="/">Home</a></li>
        <li aria-current="page">Portfolio</li>
      </ol>
    </nav>
  </div>

  <!-- Hero Section -->
  <section class="section section--ice" style="padding-bottom: 40px;">
    <div class="container text-center">
      <div class="section-header reveal" style="margin-bottom: 0;">
        <span class="badge badge--orange section-badge">Verified Work</span>
        <h1>Our portfolio.</h1>
        <p style="max-width: 680px; margin: 12px auto 24px auto;">
          Browse live project screenshots, branding identities, and completed digital platforms directly inside our verified Google Drive archive.
        </p>
        <div style="display: flex; justify-content: center; gap: 14px; flex-wrap: wrap;">
          <a href="${site.portfolioUrl}" target="_blank" rel="noopener" class="btn btn--primary btn--lg">
            <span>Open portfolio on Google Drive ↗</span>
          </a>
          <a href="/inquiry/" class="btn btn--outline btn--lg">
            <span>Start your project</span>
          </a>
        </div>
      </div>
    </div>
  </section>

  <!-- Google Drive Embedded Folder Gallery -->
  <section class="section">
    <div class="container">
      <div class="portfolio-gallery-card reveal">
        <iframe 
          src="${site.portfolioEmbedUrl}" 
          class="portfolio-iframe" 
          title="AK Digital Studio Portfolio Gallery on Google Drive"
          loading="lazy"
        ></iframe>

        <noscript>
          <div style="text-align: center; padding: 30px; background: #F4F7FF; border-radius: 12px; margin-top: 14px;">
            <p style="font-weight: 700; margin-bottom: 12px;">JavaScript is disabled in your browser.</p>
            <a href="${site.portfolioUrl}" target="_blank" rel="noopener" class="btn btn--primary">
              Open Portfolio on Google Drive ↗
            </a>
          </div>
        </noscript>

        <p class="portfolio-fallback-note">
          If the gallery does not load, open it with the button above.
        </p>
      </div>

      <!-- Quick Contact CTA -->
      <div style="text-align: center; margin-top: 50px;" class="reveal">
        <h3>Ready to Build Something Similar for Your Business?</h3>
        <p style="color: var(--color-slate); margin: 10px auto 24px auto; max-width: 600px;">
          Tell us about your brand vision, target customers, and features. We'll provide a written plan and price estimate within 24 hours.
        </p>
        <div style="display: flex; justify-content: center; gap: 14px; flex-wrap: wrap;">
          <a href="/inquiry/" class="btn btn--primary btn--lg">Get a free proposal</a>
          <a href="${site.whatsappLink}" target="_blank" rel="noopener" class="btn btn--white btn--lg">Chat on WhatsApp</a>
        </div>
      </div>
    </div>
  </section>
</main>
`;
}
