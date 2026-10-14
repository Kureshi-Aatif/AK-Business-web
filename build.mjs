/**
 * AK Digital Studio - Static Site Builder (build.mjs)
 * Zero runtime dependencies. Assembles /src with shared partials and site.json into /dist
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { renderHead } from './src/partials/head.mjs';
import { renderHeader } from './src/partials/header.mjs';
import { renderFooter } from './src/partials/footer.mjs';
import { renderFloatingWa } from './src/partials/floating-wa.mjs';

import { renderHomePage } from './src/pages/home.mjs';
import { renderWhyWebsitePage } from './src/pages/why-website.mjs';
import { renderPlansPage } from './src/pages/plans.mjs';
import { renderServicesPage } from './src/pages/services.mjs';
import { renderServiceDetailPage } from './src/pages/service-detail.mjs';
import { renderPortfolioPage } from './src/pages/portfolio.mjs';
import { renderInquiryPage } from './src/pages/inquiry.mjs';
import { renderContactPage } from './src/pages/contact.mjs';
import { renderFaqPage } from './src/pages/faq.mjs';
import { renderPrivacyPage } from './src/pages/privacy.mjs';
import { renderTermsPage } from './src/pages/terms.mjs';
import { render404Page } from './src/pages/404.mjs';
import { renderAdminPage } from './src/pages/admin.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 1. Load Single Source of Truth
const siteJsonPath = path.join(__dirname, 'src', 'site.json');
const site = JSON.parse(fs.readFileSync(siteJsonPath, 'utf8'));

const distDir = path.join(__dirname, 'dist');

console.log('🚀 Building static website for', site.name, 'into', distDir);

// 2. Prepare Dist Directory
if (fs.existsSync(distDir)) {
  fs.rmSync(distDir, { recursive: true, force: true });
}
fs.mkdirSync(distDir, { recursive: true });

// Helper to write an HTML page
function writePage(relPath, fullHtml) {
  const targetFile = path.join(distDir, relPath);
  fs.mkdirSync(path.dirname(targetFile), { recursive: true });
  fs.writeFileSync(targetFile, fullHtml, 'utf8');
  console.log(`  ✓ ${relPath}`);
}

function assemblePage({
  title,
  description,
  canonical,
  bodyClass = 'pg-plain',
  ogImage = '/img/og-default.svg',
  schemas = [],
  content
}) {
  const headHtml = renderHead(site, { title, description, canonical, ogImage, schemas });
  const headerHtml = renderHeader(site, canonical);
  const waHtml = renderFloatingWa(site);
  const footerHtml = renderFooter(site);

  return `${headHtml}
<body class="${bodyClass}">
${headerHtml}
${content}
${waHtml}
${footerHtml}
<script src="/js/main.js"></script>
</body>
</html>`;
}

// Track routes for sitemap
const sitemapRoutes = [];

// 3. Assemble Standard Pages

// 3.1 Home
sitemapRoutes.push({ path: '/', priority: '1.0', changefreq: 'weekly' });
writePage('index.html', assemblePage({
  title: 'Website Design Company in Surat | AK Digital Studio',
  description: 'Premier website design company in Surat, Gujarat. High-speed websites, local SEO, and digital growth starting at ₹4,999 onwards. Work directly with Lead Developer Aatif Kureshi.',
  canonical: '/',
  bodyClass: 'pg-home',
  ogImage: '/img/og-default.svg',
  content: renderHomePage(site)
}));

// 3.2 Why a Website
sitemapRoutes.push({ path: '/why-website/', priority: '0.8', changefreq: 'monthly' });
writePage('why-website/index.html', assemblePage({
  title: 'Why Every Local Business in Surat Needs a Website | AK Digital Studio',
  description: 'Turn local clicks into paying clients. Discover why Surat businesses need a fast, mobile-friendly website to rank on Google Maps and drive 24/7 sales.',
  canonical: '/why-website/',
  bodyClass: 'pg-why',
  ogImage: '/img/og-default.svg',
  content: renderWhyWebsitePage(site)
}));

// 3.3 Plans
sitemapRoutes.push({ path: '/plans/', priority: '0.9', changefreq: 'weekly' });
const offerSchemas = [
  {
    "@context": "https://schema.org",
    "@type": "ItemList",
    "name": "AK Digital Studio Website Packages",
    "itemListElement": site.plans.map((p, idx) => ({
      "@type": "Offer",
      "position": idx + 1,
      "name": p.name,
      "price": p.priceNumeric.toString(),
      "priceCurrency": "INR",
      "description": p.desc,
      "url": `${site.siteUrl}/plans/#${p.id}`,
      "availability": "https://schema.org/InStock",
      "seller": {
        "@type": "LocalBusiness",
        "name": site.name
      }
    }))
  }
];
writePage('plans/index.html', assemblePage({
  title: 'Website Design Under 5000 Rupees & Transparent Plans Surat | AK Digital',
  description: 'Affordable, transparent website design packages in Surat starting at ₹4,999. Fast delivery within 3 days, WhatsApp lead capture, and 1 year of setup support.',
  canonical: '/plans/',
  bodyClass: 'pg-plans',
  ogImage: '/img/og-plans.svg',
  schemas: offerSchemas,
  content: renderPlansPage(site)
}));

// 3.4 Services Index
sitemapRoutes.push({ path: '/services/', priority: '0.9', changefreq: 'weekly' });
writePage('services/index.html', assemblePage({
  title: 'Digital Marketing Agency & Web Development Services Surat | AK Digital',
  description: 'Full-service digital agency in Surat, Gujarat: Web design, performance SEO, brand identity, Reels video editing, and custom business solutions.',
  canonical: '/services/',
  bodyClass: 'pg-services',
  ogImage: '/img/og-default.svg',
  content: renderServicesPage(site)
}));

// 3.5 Individual Service Detail Pages
for (const srv of site.services) {
  const servicePath = `/services/${srv.slug}/`;
  sitemapRoutes.push({ path: servicePath, priority: '0.8', changefreq: 'monthly' });

  const serviceSchema = [
    {
      "@context": "https://schema.org",
      "@type": "Service",
      "name": srv.title,
      "serviceType": srv.title,
      "description": srv.heroSubtitle,
      "provider": {
        "@type": "LocalBusiness",
        "name": site.name,
        "url": site.siteUrl,
        "telephone": `+91${site.phoneRaw}`,
        "address": {
          "@type": "PostalAddress",
          "addressLocality": "Surat",
          "addressRegion": "Gujarat",
          "addressCountry": "IN"
        }
      },
      "areaServed": [
        { "@type": "City", "name": "Surat" },
        { "@type": "AdministrativeArea", "name": "Gujarat" }
      ],
      "url": `${site.siteUrl}${servicePath}`
    }
  ];

  writePage(`services/${srv.slug}/index.html`, assemblePage({
    title: `${srv.metaTitle}`,
    description: srv.metaDesc,
    canonical: servicePath,
    bodyClass: 'pg-services',
    ogImage: '/img/og-default.svg',
    schemas: serviceSchema,
    content: renderServiceDetailPage(site, srv)
  }));
}

// 3.6 Portfolio (Google Drive Embed)
sitemapRoutes.push({ path: '/portfolio/', priority: '0.8', changefreq: 'weekly' });
writePage('portfolio/index.html', assemblePage({
  title: 'Our Portfolio | Client Work & Design Gallery | AK Digital Studio',
  description: 'Explore live project screenshots, brand designs, and digital platforms crafted by AK Digital Studio in Surat, Gujarat. Direct Google Drive gallery.',
  canonical: '/portfolio/',
  bodyClass: 'pg-portfolio',
  ogImage: '/img/og-default.svg',
  content: renderPortfolioPage(site)
}));

// 3.7 Inquiry
sitemapRoutes.push({ path: '/inquiry/', priority: '0.9', changefreq: 'monthly' });
writePage('inquiry/index.html', assemblePage({
  title: 'Request a Project Quote & Consultation | AK Digital Studio',
  description: 'Get an accurate, transparent proposal for your website, branding, or marketing project from Lead Developer Aatif Kureshi in Surat within 24 hours.',
  canonical: '/inquiry/',
  bodyClass: 'pg-plain',
  ogImage: '/img/og-default.svg',
  content: renderInquiryPage(site)
}));

// 3.8 Contact
sitemapRoutes.push({ path: '/contact/', priority: '0.8', changefreq: 'monthly' });
writePage('contact/index.html', assemblePage({
  title: 'Contact AK Digital Studio in Surat, Gujarat | WhatsApp & Phone',
  description: 'Reach AK Digital Studio directly via WhatsApp (+91 76984 50003) or email. Based in Surat, Gujarat. Consult directly with Lead Developer Aatif Kureshi.',
  canonical: '/contact/',
  bodyClass: 'pg-contact',
  ogImage: '/img/og-default.svg',
  content: renderContactPage(site)
}));

// 3.9 FAQ
sitemapRoutes.push({ path: '/faq/', priority: '0.7', changefreq: 'monthly' });
const faqSchema = [
  {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": site.faqs.map(f => ({
      "@type": "Question",
      "name": f.q,
      "acceptedAnswer": {
        "@type": "Answer",
        "text": f.a
      }
    }))
  }
];
writePage('faq/index.html', assemblePage({
  title: 'Frequently Asked Questions | Website Costs & Timelines Surat | AK Digital',
  description: 'Answers to top questions regarding website development pricing, timelines, domain hosting ownership, Google Maps ranking, and support in Surat.',
  canonical: '/faq/',
  bodyClass: 'pg-plain',
  ogImage: '/img/og-default.svg',
  schemas: faqSchema,
  content: renderFaqPage(site)
}));

// 3.10 Privacy Policy
sitemapRoutes.push({ path: '/privacy/', priority: '0.3', changefreq: 'yearly' });
writePage('privacy/index.html', assemblePage({
  title: 'Privacy Policy & DPDP Governance | AK Digital Studio',
  description: 'Our privacy commitment under India DPDP Act. Transparent data minimization, salted hash security telemetry, and no third-party data selling.',
  canonical: '/privacy/',
  bodyClass: 'pg-plain',
  content: renderPrivacyPage(site)
}));

// 3.11 Terms & Conditions
sitemapRoutes.push({ path: '/terms/', priority: '0.3', changefreq: 'yearly' });
writePage('terms/index.html', assemblePage({
  title: 'Terms of Service & Project Deliverables | AK Digital Studio',
  description: 'Standard terms of service, milestone agreements, client asset responsibilities, and 1-year setup maintenance policy for AK Digital Studio.',
  canonical: '/terms/',
  bodyClass: 'pg-plain',
  content: renderTermsPage(site)
}));

// 3.12 404 Page
writePage('404.html', assemblePage({
  title: '404 - Page Not Found | AK Digital Studio',
  description: 'The requested page could not be found. Return to AK Digital Studio homepage or browse website design plans.',
  canonical: '/404.html',
  bodyClass: 'pg-plain',
  content: render404Page(site)
}));

// 3.13 Admin Portal
writePage('admin/index.html', renderAdminPage(site));

// 4. Generate sitemap.xml
const today = new Date().toISOString().slice(0, 10);
const sitemapXml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${sitemapRoutes.map(r => `  <url>
    <loc>${site.siteUrl}${r.path}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>${r.changefreq}</changefreq>
    <priority>${r.priority}</priority>
  </url>`).join('\n')}
</urlset>`;
fs.writeFileSync(path.join(distDir, 'sitemap.xml'), sitemapXml, 'utf8');
console.log('  ✓ sitemap.xml');

// 5. Generate robots.txt
const robotsTxt = `User-agent: *
Disallow: /admin/
Disallow: /api/
Allow: /

Sitemap: ${site.siteUrl}/sitemap.xml
`;
fs.writeFileSync(path.join(distDir, 'robots.txt'), robotsTxt, 'utf8');
console.log('  ✓ robots.txt');

// 6. Generate manifest.json
const manifestJson = {
  "name": site.name,
  "short_name": "AK Studio",
  "description": site.heroHeadline,
  "start_url": "/",
  "display": "standalone",
  "background_color": "#071A57",
  "theme_color": "#0B3FD8",
  "icons": [
    {
      "src": "/img/favicon.svg",
      "sizes": "any",
      "type": "image/svg+xml",
      "purpose": "any maskable"
    }
  ]
};
fs.writeFileSync(path.join(distDir, 'manifest.json'), JSON.stringify(manifestJson, null, 2), 'utf8');
console.log('  ✓ manifest.json');

// 7. Copy Static Assets
function copyDirSync(src, dest) {
  if (!fs.existsSync(src)) return;
  fs.mkdirSync(dest, { recursive: true });
  const entries = fs.readdirSync(src, { withFileTypes: true });
  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);
    if (entry.isDirectory()) {
      copyDirSync(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

console.log('📦 Copying assets into /dist...');
copyDirSync(path.join(__dirname, 'assets', 'css'), path.join(distDir, 'css'));
copyDirSync(path.join(__dirname, 'assets', 'js'), path.join(distDir, 'js'));
copyDirSync(path.join(__dirname, 'assets', 'img'), path.join(distDir, 'img'));
copyDirSync(path.join(__dirname, 'assets', 'fonts'), path.join(distDir, 'fonts'));

// Copy brochure
if (fs.existsSync(path.join(__dirname, 'downloads'))) {
  copyDirSync(path.join(__dirname, 'downloads'), path.join(distDir, 'downloads'));
}

// Copy Cloudflare Pages configuration files
if (fs.existsSync(path.join(__dirname, 'src', '_headers'))) {
  fs.copyFileSync(path.join(__dirname, 'src', '_headers'), path.join(distDir, '_headers'));
  console.log('  ✓ _headers');
}
if (fs.existsSync(path.join(__dirname, 'src', '_redirects'))) {
  fs.copyFileSync(path.join(__dirname, 'src', '_redirects'), path.join(distDir, '_redirects'));
  console.log('  ✓ _redirects');
}

console.log('🎉 Static build complete in dist/!');
