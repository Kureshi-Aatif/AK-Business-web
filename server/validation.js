const { body, validationResult } = require('express-validator');

// Helper to strip HTML tags and sanitize
function stripTags(str) {
  if (typeof str !== 'string') return '';
  return str.replace(/<[^>]*>?/gm, '').trim();
}

// Phone normalizer (accepts 10-digit Indian numbers or E.164 format)
function normalizePhone(val) {
  if (!val) return '';
  const cleaned = val.replace(/[\s\-()]/g, '');
  // Match 10 digits
  if (/^[6-9]\d{9}$/.test(cleaned)) {
    return `+91 ${cleaned.slice(0, 5)} ${cleaned.slice(5)}`;
  }
  // Match 0 followed by 10 digits
  if (/^0[6-9]\d{9}$/.test(cleaned)) {
    return `+91 ${cleaned.slice(1, 6)} ${cleaned.slice(6)}`;
  }
  // Match +91 followed by 10 digits
  if (/^\+91[6-9]\d{9}$/.test(cleaned)) {
    const digits = cleaned.slice(3);
    return `+91 ${digits.slice(0, 5)} ${digits.slice(5)}`;
  }
  // General E.164 format
  if (/^\+?[1-9]\d{6,14}$/.test(cleaned)) {
    return cleaned;
  }
  return val.trim();
}

// Validator for Inquiry
const validateInquiry = [
  body('name')
    .trim()
    .customSanitizer(stripTags)
    .notEmpty().withMessage('Full name is required.')
    .isLength({ min: 2, max: 100 }).withMessage('Name must be between 2 and 100 characters.'),

  body('email')
    .trim()
    .notEmpty().withMessage('Email address is required.')
    .isEmail().withMessage('Please provide a valid email address.')
    .normalizeEmail(),

  body('phone')
    .trim()
    .notEmpty().withMessage('Phone or WhatsApp number is required.')
    .custom((val) => {
      const clean = val.replace(/[\s\-()]/g, '');
      const isIndian = /^(?:\+91|0)?[6-9]\d{9}$/.test(clean);
      const isE164 = /^\+?[1-9]\d{6,14}$/.test(clean);
      if (!isIndian && !isE164) {
        throw new Error('Please enter a valid 10-digit phone number or international format.');
      }
      return true;
    })
    .customSanitizer(normalizePhone),

  body('business_name')
    .optional({ checkFalsy: true })
    .trim()
    .customSanitizer(stripTags)
    .isLength({ max: 120 }).withMessage('Business name cannot exceed 120 characters.'),

  body('business_type')
    .optional({ checkFalsy: true })
    .trim()
    .customSanitizer(stripTags)
    .isLength({ max: 100 }).withMessage('Business type cannot exceed 100 characters.'),

  body('interest')
    .trim()
    .customSanitizer(stripTags)
    .notEmpty().withMessage('Please select what service or plan you are interested in.'),

  body('budget')
    .optional({ checkFalsy: true })
    .trim()
    .customSanitizer(stripTags),

  body('timeline')
    .optional({ checkFalsy: true })
    .trim()
    .customSanitizer(stripTags),

  body('details')
    .trim()
    .customSanitizer(stripTags)
    .notEmpty().withMessage('Project details are required.')
    .isLength({ min: 10 }).withMessage('Please provide at least 10 characters describing your project.')
    .isLength({ max: 2000 }).withMessage('Project details cannot exceed 2,000 characters.'),

  body('contact_method')
    .optional()
    .trim()
    .customSanitizer(stripTags)
    .isIn(['WhatsApp', 'Call', 'Email']).withMessage('Invalid preferred contact method.'),

  body('consent')
    .custom((val) => {
      if (val === true || val === 'true' || val === 'on' || val === '1') {
        return true;
      }
      throw new Error('You must accept consent to be contacted regarding your inquiry.');
    })
];

// Validator for Contact
const validateContact = [
  body('name')
    .trim()
    .customSanitizer(stripTags)
    .notEmpty().withMessage('Your name is required.')
    .isLength({ min: 2, max: 100 }).withMessage('Name must be between 2 and 100 characters.'),

  body('email')
    .trim()
    .notEmpty().withMessage('Email address is required.')
    .isEmail().withMessage('Please provide a valid email address.')
    .normalizeEmail(),

  body('phone')
    .optional({ checkFalsy: true })
    .trim()
    .custom((val) => {
      if (!val) return true;
      const clean = val.replace(/[\s\-()]/g, '');
      const isIndian = /^(?:\+91|0)?[6-9]\d{9}$/.test(clean);
      const isE164 = /^\+?[1-9]\d{6,14}$/.test(clean);
      if (!isIndian && !isE164) {
        throw new Error('Please enter a valid phone number.');
      }
      return true;
    })
    .customSanitizer(normalizePhone),

  body('subject')
    .trim()
    .customSanitizer(stripTags)
    .notEmpty().withMessage('Subject is required.')
    .isLength({ min: 3, max: 150 }).withMessage('Subject must be between 3 and 150 characters.'),

  body('message')
    .trim()
    .customSanitizer(stripTags)
    .notEmpty().withMessage('Message is required.')
    .isLength({ min: 10 }).withMessage('Message must be at least 10 characters long.')
    .isLength({ max: 2000 }).withMessage('Message cannot exceed 2,000 characters.'),

  body('consent')
    .custom((val) => {
      if (val === true || val === 'true' || val === 'on' || val === '1') {
        return true;
      }
      throw new Error('You must agree to send your message.');
    })
];

// Error formatting middleware
function handleValidationErrors(req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const errorMap = {};
    errors.array().forEach((err) => {
      // Keep only first error per field
      if (!errorMap[err.path]) {
        errorMap[err.path] = err.msg;
      }
    });

    // Check if progressive enhancement request (regular HTML form submit without JS)
    if (!req.xhr && (!req.headers.accept || !req.headers.accept.includes('application/json'))) {
      req.flashErrors = errorMap;
      req.flashOld = req.body;
      return next('validation_failed');
    }

    return res.status(400).json({
      ok: false,
      errors: errorMap
    });
  }
  next();
}

module.exports = {
  validateInquiry,
  validateContact,
  handleValidationErrors,
  stripTags,
  normalizePhone
};
