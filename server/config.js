const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.resolve(__dirname, '../.env') });

const config = {
  port: parseInt(process.env.PORT, 10) || 3000,
  nodeEnv: process.env.NODE_ENV || 'development',
  siteUrl: (process.env.SITE_URL || 'http://localhost:3000').replace(/\/+$/, ''),
  adminPassword: process.env.ADMIN_PASSWORD || 'adminSecret123!',
  sessionSecret: process.env.SESSION_SECRET || 'default-ak-studio-session-secret-change-me',
  adminRoutePath: (process.env.ADMIN_ROUTE_PATH || '/admin').replace(/\/+$/, '') || '/admin',

  // Business Information (NAP)
  business: {
    name: process.env.BUSINESS_NAME || 'AK Digital Studio',
    tagline: 'GROW YOUR BRAND. REACH MORE. ACHIEVE MORE.',
    heroHeadline: 'Your trusted partner for digital growth and modern websites.',
    leadDeveloper: process.env.LEAD_DEVELOPER || 'Aatif Kureshi',
    city: process.env.CITY || 'Surat, Gujarat',
    address: 'Surat, Gujarat 395003, India',
    phone: process.env.BUSINESS_PHONE || '+91 76984 50003',
    email: process.env.BUSINESS_EMAIL || 'AKdigitalstudio.org@gmail.com',
    instagram: process.env.INSTAGRAM_HANDLE || 'ak.digital_studio',
    instagramUrl: `https://instagram.com/${process.env.INSTAGRAM_HANDLE || 'ak.digital_studio'}`,
    portfolioUrl: process.env.PORTFOLIO_URL || 'https://drive.google.com/drive/folders/1rVIyFGmlAZ6Q309xKHGT4LxL0HUl6ej4?usp=drive_link',
    whatsappNumber: process.env.WHATSAPP_NUMBER || '+917698450003',
    googleReviewUrl: process.env.GOOGLE_REVIEW_URL || 'https://g.page/r/sample-surat-review/review',
    workingHours: 'Mon - Sat: 9:30 AM - 7:30 PM (IST)'
  },

  // SEO & Verification Tokens
  seo: {
    gscVerification: process.env.GSC_VERIFICATION || '',
    bingVerification: process.env.BING_VERIFICATION || '',
    gaId: process.env.GA_ID || ''
  },

  // SMTP Settings
  smtp: {
    host: process.env.SMTP_HOST || '',
    port: parseInt(process.env.SMTP_PORT, 10) || 587,
    user: process.env.SMTP_USER || '',
    pass: process.env.SMTP_PASS || '',
    from: process.env.MAIL_FROM || 'AK Digital Studio <noreply@akdigitalstudio.com>',
    notifyTo: process.env.NOTIFY_TO || 'AKdigitalstudio.org@gmail.com'
  },

  // Turnstile CAPTCHA (optional)
  turnstile: {
    siteKey: process.env.TURNSTILE_SITE_KEY || '',
    secretKey: process.env.TURNSTILE_SECRET || ''
  }
};

// Fail-fast in production if secrets are unsafe or default
if (config.nodeEnv === 'production') {
  if (!process.env.SESSION_SECRET || process.env.SESSION_SECRET.includes('default')) {
    throw new Error('[FATAL SECURITY]: SESSION_SECRET must be securely configured in production environment.');
  }
  if (!process.env.ADMIN_PASSWORD || process.env.ADMIN_PASSWORD === 'adminSecret123!') {
    throw new Error('[FATAL SECURITY]: ADMIN_PASSWORD must be changed from default in production environment.');
  }
}

module.exports = config;
