/**
 * Shared Sticky Glass Header Partial
 */

export function renderHeader(site, currentPath = '/') {
  const navItems = site.nav || [
    { label: 'Home', href: '/' },
    { label: 'Why a website', href: '/why-website/' },
    { label: 'Plans', href: '/plans/' },
    { label: 'Services', href: '/services/' },
    { label: 'Contact', href: '/contact/' }
  ];

  function isActive(itemHref) {
    if (itemHref === '/') return currentPath === '/' || currentPath === '';
    return currentPath.startsWith(itemHref);
  }

  return `
<header class="site-header" role="banner">
  <div class="container header-inner">
    <!-- Brand Logo -->
    <a href="/" class="site-logo" aria-label="${escapeHtml(site.name)} Home">
      <img src="/img/logo.svg" alt="${escapeHtml(site.name)} Logo" width="220" height="52">
    </a>

    <!-- Pill Navigation (Desktop) -->
    <nav class="nav-pill-wrapper" role="navigation" aria-label="Main Navigation">
      ${navItems.map(item => `
        <a 
          href="${item.href}" 
          class="nav-link ${isActive(item.href) ? 'is-active' : ''}" 
          ${isActive(item.href) ? 'aria-current="page"' : ''}
        >
          ${item.label}
        </a>
      `).join('')}
    </nav>

    <!-- Header Actions -->
    <div class="header-actions">
      <a href="/inquiry/" class="btn btn--primary btn--sm">Get a quote</a>
      
      <!-- Mobile Menu Hamburger -->
      <button type="button" class="menu-toggle" id="menu-toggle" aria-label="Toggle navigation menu" aria-expanded="false" aria-controls="mobile-nav">
        <span></span>
        <span></span>
        <span></span>
      </button>
    </div>
  </div>
</header>

<!-- Accessible Mobile Navigation Drawer -->
<nav class="mobile-nav" id="mobile-nav" role="navigation" aria-label="Mobile Navigation">
  ${navItems.map(item => `
    <a 
      href="${item.href}" 
      class="nav-link ${isActive(item.href) ? 'is-active' : ''}"
      ${isActive(item.href) ? 'aria-current="page"' : ''}
    >
      ${item.label}
    </a>
  `).join('')}
  <div style="margin-top: 16px; padding-top: 16px; border-top: 1px solid var(--color-line);">
    <a href="/inquiry/" class="btn btn--primary" style="width: 100%;">Get a quote</a>
    <p style="margin-top: 14px; font-size: 0.88rem; color: var(--color-slate); text-align: center;">
      ${escapeHtml(site.city)} &bull; <a href="${site.phoneTel}">${site.phoneDisplay}</a>
    </p>
  </div>
</nav>
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
