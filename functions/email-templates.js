/**
 * Branded HTML Email Templates for AK Digital Studio
 */

export function getBrandedEmailWrapper(content, title) {
  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>${title}</title>
  <style>
    body { margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #F4F7FF; color: #071A57; }
    .wrapper { max-width: 600px; margin: 20px auto; background: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 20px rgba(11, 63, 216, 0.08); border: 1px solid #D5DEF5; }
    .header { background: linear-gradient(135deg, #071A57 0%, #0B3FD8 100%); padding: 32px 24px; text-align: center; color: #ffffff; }
    .header h1 { margin: 0; font-size: 24px; font-weight: 800; letter-spacing: -0.5px; }
    .header p { margin: 6px 0 0 0; font-size: 11px; text-transform: uppercase; letter-spacing: 2px; color: #E6EEFF; }
    .content { padding: 32px 24px; }
    .badge { display: inline-block; background: #FF7A1A; color: #ffffff; font-weight: 700; font-size: 13px; padding: 6px 14px; border-radius: 9999px; }
    .ref-card { background: #E6EEFF; border-left: 4px solid #0B3FD8; padding: 14px 18px; margin: 20px 0; border-radius: 6px; }
    .ref-code { font-family: monospace; font-size: 18px; font-weight: 800; color: #0B3FD8; }
    .info-table { width: 100%; border-collapse: collapse; margin: 16px 0; }
    .info-table td { padding: 10px 12px; border-bottom: 1px solid #F4F7FF; font-size: 14px; vertical-align: top; }
    .info-table td.lbl { font-weight: 700; color: #4B5B86; width: 34%; }
    .info-table td.val { color: #071A57; }
    .footer { background: #050F36; color: #D5DEF5; padding: 24px; text-align: center; font-size: 12px; line-height: 1.6; }
    .footer a { color: #2E6BFF; text-decoration: none; }
  </style>
</head>
<body>
  <div class="wrapper">
    <div class="header">
      <h1>AK DIGITAL STUDIO</h1>
      <p>GROW YOUR BRAND. REACH MORE. ACHIEVE MORE.</p>
    </div>
    <div class="content">
      ${content}
    </div>
    <div class="footer">
      <p><strong>AK Digital Studio</strong> &bull; Surat, Gujarat, India</p>
      <p>Phone: +91 76984 50003 &bull; Email: AKdigitalstudio.org@gmail.com</p>
      <p><a href="https://instagram.com/ak.digital_studio">Instagram: @ak.digital_studio</a></p>
      <p style="color: #4B5B86; margin-top: 8px;">&copy; ${new Date().getFullYear()} AK Digital Studio. All rights reserved.</p>
    </div>
  </div>
</body>
</html>`;
}

export function buildInquiryNotification(inquiry) {
  const title = `[New Inquiry] ${inquiry.reference} - ${inquiry.name} (${inquiry.interest})`;
  const body = `
    <span class="badge">New Project Inquiry</span>
    <h2 style="color: #071A57; margin-top: 14px;">Project Inquiry Received</h2>
    <div class="ref-card">
      Reference ID: <span class="ref-code">${inquiry.reference}</span>
    </div>
    <table class="info-table">
      <tr><td class="lbl">Client Name:</td><td class="val"><strong>${inquiry.name}</strong></td></tr>
      <tr><td class="lbl">Email:</td><td class="val"><a href="mailto:${inquiry.email}">${inquiry.email}</a></td></tr>
      <tr><td class="lbl">Phone / WhatsApp:</td><td class="val"><a href="tel:${inquiry.phone}">${inquiry.phone}</a></td></tr>
      <tr><td class="lbl">Business Name:</td><td class="val">${inquiry.business_name || 'N/A'}</td></tr>
      <tr><td class="lbl">Business Type:</td><td class="val">${inquiry.business_type || 'N/A'}</td></tr>
      <tr><td class="lbl">Interested In:</td><td class="val"><strong>${inquiry.interest}</strong></td></tr>
      <tr><td class="lbl">Budget:</td><td class="val">${inquiry.budget || 'Not specified'}</td></tr>
      <tr><td class="lbl">Timeline:</td><td class="val">${inquiry.timeline || 'Not specified'}</td></tr>
      <tr><td class="lbl">Preferred Contact:</td><td class="val">${inquiry.contact_method}</td></tr>
      <tr><td class="lbl">Project Details:</td><td class="val" style="white-space: pre-wrap;">${inquiry.details}</td></tr>
    </table>
  `;
  return { subject: title, html: getBrandedEmailWrapper(body, title) };
}

export function buildInquiryAutoReply(inquiry) {
  const title = `We received your inquiry - AK Digital Studio (${inquiry.reference})`;
  const body = `
    <h2 style="color: #071A57;">Thank You for Contacting Us, ${inquiry.name}!</h2>
    <p style="font-size: 15px; line-height: 1.6; color: #4B5B86;">
      We have successfully received your project inquiry for <strong>${inquiry.interest}</strong>. Lead Developer <strong>Aatif Kureshi</strong> is personally reviewing your requirements.
    </p>
    <div class="ref-card">
      Your Inquiry Reference: <br>
      <span class="ref-code">${inquiry.reference}</span>
    </div>
    <p style="font-size: 14px; line-height: 1.6; color: #4B5B86;">
      We will contact you within 24 hours with a transparent project proposal and timeline.
    </p>
    <p style="margin-top: 24px;">
      <a href="https://wa.me/917698450003?text=Hi%20AK%20Digital%20Studio%2C%20regarding%20my%20inquiry%20(${inquiry.reference})" style="display: inline-block; background: #25D366; color: #ffffff; text-decoration: none; font-weight: 700; padding: 12px 24px; border-radius: 9999px;">
        Chat with us on WhatsApp
      </a>
    </p>
  `;
  return { subject: title, html: getBrandedEmailWrapper(body, title) };
}

export function buildContactNotification(contact) {
  const title = `[New Contact] ${contact.reference} - ${contact.name}: ${contact.subject}`;
  const body = `
    <span class="badge">New Contact Message</span>
    <h2 style="color: #071A57; margin-top: 14px;">Contact Message Received</h2>
    <div class="ref-card">
      Reference ID: <span class="ref-code">${contact.reference}</span>
    </div>
    <table class="info-table">
      <tr><td class="lbl">Sender Name:</td><td class="val"><strong>${contact.name}</strong></td></tr>
      <tr><td class="lbl">Email:</td><td class="val"><a href="mailto:${contact.email}">${contact.email}</a></td></tr>
      <tr><td class="lbl">Phone:</td><td class="val">${contact.phone || 'Not provided'}</td></tr>
      <tr><td class="lbl">Subject:</td><td class="val"><strong>${contact.subject}</strong></td></tr>
      <tr><td class="lbl">Message:</td><td class="val" style="white-space: pre-wrap;">${contact.message}</td></tr>
    </table>
  `;
  return { subject: title, html: getBrandedEmailWrapper(body, title) };
}

export function buildContactAutoReply(contact) {
  const title = `We received your message - AK Digital Studio (${contact.reference})`;
  const body = `
    <h2 style="color: #071A57;">Thank You for Reaching Out, ${contact.name}!</h2>
    <p style="font-size: 15px; line-height: 1.6; color: #4B5B86;">
      We have received your message regarding <strong>${contact.subject}</strong> and our team in Surat will respond to your inquiry shortly.
    </p>
    <div class="ref-card">
      Message Reference: <br>
      <span class="ref-code">${contact.reference}</span>
    </div>
  `;
  return { subject: title, html: getBrandedEmailWrapper(body, title) };
}
