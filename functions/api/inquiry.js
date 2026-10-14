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
import { buildInquiryNotification, buildInquiryAutoReply } from '../email-templates.js';

export async function onRequestOptions({ request, env }) {
  return handleOptions(request, env);
}

export async function onRequestPost({ request, env }) {
  const cors = getCorsHeaders(request, env);

  // Rate Limiting & Client IP
  const clientIp = request.headers.get('CF-Connecting-IP') || request.headers.get('x-forwarded-for') || '';
  const userAgent = request.headers.get('user-agent') || '';
  const ipHash = await hashIp(clientIp, env.IP_SALT || 'ak-default-salt');

  const allowed = await checkRateLimit(env.DB, ipHash, 10, 3600);
  if (!allowed) {
    return jsonResponse({ ok: false, error: 'Too many submissions from this connection. Please try again later.' }, 429, cors);
  }

  // Parse Body
  let body;
  try {
    body = await request.json();
  } catch (e) {
    return jsonResponse({ ok: false, error: 'Invalid JSON body.' }, 400, cors);
  }

  // Anti-spam Turnstile Verification
  const turnstileToken = body.turnstile_token;
  const isHuman = await verifyTurnstile(turnstileToken, env.TURNSTILE_SECRET, clientIp);
  if (!isHuman) {
    return jsonResponse({ ok: false, error: 'CAPTCHA security verification failed. Please try again.' }, 400, cors);
  }

  // Sanitize Inputs
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

  // Validation
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

  // Insert into Cloudflare D1
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
      console.error('D1 Database Insertion Error:', dbErr);
      return jsonResponse({ ok: false, error: 'Database storage error. Please try again or WhatsApp us directly.' }, 500, cors);
    }
  }

  // Trigger optional transactional emails via Resend
  const notifyTo = env.NOTIFY_TO || 'AKdigitalstudio.org@gmail.com';
  const record = { reference, name, email, phone, business_name: businessName, business_type: businessType, interest, budget, timeline, details, contact_method: contactMethod };
  
  if (env.RESEND_API_KEY) {
    // 1. Notification to Studio Lead Developer
    const adminMail = buildInquiryNotification(record);
    sendEmail({
      apiKey: env.RESEND_API_KEY,
      to: notifyTo,
      subject: adminMail.subject,
      html: adminMail.html
    }).catch(() => {});

    // 2. Auto-reply to client
    const clientMail = buildInquiryAutoReply(record);
    sendEmail({
      apiKey: env.RESEND_API_KEY,
      to: email,
      subject: clientMail.subject,
      html: clientMail.html
    }).catch(() => {});
  }

  return jsonResponse({ ok: true, reference }, 200, cors);
}
