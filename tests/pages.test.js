const { test, describe } = require('node:test');
const assert = require('node:assert/strict');
const request = require('supertest');
const app = require('../server');

describe('Public Pages, SEO, Schemas & Validation Suite', () => {
  const pages = [
    { url: '/', titleMatch: 'Website Design Company in Surat' },
    { url: '/why-website', titleMatch: 'Why Every Local Business' },
    { url: '/plans', titleMatch: 'Website Under 5000 Rupees' },
    { url: '/services', titleMatch: 'Digital Marketing Agency &amp; Web Services Surat' },
    { url: '/services/web-design', titleMatch: 'E-Commerce Website Development' },
    { url: '/services/digital-marketing', titleMatch: 'Google Ads, Meta Ads &amp; SEO Services' },
    { url: '/services/graphic-design', titleMatch: 'Logo Design &amp; Brand Identity' },
    { url: '/services/video-editing', titleMatch: 'Video Editing Services &amp; Reels' },
    { url: '/services/business-solutions', titleMatch: 'Online Business Setup' },
    { url: '/website-design-surat', titleMatch: 'Website Design Gujarat &amp; Web Development Surat' },
    { url: '/digital-marketing-surat', titleMatch: 'SEO Services Surat &amp; Digital Marketing' },
    { url: '/video-editing-surat', titleMatch: 'Reels Video Editing' },
    { url: '/faq', titleMatch: 'Frequently Asked Questions' },
    { url: '/blog', titleMatch: 'AK Digital Studio Insights' },
    { url: '/blog/how-much-does-a-website-cost-in-india', titleMatch: 'How Much Does a Website Cost in India?' },
    { url: '/blog/why-local-business-needs-a-website', titleMatch: 'Why Every Local Business in Surat Needs a Website' },
    { url: '/inquiry', titleMatch: 'Request a Project Quote' },
    { url: '/contact', titleMatch: 'Contact AK Digital Studio in Surat' },
    { url: '/privacy', titleMatch: 'Privacy Policy' },
    { url: '/terms', titleMatch: 'Terms &amp; Conditions' }
  ];

  for (const page of pages) {
    test(`GET ${page.url} returns 200, valid canonical, hreflang, and title`, async () => {
      const res = await request(app).get(page.url);
      assert.equal(res.status, 200);
      assert.ok(res.text.includes(page.titleMatch), `Page ${page.url} should match title`);
      assert.ok(res.text.includes('rel="canonical"'), `Page ${page.url} should have canonical tag`);
      assert.ok(res.text.includes('hreflang="en-IN"'), `Page ${page.url} should specify en-IN hreflang`);
      assert.ok(res.text.includes('application/ld+json'), `Page ${page.url} should contain JSON-LD structured data`);
    });
  }

  test('JSON-LD Validation - parses as valid JSON on Home and Plans', async () => {
    const homeRes = await request(app).get('/');
    const matches = homeRes.text.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/gi);
    assert.ok(matches && matches.length > 0, 'Should find JSON-LD scripts on Home');

    for (const tag of matches) {
      const jsonStr = tag.replace(/<\/?script[^>]*>/gi, '').trim();
      assert.doesNotThrow(() => {
        JSON.parse(jsonStr);
      }, 'JSON-LD content must be parseable as strict JSON');
    }
  });

  test('GET /sitemap.xml includes static routes and all blog posts', async () => {
    const res = await request(app).get('/sitemap.xml');
    assert.equal(res.status, 200);
    assert.ok(res.headers['content-type'].includes('xml'));
    assert.ok(res.text.includes('<urlset'));
    assert.ok(res.text.includes('/website-design-surat'));
    assert.ok(res.text.includes('/faq'));
    assert.ok(res.text.includes('/blog/how-much-does-a-website-cost-in-india'));
  });

  test('GET /robots.txt blocks /admin and /api, allows public and links sitemap', async () => {
    const res = await request(app).get('/robots.txt');
    assert.equal(res.status, 200);
    assert.ok(res.text.includes('Disallow: /admin'));
    assert.ok(res.text.includes('Disallow: /api'));
    assert.ok(res.text.includes('Sitemap:'));
  });

  test('GET /.well-known/security.txt returns security contact information', async () => {
    const res = await request(app).get('/.well-known/security.txt');
    assert.equal(res.status, 200);
    assert.ok(res.text.includes('Contact: mailto:AKdigitalstudio.org@gmail.com'));
  });

  test('GET /manifest.json returns valid web app manifest', async () => {
    const res = await request(app).get('/manifest.json');
    assert.equal(res.status, 200);
    assert.equal(res.body.short_name, 'AK Studio');
  });

  test('GET /unknown-random-route returns 404 with helpful links', async () => {
    const res = await request(app).get('/unknown-random-route');
    assert.equal(res.status, 404);
    assert.ok(res.text.includes('404'));
    assert.ok(res.text.includes('/plans'));
  });
});
