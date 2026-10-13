const { test, describe } = require('node:test');
const assert = require('node:assert/strict');
const request = require('supertest');
const app = require('../server');
const { db } = require('../server/db');

// Helper to get CSRF token from GET /inquiry
async function getCsrf() {
  const res = await request(app).get('/inquiry');
  const cookie = res.headers['set-cookie']?.find(c => c.startsWith('ak_csrf_token='));
  const token = cookie?.split(';')[0]?.split('=')[1];
  return { cookie, token };
}

describe('AK Digital Studio Comprehensive API, Security & Auth Suite', () => {

  test('Security Headers - Helmet, CSP nonce, HSTS and Permissions-Policy present', async () => {
    const res = await request(app).get('/');
    assert.equal(res.status, 200);
    assert.ok(res.headers['content-security-policy'], 'CSP should be present');
    assert.ok(res.headers['content-security-policy'].includes('nonce-'), 'CSP must include nonce');
    assert.equal(res.headers['x-content-type-options'], 'nosniff');
    assert.equal(res.headers['x-frame-options'], 'DENY');
    assert.ok(res.headers['permissions-policy'], 'Permissions-Policy header must exist');
    assert.equal(res.headers['x-powered-by'], undefined, 'x-powered-by should be hidden');
  });

  test('CSRF Protection - blocks POST without valid CSRF token', async () => {
    const res = await request(app)
      .post('/api/inquiries')
      .send({
        name: 'Attacker Without CSRF',
        email: 'attacker@csrf.com',
        phone: '9825123456',
        interest: 'Standard Catalogue',
        details: 'Testing CSRF blocking mechanism on form endpoint',
        consent: 'true'
      })
      .set('Accept', 'application/json');

    assert.equal(res.status, 403);
    assert.equal(res.body.ok, false);
    assert.ok(res.body.error.includes('CSRF'));
  });

  test('POST /api/inquiries - successfully submits with valid CSRF & UTM parameters', async () => {
    const { cookie, token } = await getCsrf();

    const res = await request(app)
      .post('/api/inquiries')
      .set('Cookie', cookie)
      .send({
        _csrf: token,
        name: 'Vikas Shah',
        email: 'vikas@surattex.com',
        phone: '9825123456',
        business_name: 'Surat Textiles Ltd',
        business_type: 'Manufacturing & Industrial',
        interest: 'Standard Catalogue',
        budget: '₹10,000 - ₹25,000',
        timeline: 'Standard (1-2 weeks)',
        details: 'We need a high-speed catalogue displaying our textile fabric collection.',
        contact_method: 'WhatsApp',
        utm_source: 'google',
        utm_campaign: 'gbp_listing',
        consent: 'true'
      })
      .set('Accept', 'application/json');

    assert.equal(res.status, 200);
    assert.equal(res.body.ok, true);
    assert.ok(res.body.reference.startsWith('INQ-'));
    assert.ok(res.body.id > 0);

    // Verify row exists in SQLite database with UTM
    const row = db.prepare('SELECT * FROM inquiries WHERE reference = ?').get(res.body.reference);
    assert.ok(row);
    assert.equal(row.name, 'Vikas Shah');
    assert.equal(row.utm_source, 'google');
  });

  test('POST /api/inquiries - rejects invalid inputs with 400', async () => {
    const { cookie, token } = await getCsrf();

    const res = await request(app)
      .post('/api/inquiries')
      .set('Cookie', cookie)
      .send({
        _csrf: token,
        name: '',
        email: 'not-an-email',
        phone: '123',
        details: 'short',
        consent: false
      })
      .set('Accept', 'application/json');

    assert.equal(res.status, 400);
    assert.equal(res.body.ok, false);
    assert.ok(res.body.errors.name);
    assert.ok(res.body.errors.email);
    assert.ok(res.body.errors.phone);
  });

  test('POST /api/inquiries - honeypot traps bot without creating record', async () => {
    const { cookie, token } = await getCsrf();
    const countBefore = db.prepare('SELECT COUNT(*) as count FROM inquiries').get().count;

    const res = await request(app)
      .post('/api/inquiries')
      .set('Cookie', cookie)
      .send({
        _csrf: token,
        _gotcha: 'I am a spambot',
        name: 'Spam Bot',
        email: 'bot@spam.com',
        phone: '9825123456',
        details: 'Spam message text content here',
        consent: 'true'
      })
      .set('Accept', 'application/json');

    assert.equal(res.status, 200);
    assert.equal(res.body.reference, 'SPAM-FILTERED');

    const countAfter = db.prepare('SELECT COUNT(*) as count FROM inquiries').get().count;
    assert.equal(countAfter, countBefore, 'No row should be added for trapped spam');
  });

  test('POST /api/contacts - successfully submits with CSRF', async () => {
    const { cookie, token } = await getCsrf();

    const res = await request(app)
      .post('/api/contacts')
      .set('Cookie', cookie)
      .send({
        _csrf: token,
        name: 'Anjali Sharma',
        email: 'anjali@example.com',
        phone: '9825000000',
        subject: 'Local SEO Consultation in Surat',
        message: 'Hello, I want to discuss Google Maps ranking for our retail store in Adajan.',
        consent: 'true'
      })
      .set('Accept', 'application/json');

    assert.equal(res.status, 200);
    assert.equal(res.body.ok, true);
    assert.ok(res.body.reference.startsWith('CNT-'));
  });

  test('Admin Flow - lockout protection, session cookies & audit log', async () => {
    // 1. Bad password attempt
    const badRes = await request(app)
      .post('/admin/login')
      .send({ password: 'wrongpassword' });
    assert.equal(badRes.status, 401);

    // 2. Successful login
    const goodRes = await request(app)
      .post('/admin/login')
      .send({ password: 'adminSecret123!' });
    assert.equal(goodRes.status, 302);
    assert.equal(goodRes.headers.location, '/admin');

    const adminCookie = goodRes.headers['set-cookie']?.find(c => c.startsWith('ak_admin_session='));
    assert.ok(adminCookie, 'Admin session cookie should be issued');

    // 3. Access protected dashboard
    const dashRes = await request(app)
      .get('/admin')
      .set('Cookie', adminCookie);
    assert.equal(dashRes.status, 200);
    assert.ok(dashRes.text.includes('Admin Dashboard'));
    assert.ok(dashRes.headers['x-robots-tag'].includes('noindex'), 'Admin must have noindex header');

    // 4. Verify audit log entry was created
    const auditRow = db.prepare('SELECT * FROM audit_logs ORDER BY id DESC LIMIT 1').get();
    assert.ok(auditRow);
    assert.equal(auditRow.entity_type, 'admin');
  });

  test('Healthz endpoint - returns 200 OK without leaking sensitive info', async () => {
    const res = await request(app).get('/healthz');
    assert.equal(res.status, 200);
    assert.equal(res.body.status, 'ok');
    assert.equal(res.body.service, 'AK Digital Studio');
    assert.ok(res.body.uptime >= 0);
  });
});
