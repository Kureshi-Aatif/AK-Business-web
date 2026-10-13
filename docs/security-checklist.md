# AK Digital Studio — Application Security Checklist & Hardening Guide

This document summarizes the enterprise-grade defense-in-depth measures implemented in the application and outlines configuration steps required by the site administrator upon deployment.

---

## 1. Implemented Security Controls (Codebase Built-in)

### A. Transport & Network Layer
- **Strict HTTPS Enforcement**: Automatic HTTP-to-HTTPS redirect with canonical domain unification (`www` redirect to naked domain).
- **HSTS (HTTP Strict Transport Security)**: `max-age=31536000; includeSubDomains; preload` header enabled for all production requests.
- **Reverse Proxy Header Trust**: `app.set('trust proxy', 1)` enabled for proper client IP identification behind Cloudflare, Nginx, Render, or Railway.

### B. HTTP Security Headers (via Helmet & Custom Middleware)
- **Content-Security-Policy (CSP)**:
  - Strict policy utilizing cryptographically generated random nonces (`res.locals.nonce`) on every request.
  - Zero tolerance for `'unsafe-inline'` script execution.
  - Allowed origins strictly whitelisted: Google Fonts (`fonts.googleapis.com`, `fonts.gstatic.com`), Google Maps (`maps.google.com`, `www.google.com`), Google Analytics (`*.google-analytics.com`, `*.googletagmanager.com`), and Cloudflare Turnstile (`challenges.cloudflare.com`).
- **X-Content-Type-Options**: `nosniff` preventing MIME confusion attacks.
- **Referrer-Policy**: `strict-origin-when-cross-origin`.
- **Permissions-Policy**: Camera, microphone, and geolocation explicitly disabled (`camera=(), microphone=(), geolocation=()`).
- **Clickjacking Protection**: `frame-ancestors 'none'` and `X-Frame-Options: DENY`.
- **Server Fingerprint Scrubbing**: `X-Powered-By` header completely removed.

### C. Input Validation, Sanitization & Safe Output
- **Server-Side Validation**: All incoming fields validated via `express-validator` with strict type checks and max-length constraints (e.g., details capped at 2,000 characters).
- **Parameter Striping**: Unexpected and arbitrary fields rejected or ignored.
- **SQL Injection Prevention**: 100% of database queries execute through parameterized SQLite statements via `better-sqlite3`. No string concatenation.
- **Safe Markdown Rendering**: Server-side blog rendering through strict HTML entity encoding with no `eval()` or unvetted scripts.

### D. Anti-Spam & Anti-Abuse Controls
- **Hidden Honeypot Fields**: Trap bot submissions silently returning faux 200 OK without creating database records or triggering mailers.
- **Minimum Submission Fill-Time**: Rejects sub-3-second submissions from fast automated headless scrapers.
- **Multi-Tier Rate Limiting**:
  - Global IP limiter: 250 requests per 15 minutes.
  - Form submission limiter: 5 requests per 10 minutes per IP.
  - Admin login limiter: 5 attempts per 15 minutes with exponential lockout delay.
- **Cloudflare Turnstile Support**: Plug-and-play CAPTCHA validation via `TURNSTILE_SITE_KEY` and `TURNSTILE_SECRET`.

### E. Admin Authentication & Session Security
- **Configurable Secret Admin Path**: Admin path can be mapped to an obscure route (e.g. `/studio-hq-77`) via `ADMIN_ROUTE_PATH`.
- **Timing-Attack Resistance**: Authentication password checks execute using `crypto.timingSafeEqual()`.
- **Stateless HMAC Sessions**: Encrypted cookie (`ak_admin_session`) with `HttpOnly`, `Secure`, and `SameSite=Lax` flags, 24-hour expiration, and session re-issue on login.
- **Noindex Protection**: All admin endpoints respond with `X-Robots-Tag: noindex, nofollow` and are disallow-listed in `robots.txt`.
- **Privacy IP Anonymization**: IP addresses are irreversibly hashed using SHA-256 with a secret salt before storage (`hashIp`).

### F. Disaster Recovery & Backups
- **Automated SQLite Database Backups**: Automatic snapshot routine copying `data/app.db` to `backups/app-backup-YYYY-MM-DD.db` with a strict 14-day automated retention cleanup.
- **Health Check Endpoint**: `/healthz` endpoint returning `{ status: 'ok', uptime: ..., timestamp: ... }` without leaking sensitive architecture details.

---

## 2. Server Administrator Configuration Checklist (Prior to Launch)

Before pointing public DNS to your production server:

- [ ] **Generate Strong Secrets in `.env`**:
  ```bash
  # Generate 64-character random hexadecimal secrets
  node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
  ```
  Update `ADMIN_PASSWORD` and `SESSION_SECRET` with fresh, unique keys.
- [ ] **Set `NODE_ENV=production`**:
  Ensures cookies require HTTPS, enables production caching, and disables dev error logs.
- [ ] **Verify SQLite File Permissions**:
  ```bash
  chmod 700 ./data
  chmod 600 ./data/app.db
  ```
- [ ] **Verify Backup Cron or Process**:
  Confirm the backup folder (`./backups`) is writeable by the Node process and excluded from public static serving.
- [ ] **Verify `security.txt`**:
  Ensure `/.well-known/security.txt` correctly lists your security contact email (`AKdigitalstudio.org@gmail.com`).
