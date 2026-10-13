const express = require('express');
const router = express.Router();
const { db, hashIp, generateReference } = require('../db');
const { sendInquiryEmails, sendContactEmails } = require('../mailer');
const { submissionRateLimiter, antiSpamCheck, verifyCsrfToken } = require('../security');
const { validateInquiry, validateContact, handleValidationErrors } = require('../validation');

// POST /api/inquiries
router.post(
  '/inquiries',
  submissionRateLimiter,
  antiSpamCheck,
  verifyCsrfToken,
  validateInquiry,
  handleValidationErrors,
  async (req, res) => {
    try {
      const {
        name,
        email,
        phone,
        business_name,
        business_type,
        interest,
        budget,
        timeline,
        details,
        contact_method,
        utm_source,
        utm_medium,
        utm_campaign
      } = req.body;

      const reference = generateReference('INQ');
      const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress || '';
      const ip_hash = hashIp(ip);
      const user_agent = (req.headers['user-agent'] || '').slice(0, 255);

      const stmt = db.prepare(`
        INSERT INTO inquiries (
          reference, name, email, phone, business_name, business_type,
          interest, budget, timeline, details, contact_method,
          utm_source, utm_medium, utm_campaign, ip_hash, user_agent
        ) VALUES (
          @reference, @name, @email, @phone, @business_name, @business_type,
          @interest, @budget, @timeline, @details, @contact_method,
          @utm_source, @utm_medium, @utm_campaign, @ip_hash, @user_agent
        )
      `);

      const result = stmt.run({
        reference,
        name,
        email,
        phone,
        business_name: business_name || '',
        business_type: business_type || '',
        interest,
        budget: budget || '',
        timeline: timeline || '',
        details,
        contact_method: contact_method || 'WhatsApp',
        utm_source: (utm_source || '').slice(0, 100),
        utm_medium: (utm_medium || '').slice(0, 100),
        utm_campaign: (utm_campaign || '').slice(0, 100),
        ip_hash,
        user_agent
      });

      const record = {
        id: result.lastInsertRowid,
        reference,
        name,
        email,
        phone,
        business_name,
        business_type,
        interest,
        budget,
        timeline,
        details,
        contact_method: contact_method || 'WhatsApp',
        utm_source,
        utm_medium,
        utm_campaign
      };

      // Non-blocking email dispatch
      sendInquiryEmails(record).catch((err) => {
        console.error('[API Inquiry Email Error]:', err.message);
      });

      return res.status(200).json({
        ok: true,
        id: result.lastInsertRowid,
        reference,
        message: 'Your inquiry has been submitted successfully.'
      });
    } catch (err) {
      console.error('[API Inquiry Error]:', err);
      return res.status(500).json({
        ok: false,
        errors: { form: 'An unexpected database error occurred. Please try again.' }
      });
    }
  }
);

// POST /api/contacts
router.post(
  '/contacts',
  submissionRateLimiter,
  antiSpamCheck,
  verifyCsrfToken,
  validateContact,
  handleValidationErrors,
  async (req, res) => {
    try {
      const { name, email, phone, subject, message } = req.body;
      const reference = generateReference('CNT');
      const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress || '';
      const ip_hash = hashIp(ip);

      const stmt = db.prepare(`
        INSERT INTO contacts (
          reference, name, email, phone, subject, message, ip_hash
        ) VALUES (
          @reference, @name, @email, @phone, @subject, @message, @ip_hash
        )
      `);

      const result = stmt.run({
        reference,
        name,
        email,
        phone: phone || '',
        subject,
        message,
        ip_hash
      });

      const record = {
        id: result.lastInsertRowid,
        reference,
        name,
        email,
        phone,
        subject,
        message
      };

      // Non-blocking email dispatch
      sendContactEmails(record).catch((err) => {
        console.error('[API Contact Email Error]:', err.message);
      });

      return res.status(200).json({
        ok: true,
        id: result.lastInsertRowid,
        reference,
        message: 'Your message has been sent successfully.'
      });
    } catch (err) {
      console.error('[API Contact Error]:', err);
      return res.status(500).json({
        ok: false,
        errors: { form: 'An unexpected database error occurred. Please try again.' }
      });
    }
  }
);

module.exports = router;
