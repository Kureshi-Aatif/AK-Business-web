/**
 * 404 Page Template
 */

export function render404Page(site) {
  return `
<main class="section">
  <div class="container text-center" style="max-width: 600px; padding: 60px 20px;">
    <div class="card reveal" style="padding: 48px 30px; text-align: center;">
      <div style="font-family: var(--font-heading); font-size: 5rem; font-weight: 800; color: var(--color-royal); line-height: 1; margin-bottom: 12px;">404</div>
      <h1 style="font-size: 1.8rem; margin-bottom: 14px;">Page Not Found</h1>
      <p style="color: var(--color-slate); margin-bottom: 28px;">
        The page you are looking for may have been moved, renamed, or does not exist. Explore our core services or get in touch with our team:
      </p>
      <div style="display: flex; justify-content: center; gap: 14px; flex-wrap: wrap; margin-bottom: 24px;">
        <a href="/" class="btn btn--primary">Return Home</a>
        <a href="/plans/" class="btn btn--outline">Website Plans</a>
        <a href="/faq/" class="btn btn--outline">Read FAQs</a>
        <a href="/contact/" class="btn btn--white">Contact Us</a>
      </div>
    </div>
  </div>
</main>
`;
}
