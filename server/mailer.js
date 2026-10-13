const nodemailer = require('nodemailer');
const config = require('./config');

let transporter = null;

if (config.smtp.host && config.smtp.user) {
  try {
    transporter = nodemailer.createTransport({
      host: config.smtp.host,
      port: config.smtp.port,
      secure: config.smtp.port === 465,
      auth: {
        user: config.smtp.user,
        pass: config.smtp.pass
      }
    });
  } catch (err) {
    console.error('[Mailer] Failed to initialize Nodemailer transporter:', err.message);
  }
}

// Brand email header and footer styling
function getEmailWrapper(content, title) {
  return `
  <!DOCTYPE html>
  <html>
  <head>
    <meta charset="utf-8">
    <title>${title}</title>
    <style>
      body { margin: 0; padding: 0; font-family: 'DM Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #F4F7FF; color: #071A57; }
      .container { max-width: 600px; margin: 20px auto; background: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 20px rgba(11, 63, 216, 0.08); border: 1px solid #D5DEF5; }
      .header { background: linear-gradient(135deg, #071A57 0%, #0B3FD8 100%); padding: 32px 24px; text-align: center; color: #ffffff; }
      .logo-title { font-size: 24px; font-weight: 800; letter-spacing: -0.5px; margin: 0; color: #ffffff; }
      .tagline { font-size: 11px; text-transform: uppercase; letter-spacing: 2px; color: #E6EEFF; margin-top: 6px; }
      .body { padding: 32px 24px; }
      .badge { display: inline-block; background: #FF7A1A; color: #ffffff; font-weight: 700; font-size: 13px; padding: 6px 14px; border-radius: 9999px; }
      .ref-box { background: #E6EEFF; border-left: 4px solid #0B3FD8; padding: 14px 18px; margin: 20px 0; border-radius: 6px; }
      .ref-id { font-family: monospace; font-size: 18px; font-weight: 700; color: #0B3FD8; }
      .data-table { width: 100%; border-collapse: collapse; margin: 16px 0; }
      .data-table td { padding: 10px 12px; border-bottom: 1px solid #F4F7FF; font-size: 14px; }
      .data-table td.label { font-weight: 600; color: #4B5B86; width: 35%; }
      .data-table td.val { color: #071A57; }
      .footer { background: #050F36; color: #D5DEF5; padding: 24px; text-align: center; font-size: 12px; line-height: 1.6; }
      .btn { display: inline-block; background: #FF7A1A; color: #ffffff !important; text-decoration: none; font-weight: 700; padding: 12px 24px; border-radius: 9999px; margin-top: 16px; }
    </style>
  </head>
  <body>
    <div class="container">
      <div class="header">
        <h1 class="logo-title">AK DIGITAL STUDIO</h1>
        <div class="tagline">GROW YOUR BRAND. REACH MORE. ACHIEVE MORE.</div>
      </div>
      <div class="body">
        ${content}
      </div>
      <div class="footer">
        <p><strong>AK Digital Studio</strong> &bull; Surat, Gujarat, India</p>
        <p>Email: ${config.business.email} | Instagram: @${config.business.instagram}</p>
        <p style="color: #4B5B86; margin-top: 10px;">&copy; ${new Date().getFullYear()} AK Digital Studio. All rights reserved.</p>
      </div>
    </div>
  </body>
  </html>
  `;
}

// Send notification & auto-reply for Inquiry
async function sendInquiryEmails(inquiry) {
  const adminSubject = `[New Inquiry] ${inquiry.reference} - ${inquiry.name} (${inquiry.interest})`;
  const visitorSubject = `We received your inquiry - AK Digital Studio (${inquiry.reference})`;

  const adminHtml = getEmailWrapper(`
    <span class="badge">New Project Inquiry</span>
    <h2 style="color: #071A57; margin-top: 12px;">New Inquiry Received</h2>
    <div class="ref-box">
      Reference ID: <span class="ref-id">${inquiry.reference}</span>
    </div>
    <table class="data-table">
      <tr><td class="label">Full Name:</td><td class="val"><strong>${inquiry.name}</strong></td></tr>
      <tr><td class="label">Email:</td><td class="val"><a href="mailto:${inquiry.email}">${inquiry.email}</a></td></tr>
      <tr><td class="label">Phone / WhatsApp:</td><td class="val">${inquiry.phone}</td></tr>
      <tr><td class="label">Business Name:</td><td class="val">${inquiry.business_name || 'N/A'}</td></tr>
      <tr><td class="label">Business Type:</td><td class="val">${inquiry.business_type || 'N/A'}</td></tr>
      <tr><td class="label">Interested In:</td><td class="val"><strong>${inquiry.interest}</strong></td></tr>
      <tr><td class="label">Budget Range:</td><td class="val">${inquiry.budget || 'Not specified'}</td></tr>
      <tr><td class="label">Preferred Timeline:</td><td class="val">${inquiry.timeline || 'Not specified'}</td></tr>
      <tr><td class="label">Preferred Contact:</td><td class="val">${inquiry.contact_method}</td></tr>
      <tr><td class="label">Project Details:</td><td class="val" style="white-space: pre-line;">${inquiry.details}</td></tr>
    </table>
    <p><a href="${config.siteUrl}/admin" class="btn">View in Admin Dashboard</a></p>
  `, adminSubject);

  const visitorHtml = getEmailWrapper(`
    <h2 style="color: #071A57;">Thank You for Reaching Out, ${inquiry.name}!</h2>
    <p style="font-size: 15px; line-height: 1.6; color: #4B5B86;">
      We have received your project details and our lead developer, <strong>Aatif Kureshi</strong>, is reviewing your request.
    </p>
    <div class="ref-box">
      Your Inquiry Reference: <br>
      <span class="ref-id">${inquiry.reference}</span>
    </div>
    <p style="font-size: 14px; line-height: 1.6;">
      <strong>What happens next?</strong><br>
      1. We analyze your requirements and prepare a custom proposal or scope.<br>
      2. We will contact you via your preferred method (<strong>${inquiry.contact_method}</strong>) within 24 business hours.<br>
      3. For urgent questions, you can click below to message us directly on WhatsApp.
    </p>
    <p>
      <a href="https://wa.me/${config.business.whatsappNumber.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(`Hello AK Digital Studio, I submitted an inquiry with reference ${inquiry.reference}`)}" class="btn">Chat on WhatsApp</a>
    </p>
  `, visitorSubject);

  if (!transporter) {
    console.log(`[Email Simulation] New Inquiry: ${inquiry.reference}`);
    console.log(`[Email Simulation] Admin Notification to ${config.smtp.notifyTo}: Subject: "${adminSubject}"`);
    console.log(`[Email Simulation] Visitor Auto-Reply to ${inquiry.email}: Subject: "${visitorSubject}"`);
    return { ok: true, simulated: true };
  }

  try {
    await Promise.allSettled([
      transporter.sendMail({
        from: config.smtp.from,
        to: config.smtp.notifyTo,
        subject: adminSubject,
        html: adminHtml
      }),
      transporter.sendMail({
        from: config.smtp.from,
        to: inquiry.email,
        subject: visitorSubject,
        html: visitorHtml
      })
    ]);
    return { ok: true, sent: true };
  } catch (err) {
    console.error('[Mailer Error] Failed to send inquiry emails:', err.message);
    return { ok: false, error: err.message };
  }
}

// Send notification & auto-reply for Contact
async function sendContactEmails(contact) {
  const adminSubject = `[General Contact] ${contact.reference} - ${contact.subject} (${contact.name})`;
  const visitorSubject = `Message received - AK Digital Studio (${contact.reference})`;

  const adminHtml = getEmailWrapper(`
    <span class="badge">General Contact Message</span>
    <h2 style="color: #071A57; margin-top: 12px;">New Contact Submission</h2>
    <div class="ref-box">
      Reference ID: <span class="ref-id">${contact.reference}</span>
    </div>
    <table class="data-table">
      <tr><td class="label">Name:</td><td class="val"><strong>${contact.name}</strong></td></tr>
      <tr><td class="label">Email:</td><td class="val"><a href="mailto:${contact.email}">${contact.email}</a></td></tr>
      <tr><td class="label">Phone:</td><td class="val">${contact.phone || 'N/A'}</td></tr>
      <tr><td class="label">Subject:</td><td class="val"><strong>${contact.subject}</strong></td></tr>
      <tr><td class="label">Message:</td><td class="val" style="white-space: pre-line;">${contact.message}</td></tr>
    </table>
    <p><a href="${config.siteUrl}/admin" class="btn">View in Admin Dashboard</a></p>
  `, adminSubject);

  const visitorHtml = getEmailWrapper(`
    <h2 style="color: #071A57;">Hi ${contact.name}, We Received Your Message</h2>
    <p style="font-size: 15px; line-height: 1.6; color: #4B5B86;">
      Thank you for contacting AK Digital Studio. We have recorded your message and will get back to you shortly.
    </p>
    <div class="ref-box">
      Your Reference ID: <br>
      <span class="ref-id">${contact.reference}</span>
    </div>
    <p style="font-size: 14px; color: #4B5B86;">
      Subject: <strong>${contact.subject}</strong>
    </p>
  `, visitorSubject);

  if (!transporter) {
    console.log(`[Email Simulation] New Contact: ${contact.reference}`);
    console.log(`[Email Simulation] Admin Notification to ${config.smtp.notifyTo}: Subject: "${adminSubject}"`);
    console.log(`[Email Simulation] Visitor Auto-Reply to ${contact.email}: Subject: "${visitorSubject}"`);
    return { ok: true, simulated: true };
  }

  try {
    await Promise.allSettled([
      transporter.sendMail({
        from: config.smtp.from,
        to: config.smtp.notifyTo,
        subject: adminSubject,
        html: adminHtml
      }),
      transporter.sendMail({
        from: config.smtp.from,
        to: contact.email,
        subject: visitorSubject,
        html: visitorHtml
      })
    ]);
    return { ok: true, sent: true };
  } catch (err) {
    console.error('[Mailer Error] Failed to send contact emails:', err.message);
    return { ok: false, error: err.message };
  }
}

module.exports = {
  sendInquiryEmails,
  sendContactEmails
};
