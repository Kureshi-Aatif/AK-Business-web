/**
 * FAQ Page Template
 */

export function renderFaqPage(site) {
  return `
<main id="main-content">
  <!-- Breadcrumbs -->
  <div class="container">
    <nav class="breadcrumbs" aria-label="Breadcrumb">
      <ol>
        <li><a href="/">Home</a></li>
        <li aria-current="page">Frequently Asked Questions</li>
      </ol>
    </nav>
  </div>

  <!-- Page Header -->
  <section class="section section--ice" style="padding-bottom: 40px;">
    <div class="container text-center">
      <div class="section-header reveal" style="margin-bottom: 0;">
        <span class="badge badge--orange section-badge">Help &amp; Transparency</span>
        <h1>Frequently Asked Questions</h1>
        <p>
          Genuine answers to 10 common questions about website design costs, delivery timelines, domain hosting, Google SEO, and ongoing support from our website design company in Surat.
        </p>
      </div>
    </div>
  </section>

  <!-- FAQ Accordion Section -->
  <section class="section">
    <div class="container">
      <div class="faq-accordion reveal">
        ${site.faqs.map((item, idx) => `
          <details class="faq-item" ${idx === 0 ? 'open' : ''}>
            <summary class="faq-question">
              <span>${escapeHtml(item.q)}</span>
            </summary>
            <div class="faq-answer">
              <p>${escapeHtml(item.a)}</p>
            </div>
          </details>
        `).join('')}
      </div>

      <!-- Still have questions card -->
      <div class="card reveal" style="max-width: 840px; margin: 40px auto 0; padding: 32px; text-align: center; background: var(--color-ice); border: 1px solid var(--color-line);">
        <h3>Have a Specific Question About Your Project?</h3>
        <p style="margin: 12px 0 24px; color: var(--color-slate);">
          Lead Developer Aatif Kureshi is available directly via WhatsApp or phone call to review your project scope and provide immediate answers.
        </p>
        <div style="display: flex; justify-content: center; gap: 14px; flex-wrap: wrap;">
          <a href="/inquiry/" class="btn btn--primary">Request a Custom Quote</a>
          <a href="${site.whatsappLink}" target="_blank" rel="noopener" class="btn btn--white">
            Chat on WhatsApp
          </a>
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
