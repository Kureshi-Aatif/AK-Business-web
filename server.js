import express from 'express';
import path from 'path';
import compression from 'compression';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import config from './server/config.js';
import {
  helmetMiddleware,
  nonceMiddleware,
  enforceHttpsAndCanonical,
  globalRateLimiter,
  getCsrfToken
} from './server/security.js';

// Initialize database & automated daily backups
import './server/db.js';
const app = express();

// Disable x-powered-by header
app.disable('x-powered-by');

// Trust proxy for reverse proxies (Render, Railway, Nginx, Docker)
app.set('trust proxy', 1);

// Production HTTPS and canonical redirect (www to non-www)
app.use(enforceHttpsAndCanonical);

// Generate Nonce per request for strict CSP
app.use(nonceMiddleware);

// Security headers via Helmet with Nonce
app.use(helmetMiddleware);

// Global Rate Limiting
app.use(globalRateLimiter);

// Gzip / Brotli response compression
app.use(compression());

// Structured HTTP request logging (no sensitive personal data)
if (config.nodeEnv !== 'test') {
  app.use(morgan(config.nodeEnv === 'production' ? 'combined' : 'dev'));
}

// Body parsing with 20 KB security limit
app.use(express.json({ limit: '20kb' }));
app.use(express.urlencoded({ extended: true, limit: '20kb' }));
app.use(cookieParser(config.sessionSecret));

// Static files with aggressive caching in production and dotfiles allowed (.well-known)
app.use(
  express.static(path.join(__dirname, 'public'), {
    maxAge: config.nodeEnv === 'production' ? '30d' : '0',
    etag: true,
    lastModified: true,
    dotfiles: 'allow'
  })
);

// View engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// Health check endpoint (GET /healthz)
app.get('/healthz', (req, res) => {
  res.status(200).json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: Math.floor(process.uptime()),
    service: 'AK Digital Studio'
  });
});

// Global view locals & CSRF token injection
app.use((req, res, next) => {
  res.locals.currentYear = new Date().getFullYear();
  res.locals.siteUrl = config.siteUrl;
  res.locals.business = config.business;
  res.locals.seo = config.seo;
  res.locals.turnstile = config.turnstile;
  res.locals.csrfToken = getCsrfToken(req, res);
  res.locals.adminRoute = config.adminRoutePath;
  next();
});

// Mount Routes
const siteRoutes = import ('./server/routes/site');
const apiRoutes = import ('./server/routes/api');
const adminRoutes = import ('./server/routes/admin');

app.use('/api', apiRoutes);
app.use(config.adminRoutePath, adminRoutes);
app.use('/', siteRoutes);

// Custom 404 Handler
app.use((req, res) => {
  res.status(404).render('pages/404', {
    pageTitle: 'Page Not Found (404) | AK Digital Studio',
    metaDesc: 'The page you requested could not be found. Explore our website design, digital marketing, and video editing services in Surat, Gujarat.',
    canonical: `${config.siteUrl}${req.path}`,
    activePath: '',
    navItems: [
      { label: 'Home', href: '/', active: false },
      { label: 'Why a Website', href: '/why-website', active: false },
      { label: 'Plans & Pricing', href: '/plans', active: false },
      { label: 'Services', href: '/services', active: false },
      { label: 'FAQ', href: '/faq', active: false },
      { label: 'Blog', href: '/blog', active: false },
      { label: 'Inquiry', href: '/inquiry', active: false },
      { label: 'Contact', href: '/contact', active: false }
    ],
    business: config.business
  });
});

// Custom 500 Error Handler
app.use((err, req, res, next) => {
  console.error('[Unhandled Server Error]:', err.message);

  if (req.xhr || req.headers.accept?.includes('application/json')) {
    return res.status(500).json({
      ok: false,
      error: config.nodeEnv === 'production' ? 'Internal server error' : err.message
    });
  }

  res.status(500).render('pages/500', {
    pageTitle: 'Server Error (500) | AK Digital Studio',
    metaDesc: 'An unexpected internal error occurred on our server.',
    canonical: `${config.siteUrl}${req.path}`,
    activePath: '',
    navItems: [
      { label: 'Home', href: '/', active: false },
      { label: 'Why a Website', href: '/why-website', active: false },
      { label: 'Plans & Pricing', href: '/plans', active: false },
      { label: 'Services', href: '/services', active: false },
      { label: 'FAQ', href: '/faq', active: false },
      { label: 'Blog', href: '/blog', active: false },
      { label: 'Inquiry', href: '/inquiry', active: false },
      { label: 'Contact', href: '/contact', active: false }
    ],
    business: config.business,
    error: config.nodeEnv === 'production' ? null : err.message
  });
});

// Start Server if directly executed
if (require.main === module) {
  app.listen(config.port, () => {
    console.log(`=======================================================`);
    console.log(`🚀 AK Digital Studio Server running on port ${config.port}`);
    console.log(`🌐 Local URL:   http://localhost:${config.port}`);
    console.log(`🛡️  Admin URL:   http://localhost:${config.port}${config.adminRoutePath}`);
    console.log(`🏥 Healthz:     http://localhost:${config.port}/healthz`);
    console.log(`📍 Environment: ${config.nodeEnv}`);
    console.log(`=======================================================`);
  });
}

module.exports = app;
