/**
 * Comprehensive Acceptance Test Suite for AK Digital Studio Static Site & Serverless APIs
 */

import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const distDir = path.resolve(__dirname, '..', 'dist');

const site = JSON.parse(fs.readFileSync(path.resolve(__dirname, '../src/site.json'), 'utf8'));

console.log('🧪 Starting Acceptance Test Suite...');

// 1. Verify Pages Exist & Body Classes
const expectedPages = [
  { file: 'index.html', bodyClass: 'pg-home', titleMatch: 'Website Design Company in Surat' },
  { file: 'why-website/index.html', bodyClass: 'pg-why', titleMatch: 'Why Every Local Business' },
  { file: 'plans/index.html', bodyClass: 'pg-plans', titleMatch: 'Website Design Under 5000' },
  { file: 'services/index.html', bodyClass: 'pg-services', titleMatch: 'Digital Marketing Agency &amp; Web Development' },
  { file: 'services/web-design/index.html', bodyClass: 'pg-services', titleMatch: 'Website Design' },
  { file: 'services/digital-marketing/index.html', bodyClass: 'pg-services', titleMatch: 'Digital Marketing' },
  { file: 'services/graphic-design/index.html', bodyClass: 'pg-services', titleMatch: 'Logo Design' },
  { file: 'services/video-editing/index.html', bodyClass: 'pg-services', titleMatch: 'Video Editing' },
  { file: 'services/business-solutions/index.html', bodyClass: 'pg-services', titleMatch: 'Online Business Setup' },
  { file: 'portfolio/index.html', bodyClass: 'pg-portfolio', titleMatch: 'Our Portfolio' },
  { file: 'inquiry/index.html', bodyClass: 'pg-plain', titleMatch: 'Request a Project Quote' },
  { file: 'contact/index.html', bodyClass: 'pg-contact', titleMatch: 'Contact AK Digital Studio' },
  { file: 'faq/index.html', bodyClass: 'pg-plain', titleMatch: 'Frequently Asked Questions' },
  { file: 'privacy/index.html', bodyClass: 'pg-plain', titleMatch: 'Privacy Policy' },
  { file: 'terms/index.html', bodyClass: 'pg-plain', titleMatch: 'Terms of Service' },
  { file: '404.html', bodyClass: 'pg-plain', titleMatch: '404 - Page Not Found' },
  { file: 'admin/index.html', bodyClass: 'admin-body', titleMatch: 'Staff Portal' }
];

for (const p of expectedPages) {
  const filePath = path.join(distDir, p.file);
  assert.ok(fs.existsSync(filePath), `File ${p.file} must exist in dist`);

  const html = fs.readFileSync(filePath, 'utf8');
  assert.ok(html.includes(`class="${p.bodyClass}"`), `${p.file} must have body class "${p.bodyClass}"`);
  assert.ok(html.includes(p.titleMatch), `${p.file} title must match "${p.titleMatch}"`);

  // Verify Single Source of Truth Official Details (except 404/admin which are minimal)
  if (p.file !== 'admin/index.html' && p.file !== '404.html') {
    assert.ok(html.includes(site.phoneDisplay), `${p.file} must display official phone ${site.phoneDisplay}`);
    assert.ok(html.includes(site.phoneTel), `${p.file} must contain tel link ${site.phoneTel}`);
    assert.ok(html.includes(site.email), `${p.file} must display official email ${site.email}`);
    assert.ok(html.includes(site.emailMailto), `${p.file} must contain mailto link ${site.emailMailto}`);
    assert.ok(html.includes(site.whatsappLink), `${p.file} must link to official WhatsApp URL`);
    assert.ok(html.includes('hreflang="en-IN"'), `${p.file} must contain en-IN hreflang`);
    assert.ok(html.includes('rel="canonical"'), `${p.file} must contain canonical tag`);
  }

  // Verify JSON-LD parseability
  const jsonLdMatches = html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/gi);
  for (const match of jsonLdMatches) {
    const rawJson = match[1].trim();
    assert.doesNotThrow(() => JSON.parse(rawJson), `JSON-LD in ${p.file} must be valid strict JSON`);
  }
}
console.log('✅ All 17 pages verified for structure, body classes, and official NAP details.');

// 2. Verify Portfolio page specific elements
const portfolioHtml = fs.readFileSync(path.join(distDir, 'portfolio/index.html'), 'utf8');
assert.ok(portfolioHtml.includes('Open portfolio on Google Drive'), 'Portfolio must have primary Drive button');
assert.ok(portfolioHtml.includes(site.portfolioUrl), 'Portfolio button must link to Drive folder');
assert.ok(portfolioHtml.includes('https://drive.google.com/embeddedfolderview?id=1rVIyFGmlAZ6Q309xKHGT4LxL0HUl6ej4#grid'), 'Portfolio must embed Drive folder');
assert.ok(portfolioHtml.includes('If the gallery does not load, open it with the button above.'), 'Must include fallback note');
assert.ok(portfolioHtml.includes('<noscript>'), 'Portfolio must have noscript fallback');
console.log('✅ Portfolio page Google Drive embed and fallbacks verified.');

// 3. Verify Contact page Instagram QR code
const contactHtml = fs.readFileSync(path.join(distDir, 'contact/index.html'), 'utf8');
assert.ok(contactHtml.includes('/img/qr-instagram.svg'), 'Contact page must display Instagram QR code');
assert.ok(contactHtml.includes(site.instagramUrl), 'QR code must link to Instagram URL');
console.log('✅ Contact page Instagram QR code and links verified.');

// 3.1 Verify Plans Page Structure & 4 Plans Tiers
const plansHtml = fs.readFileSync(path.join(distDir, 'plans/index.html'), 'utf8');
assert.ok(plansHtml.includes('id="starter-website"'), 'Plans must include Starter Website card');
assert.ok(plansHtml.includes('id="standard-catalogue"'), 'Plans must include Standard Catalogue card');
assert.ok(plansHtml.includes('id="premium-website"'), 'Plans must include Premium Website card');
assert.ok(plansHtml.includes('id="ecommerce-solution"'), 'Plans must include E-commerce Solution card');

// Verify Starter Website updates
assert.ok(plansHtml.includes('Delivery: Within 3 days'), 'Starter plan must have Delivery: Within 3 days');
assert.ok(plansHtml.includes('Static website'), 'Starter plan must include Static website');
assert.ok(plansHtml.includes('Responsive design'), 'Starter plan must include Responsive design');

// Verify Standard Catalogue updates
assert.ok(plansHtml.includes('Delivery: 3 to 5 days'), 'Standard plan must have Delivery: 3 to 5 days');
assert.ok(!plansHtml.includes('Premium custom layout with bespoke visual hierarchy'), 'Standard plan must NOT include Premium custom layout');

// Verify Premium Website updates
assert.ok(plansHtml.includes('₹14,999'), 'Premium plan must display ₹14,999');
assert.ok(plansHtml.includes('Delivery: 5 to 7 days'), 'Premium plan must have Delivery: 5 to 7 days');
assert.ok(plansHtml.includes('Up to 15 pages'), 'Premium plan must include Up to 15 pages');
assert.ok(plansHtml.includes('Up to 50 products'), 'Premium plan must include Up to 50 products');
assert.ok(plansHtml.includes('Shopping cart &amp; secure checkout') || plansHtml.includes('Shopping cart & secure checkout'), 'Premium plan must include Shopping cart & secure checkout');
assert.ok(plansHtml.includes('Advance on-page SEO setup'), 'Premium plan must include Advance on-page SEO setup');
assert.ok(plansHtml.includes('Basic security handling'), 'Premium plan must include Basic security handling');
assert.ok(plansHtml.includes('Lead capture system'), 'Premium plan must include Lead capture system');

// Verify E-commerce Solution updates
assert.ok(plansHtml.includes('₹24,999'), 'E-commerce plan must display ₹24,999');
assert.ok(plansHtml.includes('Delivery: 7 to 14 days'), 'E-commerce plan must have Delivery: 7 to 14 days');
assert.ok(plansHtml.includes('1 year client support'), 'E-commerce plan must include 1 year client support');
assert.ok(plansHtml.includes('Advance SEO'), 'E-commerce plan must include Advance SEO');
assert.ok(plansHtml.includes('Security support'), 'E-commerce plan must include Security support');

// Verify Inquiry Form Dropdown Options
const inqPageHtml = fs.readFileSync(path.join(distDir, 'inquiry/index.html'), 'utf8');
assert.ok(inqPageHtml.includes('value="Premium Website"'), 'Inquiry dropdown must include Premium Website option');
assert.ok(inqPageHtml.includes('E-commerce Solution (₹24,999 onwards)'), 'Inquiry dropdown must show ₹24,999 onwards for E-commerce');
console.log('✅ All 4 website plans, pricing, timelines, features, and inquiry options verified.');

// 4. Verify _headers and CSP
const headersContent = fs.readFileSync(path.join(distDir, '_headers'), 'utf8');
assert.ok(headersContent.includes('frame-src https://challenges.cloudflare.com https://drive.google.com'), 'CSP must allow drive.google.com');
assert.ok(headersContent.includes('X-Content-Type-Options: nosniff'), 'Headers must include nosniff');
assert.ok(headersContent.includes('Strict-Transport-Security: max-age=31536000'), 'Headers must include HSTS');
assert.ok(headersContent.includes('Permissions-Policy: camera=(), microphone=(), geolocation=()'), 'Headers must disable camera/mic/geo');
console.log('✅ Cloudflare Pages _headers and CSP policies verified.');

// 5. Verify sitemap.xml & robots.txt
const sitemapContent = fs.readFileSync(path.join(distDir, 'sitemap.xml'), 'utf8');
assert.ok(sitemapContent.includes('/portfolio/'), 'Sitemap must include /portfolio/');
assert.ok(sitemapContent.includes('/plans/'), 'Sitemap must include /plans/');
assert.ok(sitemapContent.includes('/services/web-design/'), 'Sitemap must include services');

const robotsContent = fs.readFileSync(path.join(distDir, 'robots.txt'), 'utf8');
assert.ok(robotsContent.includes('Disallow: /admin/'), 'Robots must disallow /admin/');
assert.ok(robotsContent.includes('Disallow: /api/'), 'Robots must disallow /api/');
console.log('✅ sitemap.xml and robots.txt verified.');

// 6. Test Cloudflare Serverless Function Logic (Mock Simulation)
import { onRequestPost as inquiryPost } from '../functions/api/inquiry.js';
import { onRequestPost as contactPost } from '../functions/api/contact.js';

// Mock D1 database
class MockD1 {
  constructor() {
    this.inquiries = [];
    this.contacts = [];
    this.rateLimits = new Map();
  }

  prepare(sql) {
    const db = this;
    const stmt = {
      bind(...params) {
        return {
          async run() {
            if (sql.includes('INSERT INTO inquiries')) {
              db.inquiries.push({ reference: params[0], name: params[1], email: params[2], phone: params[3], interest: params[6], details: params[9] });
              return { success: true };
            }
            if (sql.includes('INSERT INTO contacts')) {
              db.contacts.push({ reference: params[0], name: params[1], email: params[2], subject: params[4], message: params[5] });
              return { success: true };
            }
            if (sql.includes('rate_limits')) {
              return { success: true };
            }
            return { success: true };
          },
          async first() {
            return null;
          },
          async all() {
            if (sql.includes('FROM inquiries')) return { results: db.inquiries };
            if (sql.includes('FROM contacts')) return { results: db.contacts };
            return { results: [] };
          }
        };
      },
      async all() {
        if (sql.includes('FROM inquiries')) return { results: db.inquiries };
        if (sql.includes('FROM contacts')) return { results: db.contacts };
        return { results: [] };
      },
      async first() {
        return null;
      },
      async run() {
        return { success: true };
      }
    };
    return stmt;
  }
}

const mockDb = new MockD1();
const mockEnv = {
  DB: mockDb,
  SITE_URL: 'http://localhost:8788',
  ADMIN_TOKEN: 'superSecret2026',
  NOTIFY_TO: 'AKdigitalstudio.org@gmail.com',
  IP_SALT: 'test-salt'
};

// 6.1 Test Inquiry Submission (Valid)
const validInqReq = new Request('http://localhost:8788/api/inquiry', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json', 'CF-Connecting-IP': '127.0.0.1' },
  body: JSON.stringify({
    name: 'Sameer Kureshi',
    email: 'sameer@example.com',
    phone: '9825123456',
    business_name: 'Kureshi Textiles',
    interest: 'Standard Catalogue',
    details: 'Looking for a 10-page catalogue with WhatsApp inquiry integration.',
    consent: true
  })
});

const inqRes = await inquiryPost({ request: validInqReq, env: mockEnv });
const inqData = await inqRes.json();
assert.equal(inqRes.status, 200);
assert.equal(inqData.ok, true);
assert.ok(inqData.reference.startsWith('INQ-'));
assert.equal(mockDb.inquiries.length, 1);
assert.equal(mockDb.inquiries[0].reference, inqData.reference);
console.log('✅ Functions API: Valid inquiry POST stored in D1 database with reference:', inqData.reference);

// 6.2 Test Inquiry Submission (Invalid - Validation error handling)
const invalidInqReq = new Request('http://localhost:8788/api/inquiry', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    name: 'S',
    email: 'invalid-email',
    phone: '123',
    interest: '',
    details: 'short',
    consent: false
  })
});

const invalidInqRes = await inquiryPost({ request: invalidInqReq, env: mockEnv });
const invalidInqData = await invalidInqRes.json();
assert.equal(invalidInqRes.status, 400);
assert.equal(invalidInqData.ok, false);
assert.ok(invalidInqData.errors.name);
assert.ok(invalidInqData.errors.email);
assert.ok(invalidInqData.errors.phone);
assert.ok(invalidInqData.errors.details);
assert.ok(invalidInqData.errors.consent);
console.log('✅ Functions API: Invalid inquiry rejected with field-level 400 errors.');

// 6.3 Test Contact Submission (Valid)
const validCntReq = new Request('http://localhost:8788/api/contact', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json', 'CF-Connecting-IP': '127.0.0.1' },
  body: JSON.stringify({
    name: 'Pooja Verma',
    email: 'pooja@verma.com',
    phone: '9876543210',
    subject: 'Consultation Request for E-commerce',
    message: 'We want to schedule a 1-on-1 consultation session with Aatif Kureshi.',
    consent: true
  })
});

const cntRes = await contactPost({ request: validCntReq, env: mockEnv });
const cntData = await cntRes.json();
assert.equal(cntRes.status, 200);
assert.equal(cntData.ok, true);
assert.ok(cntData.reference.startsWith('CNT-'));
assert.equal(mockDb.contacts.length, 1);
console.log('✅ Functions API: Valid contact POST stored in D1 database with reference:', cntData.reference);

// 6.4 Test Admin Authentication & Access
import { onRequestGet as adminInquiriesGet } from '../functions/api/admin/inquiries.js';

// Wrong token
const unauthReq = new Request('http://localhost:8788/api/admin/inquiries', {
  headers: { 'Authorization': 'Bearer wrong-token' }
});
const unauthRes = await adminInquiriesGet({ request: unauthReq, env: mockEnv });
assert.equal(unauthRes.status, 401);
console.log('✅ Admin API: Unauthorized request correctly rejected with 401.');

// Valid token
const authReq = new Request('http://localhost:8788/api/admin/inquiries', {
  headers: { 'Authorization': 'Bearer superSecret2026' }
});
const authRes = await adminInquiriesGet({ request: authReq, env: mockEnv });
const authData = await authRes.json();
assert.equal(authRes.status, 200);
assert.equal(authData.ok, true);
assert.equal(authData.items.length, 1);
assert.equal(authData.items[0].name, 'Sameer Kureshi');
console.log('✅ Admin API: Authenticated request returns D1 records.');

console.log('\n🎉 ALL ACCEPTANCE TESTS PASSED WITH 100% SUCCESS!');
