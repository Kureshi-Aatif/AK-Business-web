/**
 * Shared Footer Partial
 */

export function renderFooter(site) {
  const currentYear = new Date().getFullYear();

  return `
<footer class="site-footer" role="contentinfo">
  <div class="container">
    <div class="footer-grid">
      <!-- Col 1: Brand Info -->
      <div class="footer-col">
        <div style="margin-bottom: 20px;">
          <a href="/" aria-label="${escapeHtml(site.name)}" style="display: inline-flex; align-items: center; background: #ffffff; padding: 6px 14px; margin-left: -14px; border-radius: var(--radius-md); box-shadow: 0 4px 14px rgba(0, 0, 0, 0.15);">
            <img src="/img/logo.svg" alt="${escapeHtml(site.name)}" style="height: 48px; width: auto; display: block;">
          </a>
        </div>
        <p style="color: var(--color-sky); font-size: 0.94rem; margin-bottom: 16px; font-weight: 700; text-transform: none;">
          ${escapeHtml(site.tagline)}
        </p>
        <p style="color: var(--color-slate); font-size: 0.88rem; margin-bottom: 20px; line-height: 1.5;">
          Premier digital agency in Surat, Gujarat specializing in custom, high-speed website development, local SEO, and conversion-engineered digital experiences.
        </p>
        <a href="${site.brochureUrl}" download="AK_Digital_Studio_Brochure.pdf" class="btn btn--outline-sky btn--sm" style="display: inline-flex; align-items: center; gap: 6px; font-size: 0.82rem;">
          📄 Download Brochure PDF
        </a>
      </div>

      <!-- Col 2: Explore Links -->
      <div class="footer-col">
        <h3>Explore</h3>
        <ul class="footer-links">
          <li><a href="/">Home</a></li>
          <li><a href="/why-website/">Why a Website</a></li>
          <li><a href="/plans/">Plans &amp; Pricing</a></li>
          <li><a href="/services/">All Services</a></li>
          <li><a href="/portfolio/">Client Portfolio</a></li>
          <li><a href="${site.portfolioUrl}" target="_blank" rel="noopener" style="color: var(--color-bright); font-weight: 600;">Portfolio on Google Drive ↗</a></li>
          <li><a href="/faq/">Frequently Asked Questions</a></li>
          <li><a href="/inquiry/">Request a Quote</a></li>
          <li><a href="/contact/">Contact Us</a></li>
        </ul>
      </div>

      <!-- Col 3: Services -->
      <div class="footer-col">
        <h3>Services</h3>
        <ul class="footer-links">
          <li><a href="/services/web-design/">Web Design &amp; Development</a></li>
          <li><a href="/services/digital-marketing/">Digital Marketing &amp; SEO</a></li>
          <li><a href="/services/graphic-design/">Graphic &amp; Brand Design</a></li>
          <li><a href="/services/video-editing/">Video Editing &amp; Reels</a></li>
          <li><a href="/services/business-solutions/">Business Solutions</a></li>
          <li style="margin-top: 14px; font-weight: 700; color: #fff; font-size: 0.88rem; text-transform: uppercase; letter-spacing: 0.5px;">Surat Delivery</li>
          <li style="color: var(--color-sky); font-size: 0.88rem;">1 Year Support Included</li>
          <li style="color: var(--color-sky); font-size: 0.88rem;">Direct Developer Collaboration</li>
        </ul>
      </div>

      <!-- Col 4: Studio Details (Single Source of Truth) -->
      <div class="footer-col">
        <h3>Surat Studio</h3>
        <ul class="footer-links footer-links--contact">
          <li>
            <span class="contact-label">Lead Developer</span>
            <strong>${escapeHtml(site.leadDeveloper)}</strong>
          </li>
          <li>
            <span class="contact-label">Location</span>
            <span>${escapeHtml(site.address)}</span>
          </li>
          <li>
            <span class="contact-label">Email</span>
            <a href="${site.emailMailto}" style="color: var(--color-bright);">${escapeHtml(site.email)}</a>
          </li>
          <li>
            <span class="contact-label">Phone / WhatsApp</span>
            <a href="${site.phoneTel}" style="color: #fff; font-weight: 600;">${site.phoneDisplay}</a>
          </li>
          <li style="margin-top: 6px;">
            <a href="${site.instagramUrl}" target="_blank" rel="noopener" class="btn btn--white btn--sm" style="display: inline-flex; align-items: center; gap: 8px;">
              <span>Instagram: ${escapeHtml(site.instagram)} ↗</span>
            </a>
          </li>
        </ul>
      </div>
    </div>

    <!-- Bottom Bar -->
    <div class="footer-bottom">
      <div>
        &copy; ${currentYear} ${escapeHtml(site.name)}. All rights reserved. Surat, Gujarat, India.
      </div>
      <div style="display: flex; gap: 20px; flex-wrap: wrap;">
        <a href="/portfolio/" style="color: var(--color-bright); font-weight: 600;">Portfolio</a>
        <a href="/privacy/" style="color: var(--color-slate);">Privacy Policy</a>
        <a href="/terms/" style="color: var(--color-slate);">Terms of Service</a>
        <a href="/admin/" style="color: var(--color-slate);">Staff Portal</a>
      </div>
    </div>
  </div>
</footer>
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
