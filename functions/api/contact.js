import {
  getCorsHeaders,
  handleOptions,
  hashIp,
  generateReference,
  sanitize,
  verifyTurnstile,
  checkRateLimit,
  sendEmail,
  jsonResponse
} from '../utils.js';
import { buildContactNotification, buildContactAutoReply } from '../email-templates.js';

export async function onRequestOptions({ request, env }) {
  return handleOptions(request, env);
}

export async function onRequestPost({ request, env }) {
  const cors = getCorsHeaders(request, env);

  const clientIp = request.headers.get('CF-Connecting-IP') || request.headers.get('x-forwarded-for') || '';
  const userAgent = request.headers.get('user-agent') || '';
  const ipHash = await hashIp(clientIp, env.IP_SALT || 'ak-default-salt');

  const allowed = await checkRateLimit(env.DB, ipHash, 10, 3600);
  if (!allowed) {
    return jsonResponse({ ok: false, error: 'Too many requests from this network. Please try again later.' }, 429, cors);
  }

  let body;
  try {
    body = await request.json();
  } catch (e) {
    return jsonResponse({ ok: false, error: 'Invalid JSON payload.' }, 400, cors);
  }

  const turnstileToken = body.turnstile_token;
  const isHuman = await verifyTurnstile(turnstileToken, env.TURNSTILE_SECRET, clientIp);
  if (!isHuman) {
    return jsonResponse({ ok: false, error: 'CAPTCHA security verification failed. Please try again.' }, 400, cors);
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
      `).bind(
        reference, name, email, phone, subject, message,
        consent ? 1 : 0, ipHash, userAgent, utmSource
      ).run();
    } catch (dbErr) {
      console.error('D1 Database Insertion Error (contacts):', dbErr);
      return jsonResponse({ ok: false, error: 'Database error. Please try again or message us on WhatsApp.' }, 500, cors);
    }
  }

  const notifyTo = env.NOTIFY_TO || 'AKdigitalstudio.org@gmail.com';
  const record = { reference, name, email, phone, subject, message };

  if (env.RESEND_API_KEY) {
    const adminMail = buildContactNotification(record);
    sendEmail({
      apiKey: env.RESEND_API_KEY,
      to: notifyTo,
      subject: adminMail.subject,
      html: adminMail.html
    }).catch(() => {});

    const clientMail = buildContactAutoReply(record);
    sendEmail({
      apiKey: env.RESEND_API_KEY,
      to: email,
      subject: clientMail.subject,
      html: clientMail.html
    }).catch(() => {});
  }

  return jsonResponse({ ok: true, reference }, 200, cors);
}
