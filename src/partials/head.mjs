/**
 * Shared Head Partial
 * Generates SEO meta tags, Open Graph, Twitter cards, hreflang, preloads, stylesheets, and structured JSON-LD
 */

export function renderHead(site, {
  title,
  description,
  canonical,
  ogImage = '/img/og-default.svg',
  schemas = []
}) {
  const siteUrl = site.siteUrl.replace(/\/+$/, '');
  const canonicalUrl = canonical.startsWith('http') ? canonical : `${siteUrl}${canonical}`;
  const absoluteOgImage = ogImage.startsWith('http') ? ogImage : `${siteUrl}${ogImage}`;

  const defaultSchemas = [
    {
      "@context": "https://schema.org",
      "@type": "LocalBusiness",
      "@id": `${siteUrl}/#localbusiness`,
      "name": site.name,
      "url": siteUrl,
      "logo": `${siteUrl}/img/logo.svg`,
      "image": `${siteUrl}/img/logo.svg`,
      "telephone": `+91${site.phoneRaw}`,
      "email": site.email,
      "priceRange": "₹4,999 - ₹49,999",
      "currenciesAccepted": "INR",
      "paymentAccepted": "Cash, Credit Card, Debit Card, UPI, Net Banking",
      "address": {
        "@type": "PostalAddress",
        "streetAddress": "Surat",
        "addressLocality": "Surat",
        "addressRegion": "Gujarat",
        "postalCode": "395003",
        "addressCountry": "IN"
      },
      "geo": {
        "@type": "GeoCoordinates",
        "latitude": "21.1702",
        "longitude": "72.8311"
      },
      "openingHoursSpecification": {
        "@type": "OpeningHoursSpecification",
        "dayOfWeek": ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
        "opens": "09:30",
        "closes": "19:30"
      },
      "sameAs": [
        site.instagramUrl
      ]
    }
  ];

  const allSchemas = [...defaultSchemas, ...schemas];

  return `<!DOCTYPE html>
<html lang="en-IN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${escapeHtml(title)}</title>
  <meta name="description" content="${escapeHtml(description)}">
  <link rel="canonical" href="${canonicalUrl}">

  <!-- Regional hreflang tags -->
  <link rel="alternate" hreflang="en-IN" href="${canonicalUrl}">
  <link rel="alternate" hreflang="x-default" href="${canonicalUrl}">

  <!-- Manifest & Favicons -->
  <link rel="manifest" href="/manifest.json">
  <meta name="theme-color" content="#0B3FD8">
  <meta name="color-scheme" content="light">
  <link rel="icon" type="image/svg+xml" href="/img/favicon.svg">
  <link rel="apple-touch-icon" href="/img/favicon.svg">

  <!-- Open Graph / Social Sharing -->
  <meta property="og:type" content="website">
  <meta property="og:url" content="${canonicalUrl}">
  <meta property="og:title" content="${escapeHtml(title)}">
  <meta property="og:description" content="${escapeHtml(description)}">
  <meta property="og:image" content="${absoluteOgImage}">
  <meta property="og:image:width" content="1200">
  <meta property="og:image:height" content="630">
  <meta property="og:site_name" content="${escapeHtml(site.name)}">
  <meta property="og:locale" content="en_IN">

  <!-- Twitter Cards -->
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="${escapeHtml(title)}">
  <meta name="twitter:description" content="${escapeHtml(description)}">
  <meta name="twitter:image" content="${absoluteOgImage}">

  <!-- Self-Hosted WOFF2 Fonts Preload -->
  <link rel="preload" href="/fonts/dm-sans-400-2.woff2" as="font" type="font/woff2" crossorigin>
  <link rel="preload" href="/fonts/sora-800-10.woff2" as="font" type="font/woff2" crossorigin>

  <!-- Stylesheets -->
  <link rel="stylesheet" href="/css/fonts.css">
  <link rel="stylesheet" href="/css/style.css">

  <!-- JSON-LD Structured Data -->
  ${allSchemas.map(s => `<script type="application/ld+json">\n${JSON.stringify(s, null, 2)}\n</script>`).join('\n  ')}
</head>`;
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
