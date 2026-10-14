/**
 * Standalone Cloudflare Worker for AK Digital Studio
 * Used when hosting the static frontend on GitHub Pages
 */

import {
  getCorsHeaders,
  handleOptions,
  hashIp,
  generateReference,
  sanitize,
  verifyTurnstile,
  checkRateLimit,
  sendEmail,
  jsonResponse,
  constantTimeCompare
} from '../functions/utils.js';
import {
  buildInquiryNotification,
  buildInquiryAutoReply,
  buildContactNotification,
  buildContactAutoReply
} from '../functions/email-templates.js';

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const path = url.pathname;
    const method = request.method;
    const cors = getCorsHeaders(request, env);

    if (method === 'OPTIONS') {
      return handleOptions(request, env);
    }

    // Health check
    if (path === '/' || path === '/health') {
      return jsonResponse({ ok: true, service: 'AK Digital Studio Serverless API', timestamp: new Date().toISOString() }, 200, cors);
    }

    // 1. POST /api/inquiry
    if (path === '/api/inquiry' && method === 'POST') {
      const clientIp = request.headers.get('CF-Connecting-IP') || request.headers.get('x-forwarded-for') || '';
      const userAgent = request.headers.get('user-agent') || '';
      const ipHash = await hashIp(clientIp, env.IP_SALT || 'ak-default-salt');

      const allowed = await checkRateLimit(env.DB, ipHash, 10, 3600);
      if (!allowed) {
        return jsonResponse({ ok: false, error: 'Too many submissions. Please try again later.' }, 429, cors);
      }

      let body;
      try {
        body = await request.json();
      } catch (e) {
        return jsonResponse({ ok: false, error: 'Invalid JSON body.' }, 400, cors);
      }

      const isHuman = await verifyTurnstile(body.turnstile_token, env.TURNSTILE_SECRET, clientIp);
      if (!isHuman) {
        return jsonResponse({ ok: false, error: 'CAPTCHA security verification failed.' }, 400, cors);
      }

      const name = sanitize(body.name, 100);
      const email = sanitize(body.email, 120);
      const phoneRaw = sanitize(body.phone, 30);
      const phone = phoneRaw.replace(/[\s\-\(\)]/g, '');
      const businessName = sanitize(body.business_name, 150);
      const businessType = sanitize(body.business_type, 100);
      const interest = sanitize(body.interest, 100);
      const budget = sanitize(body.budget, 80);
      const timeline = sanitize(body.timeline, 80);
      const details = sanitize(body.details, 2000);
      const contactMethod = sanitize(body.contact_method, 50) || 'WhatsApp';
      const consent = !!body.consent;
      const utmSource = sanitize(body.utm_source, 100);

      const errors = {};
      if (!name || name.length < 2) errors.name = 'Please provide your full name (minimum 2 characters).';
      const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!email || !emailPattern.test(email)) errors.email = 'Please provide a valid email address.';
      const phonePattern = /^(\+91)?[6-9]\d{9}$/;
      if (!phone || !phonePattern.test(phone)) errors.phone = 'Please provide a valid 10-digit Indian phone number.';
      if (!interest) errors.interest = 'Please select a plan or service of interest.';
      if (!details || details.length < 10) errors.details = 'Please describe your project (minimum 10 characters).';
      if (!consent) errors.consent = 'Consent is required to contact you regarding your inquiry.';

      if (Object.keys(errors).length > 0) {
        return jsonResponse({ ok: false, errors }, 400, cors);
      }

      const reference = generateReference('INQ');

      if (env.DB) {
        try {
          await env.DB.prepare(`
            INSERT INTO inquiries (
              reference, name, email, phone, business_name, business_type,
              interest, budget, timeline, details, contact_method, consent,
              status, notes, ip_hash, user_agent, utm_source
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'new', '', ?, ?, ?)
          `).bind(
            reference, name, email, phone, businessName, businessType,
            interest, budget, timeline, details, contactMethod, consent ? 1 : 0,
            ipHash, userAgent, utmSource
          ).run();
        } catch (dbErr) {
          console.error('D1 Error:', dbErr);
          return jsonResponse({ ok: false, error: 'Database storage error.' }, 500, cors);
        }
      }

      const notifyTo = env.NOTIFY_TO || 'AKdigitalstudio.org@gmail.com';
      const record = { reference, name, email, phone, business_name: businessName, business_type: businessType, interest, budget, timeline, details, contact_method: contactMethod };
      if (env.RESEND_API_KEY) {
        const adminMail = buildInquiryNotification(record);
        sendEmail({ apiKey: env.RESEND_API_KEY, to: notifyTo, subject: adminMail.subject, html: adminMail.html }).catch(() => {});
        const clientMail = buildInquiryAutoReply(record);
        sendEmail({ apiKey: env.RESEND_API_KEY, to: email, subject: clientMail.subject, html: clientMail.html }).catch(() => {});
      }

      return jsonResponse({ ok: true, reference }, 200, cors);
    }

    // 2. POST /api/contact
    if (path === '/api/contact' && method === 'POST') {
      const clientIp = request.headers.get('CF-Connecting-IP') || request.headers.get('x-forwarded-for') || '';
      const userAgent = request.headers.get('user-agent') || '';
      const ipHash = await hashIp(clientIp, env.IP_SALT || 'ak-default-salt');

      const allowed = await checkRateLimit(env.DB, ipHash, 10, 3600);
      if (!allowed) {
        return jsonResponse({ ok: false, error: 'Too many requests. Please try again later.' }, 429, cors);
      }

      let body;
      try {
        body = await request.json();
      } catch (e) {
        return jsonResponse({ ok: false, error: 'Invalid JSON payload.' }, 400, cors);
      }

      const isHuman = await verifyTurnstile(body.turnstile_token, env.TURNSTILE_SECRET, clientIp);
      if (!isHuman) {
        return jsonResponse({ ok: false, error: 'CAPTCHA security verification failed.' }, 400, cors);
      }

      const name = sanitize(body.name, 100);
      const email = sanitize(body.email, 120);
      const phoneRaw = sanitize(body.phone, 30);
      let phone = phoneRaw.replace(/[\s\-\(\)]/g, '');
      const subject = sanitize(body.subject, 150);
      const message = sanitize(body.message, 2000);
      const consent = !!body.consent;
      const utmSource = sanitize(body.utm_source, 100);

      const errors = {};
      if (!name || name.length < 2) errors.name = 'Please provide your name (minimum 2 characters).';
      const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!email || !emailPattern.test(email)) errors.email = 'Please provide a valid email address.';
      if (phone) {
        const phonePattern = /^(\+91)?[6-9]\d{9}$/;
        if (!phonePattern.test(phone)) errors.phone = 'Please enter a valid 10-digit Indian phone number.';
      }
      if (!subject || subject.length < 3) errors.subject = 'Please enter a subject (minimum 3 characters).';
      if (!message || message.length < 10) errors.message = 'Please provide your message (minimum 10 characters).';
      if (!consent) errors.consent = 'Consent is required to submit your message.';

      if (Object.keys(errors).length > 0) {
        return jsonResponse({ ok: false, errors }, 400, cors);
      }

      const reference = generateReference('CNT');

      if (env.DB) {
        try {
          await env.DB.prepare(`
            INSERT INTO contacts (
              reference, name, email, phone, subject, message,
              consent, status, notes, ip_hash, user_agent, utm_source
            ) VALUES (?, ?, ?, ?, ?, ?, ?, 'new', '', ?, ?, ?)
          `).bind(reference, name, email, phone, subject, message, consent ? 1 : 0, ipHash, userAgent, utmSource).run();
        } catch (dbErr) {
          console.error('D1 Error:', dbErr);
          return jsonResponse({ ok: false, error: 'Database storage error.' }, 500, cors);
        }
      }

      const notifyTo = env.NOTIFY_TO || 'AKdigitalstudio.org@gmail.com';
      const record = { reference, name, email, phone, subject, message };
      if (env.RESEND_API_KEY) {
        const adminMail = buildContactNotification(record);
        sendEmail({ apiKey: env.RESEND_API_KEY, to: notifyTo, subject: adminMail.subject, html: adminMail.html }).catch(() => {});
        const clientMail = buildContactAutoReply(record);
        sendEmail({ apiKey: env.RESEND_API_KEY, to: email, subject: clientMail.subject, html: clientMail.html }).catch(() => {});
      }

      return jsonResponse({ ok: true, reference }, 200, cors);
    }

    // 3. Admin Routes
    if (path.startsWith('/api/admin/')) {
      const auth = request.headers.get('Authorization') || '';
      if (!auth.startsWith('Bearer ') || !constantTimeCompare(auth.slice(7).trim(), env.ADMIN_TOKEN || '')) {
        return jsonResponse({ ok: false, error: 'Unauthorized.' }, 401, cors);
      }

      // /api/admin/inquiries
      if (path === '/api/admin/inquiries' && method === 'GET') {
        if (!env.DB) return jsonResponse({ ok: true, items: [] }, 200, cors);
        const { results } = await env.DB.prepare('SELECT * FROM inquiries ORDER BY id DESC LIMIT 200').all();
        return jsonResponse({ ok: true, items: results || [] }, 200, cors);
      }

      // /api/admin/contacts
      if (path === '/api/admin/contacts' && method === 'GET') {
        if (!env.DB) return jsonResponse({ ok: true, items: [] }, 200, cors);
        const { results } = await env.DB.prepare('SELECT * FROM contacts ORDER BY id DESC LIMIT 200').all();
        return jsonResponse({ ok: true, items: results || [] }, 200, cors);
      }

      // /api/admin/inquiries/:id
      const inqMatch = path.match(/^\/api\/admin\/inquiries\/(\d+)$/);
      if (inqMatch) {
        const id = parseInt(inqMatch[1], 10);
        if (method === 'PATCH') {
          const body = await request.json().catch(() => ({}));
          const status = sanitize(body.status, 50);
          const notes = sanitize(body.notes, 2000);
          if (env.DB) {
            await env.DB.prepare(`
              UPDATE inquiries
              SET status = coalesce(nullif(?, ''), status),
                  notes = coalesce(?, notes),
                  updated_at = CURRENT_TIMESTAMP
              WHERE id = ?
            `).bind(status, notes, id).run();
          }
          return jsonResponse({ ok: true, message: 'Record updated.' }, 200, cors);
        }
        if (method === 'DELETE') {
          if (env.DB) await env.DB.prepare('DELETE FROM inquiries WHERE id = ?').bind(id).run();
          return jsonResponse({ ok: true, message: 'Record deleted.' }, 200, cors);
        }
      }

      // /api/admin/contacts/:id
      const cntMatch = path.match(/^\/api\/admin\/contacts\/(\d+)$/);
      if (cntMatch) {
        const id = parseInt(cntMatch[1], 10);
        if (method === 'PATCH') {
          const body = await request.json().catch(() => ({}));
          const status = sanitize(body.status, 50);
          const notes = sanitize(body.notes, 2000);
          if (env.DB) {
            await env.DB.prepare(`
              UPDATE contacts
              SET status = coalesce(nullif(?, ''), status),
                  notes = coalesce(?, notes),
                  updated_at = CURRENT_TIMESTAMP
              WHERE id = ?
            `).bind(status, notes, id).run();
          }
          return jsonResponse({ ok: true, message: 'Record updated.' }, 200, cors);
        }
        if (method === 'DELETE') {
          if (env.DB) await env.DB.prepare('DELETE FROM contacts WHERE id = ?').bind(id).run();
          return jsonResponse({ ok: true, message: 'Record deleted.' }, 200, cors);
        }
      }
    }

    return jsonResponse({ ok: false, error: 'Endpoint not found.' }, 404, cors);
  }
};
