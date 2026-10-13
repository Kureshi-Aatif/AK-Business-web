const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const crypto = require('crypto');
const config = require('./config');

// Safe constant-time string comparison against timing attacks
function constantTimeCompare(a, b) {
  if (typeof a !== 'string' || typeof b !== 'string') return false;
  const bufA = Buffer.from(a);
  const bufB = Buffer.from(b);
  if (bufA.length !== bufB.length) {
    crypto.timingSafeEqual(bufA, bufA);
    return false;
  }
  return crypto.timingSafeEqual(bufA, bufB);
}

// Generate auth token for admin session (24h validity)
function createAdminToken() {
  const payload = {
    role: 'admin',
    exp: Date.now() + 24 * 60 * 60 * 1000 // 24 hours
  };
  const json = JSON.stringify(payload);
  const signature = crypto.createHmac('sha256', config.sessionSecret).update(json).digest('hex');
  return Buffer.from(json).toString('base64url') + '.' + signature;
}

// Verify auth token
function verifyAdminToken(token) {
  if (!token || typeof token !== 'string') return false;
  const parts = token.split('.');
  if (parts.length !== 2) return false;
  try {
    const json = Buffer.from(parts[0], 'base64url').toString('utf8');
    const signature = parts[1];
    const expectedSig = crypto.createHmac('sha256', config.sessionSecret).update(json).digest('hex');
    if (!constantTimeCompare(signature, expectedSig)) return false;
    const payload = JSON.parse(json);
    if (payload.role !== 'admin' || Date.now() > payload.exp) return false;
    return true;
  } catch (e) {
    return false;
  }
}

// Generate or retrieve CSRF token
function getCsrfToken(req, res) {
  let token = req.cookies ? req.cookies.ak_csrf_token : null;
  if (!token) {
    token = crypto.randomBytes(24).toString('hex');
    res.cookie('ak_csrf_token', token, {
      httpOnly: false, // Accessible to front-end forms/fetch
      secure: config.nodeEnv === 'production',
      sameSite: 'lax',
      maxAge: 4 * 60 * 60 * 1000
    });
  }
  return token;
}

// Verify CSRF Double-Submit Cookie Token on state-changing requests
function verifyCsrfToken(req, res, next) {
  // Safe methods bypass CSRF
  if (['GET', 'HEAD', 'OPTIONS'].includes(req.method)) {
    return next();
  }

  const cookieToken = req.cookies ? req.cookies.ak_csrf_token : null;
  const bodyToken = req.body?._csrf || req.headers['x-csrf-token'];

  if (!cookieToken || !bodyToken || !constantTimeCompare(cookieToken, bodyToken)) {
    if (req.xhr || req.headers.accept?.includes('application/json')) {
      return res.status(403).json({
        ok: false,
        error: 'Invalid or missing security token (CSRF). Please refresh the page.'
      });
    }
    return res.status(403).send('Forbidden: Invalid CSRF Token. Please refresh and try again.');
  }

  next();
}

// Nonce generation middleware for Strict CSP
function nonceMiddleware(req, res, next) {
  res.locals.nonce = crypto.randomBytes(16).toString('base64');
  next();
}

// Admin Auth Middleware
function requireAdmin(req, res, next) {
  const token = req.cookies ? req.cookies.ak_admin_session : null;
  if (verifyAdminToken(token)) {
    req.isAdmin = true;
    res.setHeader('X-Robots-Tag', 'noindex, nofollow, noarchive');
    return next();
  }
  if (req.xhr || req.headers.accept?.includes('application/json')) {
    return res.status(401).json({ ok: false, error: 'Unauthorized. Please login.' });
  }
  return res.redirect(`${config.adminRoutePath}/login`);
}

// Honeypot & Minimum Fill-Time Middleware
function antiSpamCheck(req, res, next) {
  const hp1 = req.body._gotcha;
  const hp2 = req.body.website_url_hp;
  if ((hp1 && hp1.trim() !== '') || (hp2 && hp2.trim() !== '')) {
    // Pretend success to trap spambots
    return res.status(200).json({ ok: true, reference: 'SPAM-FILTERED', message: 'Success' });
  }

  const formRenderTime = parseInt(req.body._form_time, 10);
  if (formRenderTime && !isNaN(formRenderTime)) {
    const elapsed = Date.now() - formRenderTime;
    if (elapsed < 3000 && elapsed > -1000) {
      return res.status(400).json({
        ok: false,
        errors: { form: 'Submission received too quickly. Please take a moment to review before submitting.' }
      });
    }
  }

  next();
}

// Global IP Rate Limiter (250 requests per 15 minutes)
const globalRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 250,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    ok: false,
    error: 'Too many requests from this IP. Please try again shortly.'
  }
});

// Form Submission Limiter (5 per 10 minutes per IP)
const submissionRateLimiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    ok: false,
    errors: {
      form: 'Too many submissions received from this network. Please wait a few minutes or reach out directly on WhatsApp.'
    }
  }
});

// Admin Login Limiter (5 attempts per 15 minutes)
const loginRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    ok: false,
    error: 'Too many failed login attempts. Account temporarily locked for 15 minutes.'
  }
});

// Helmet Configuration with dynamic Nonce & strict CSP
const helmetMiddleware = (req, res, next) => {
  return helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: [
          "'self'",
          `'nonce-${res.locals.nonce}'`,
          "https://challenges.cloudflare.com",
          "https://www.googletagmanager.com",
          "https://*.google-analytics.com"
        ],
        styleSrc: [
          "'self'",
          "'unsafe-inline'", // Allowed for modern CSS variables & inline fallbacks
          "https://fonts.googleapis.com"
        ],
        fontSrc: ["'self'", "https://fonts.gstatic.com"],
        imgSrc: [
          "'self'",
          "data:",
          "https://images.unsplash.com",
          "https://*.google.com",
          "https://*.gstatic.com",
          "https://*.google-analytics.com",
          "https://*.googletagmanager.com"
        ],
        frameSrc: [
          "'self'",
          "https://www.google.com",
          "https://maps.google.com",
          "https://challenges.cloudflare.com"
        ],
        connectSrc: [
          "'self'",
          "https://*.google-analytics.com",
          "https://*.analytics.google.com",
          "https://*.googletagmanager.com",
          "https://challenges.cloudflare.com"
        ],
        objectSrc: ["'none'"],
        baseUri: ["'self'"],
        formAction: ["'self'"],
        frameAncestors: ["'none'"],
        upgradeInsecureRequests: config.nodeEnv === 'production' ? [] : null
      }
    },
    crossOriginEmbedderPolicy: false,
    crossOriginOpenerPolicy: { policy: 'same-origin' },
    crossOriginResourcePolicy: { policy: 'same-site' },
    dnsPrefetchControl: { allow: false },
    frameguard: { action: 'deny' },
    hsts: {
      maxAge: 31536000,
      includeSubDomains: true,
      preload: true
    },
    ieNoOpen: true,
    noSniff: true,
    referrerPolicy: { policy: 'strict-origin-when-cross-origin' },
    xssFilter: true
  })(req, res, () => {
    // Custom Permissions-Policy header
    res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=(), payment=()');
    next();
  });
};

// Enforce HTTPS and 301 www to naked domain redirect in production
function enforceHttpsAndCanonical(req, res, next) {
  if (config.nodeEnv !== 'production') return next();

  const host = req.headers.host || '';
  const proto = req.headers['x-forwarded-proto'] || req.protocol;

  // Redirect www to non-www
  if (host.startsWith('www.')) {
    const cleanHost = host.slice(4);
    return res.redirect(301, `https://${cleanHost}${req.url}`);
  }

  // Redirect HTTP to HTTPS
  if (proto !== 'https') {
    return res.redirect(301, `https://${host}${req.url}`);
  }

  next();
}

module.exports = {
  constantTimeCompare,
  createAdminToken,
  verifyAdminToken,
  getCsrfToken,
  verifyCsrfToken,
  nonceMiddleware,
  requireAdmin,
  antiSpamCheck,
  globalRateLimiter,
  submissionRateLimiter,
  loginRateLimiter,
  helmetMiddleware,
  enforceHttpsAndCanonical
};
