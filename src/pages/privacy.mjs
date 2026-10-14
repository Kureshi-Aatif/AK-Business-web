/**
 * Privacy Policy Page Template
 */

export function renderPrivacyPage(site) {
  return `
<main class="section" id="main-content">
  <div class="container" style="max-width: 840px;">
    <!-- Breadcrumbs -->
    <nav class="breadcrumbs" aria-label="Breadcrumb" style="margin-bottom: 20px;">
      <ol>
        <li><a href="/">Home</a></li>
        <li aria-current="page">Privacy Policy</li>
      </ol>
    </nav>

    <div class="card reveal" style="padding: clamp(32px, 5vw, 50px);">
      <span class="badge badge--sky" style="margin-bottom: 14px;">DPDP Act &amp; Data Transparency</span>
      <h1 style="font-size: 2.2rem; margin-bottom: 16px;">Privacy Policy &amp; Data Governance</h1>
      <p style="font-size: 0.9rem; color: var(--color-slate); margin-bottom: 30px;">
        Last updated: October 2026 &bull; ${escapeHtml(site.name)}, Surat, Gujarat, India
      </p>

      <div style="display: flex; flex-direction: column; gap: 20px; font-size: 0.98rem; color: var(--color-navy); line-height: 1.7;">
        <h3 style="font-size: 1.3rem;">1. Commitment to India's DPDP Act</h3>
        <p>
          ${escapeHtml(site.name)} operates under strict adherence to the principles of India’s <strong>Digital Personal Data Protection (DPDP) Act</strong>: unambiguous consent, purpose limitation, data minimization, storage limitation, and right to correction and erasure.
        </p>

        <h3 style="font-size: 1.3rem;">2. Information We Collect and Purpose Limitation</h3>
        <p>
          We only collect personal information that you intentionally provide to us through our quote request form, contact form, or direct communication channels:
          <br>&bull; <strong>Identity &amp; Contact:</strong> Full name, business title, official email address, and phone/WhatsApp number.
          <br>&bull; <strong>Project Specifications:</strong> Business sector, project brief, budget parameters, and desired launch timeline.
          <br>&bull; <strong>Technical Telemetry:</strong> For security and spam deterrence, IP addresses are irreversibly hashed using salted SHA-256 before storage.
        </p>

        <h3 style="font-size: 1.3rem;">3. Web Analytics &amp; Cookies</h3>
        <p>
          We utilize minimal performance telemetry to evaluate page performance, speed, and form delivery. We do not sell or monetize personal tracking data.
        </p>

        <h3 style="font-size: 1.3rem;">4. Data Sharing &amp; Third Parties</h3>
        <p>
          We do <strong>not</strong> sell, rent, monetize, or disclose your personal data to data brokers or advertisers. Data is exclusively accessed by Lead Developer ${escapeHtml(site.leadDeveloper)} and authorized studio personnel for drafting project proposals and ongoing maintenance.
        </p>

        <h3 style="font-size: 1.3rem;">5. Data Retention &amp; Your Right to Erasure</h3>
        <p>
          We retain inquiry records for a maximum of 24 months to support ongoing maintenance agreements and warranty support. You retain the unconditional right to request a copy of your records or immediate permanent deletion by contacting us:  
          <br><strong>Email:</strong> <a href="${site.emailMailto}" style="color: var(--color-royal); font-weight: 700;">${escapeHtml(site.email)}</a>  
          <br><strong>Location:</strong> ${escapeHtml(site.address)}
        </p>
      </div>

      <div style="margin-top: 36px; padding-top: 24px; border-top: 1px solid var(--color-line);">
        <a href="/" class="btn btn--outline">&larr; Return to Home</a>
      </div>
    </div>
  </div>
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
