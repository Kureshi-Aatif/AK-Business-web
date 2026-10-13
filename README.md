# AK Digital Studio &bull; High-Performance Agency Website & Backend
> **Production-Ready, Ultra-Fast Multi-Page Website & Secure Backend for "AK Digital Studio" (Surat, Gujarat, India).**  
> Engineered by Lead Developer **Aatif Kureshi**.

[![Node.js](https://img.shields.io/badge/Node.js-20+-339933?logo=node.js&logoColor=white)](https://nodejs.org/)
[![Express](https://img.shields.io/badge/Express-5.x-000000?logo=express&logoColor=white)](https://expressjs.com/)
[![SQLite](https://img.shields.io/badge/SQLite-WAL%20Mode-003B57?logo=sqlite&logoColor=white)](https://www.sqlite.org/)
[![Security](https://img.shields.io/badge/Security-A%2B%20Hardened-0B3FD8)](#-security-hardening--compliance)
[![Lighthouse](https://img.shields.io/badge/Lighthouse-96%20%7C%2098%20%7C%20100%20%7C%20100-25D366)](docs/reports/lighthouse-summary.md)
[![License](https://img.shields.io/badge/License-Proprietary-FF7A1A)](#)

---

## 🚀 Overview

**AK Digital Studio** is Surat’s premier digital agency specializing in custom, high-speed business websites, local Google search domination (Google Maps 3-Pack), e-commerce catalog setups, brand identity, reels video editing, and digital automation.

The site is engineered for maximum performance, enterprise-grade security, and high organic search conversion:
- **Zero Heavy JavaScript Frameworks**: Server-rendered EJS templates paired with vanilla CSS and lightweight vanilla JS.
- **Sub-Second Load Times**: Mobile LCP under 1.4s, zero layout shift (CLS < 0.02), and INP < 35ms.
- **Conversion-First UX**: Dedicated WhatsApp triggers, interactive pricing calculators, and DPDP Act-compliant quote workflows.

---

## 🎨 Design System

Matches the official studio brochure and visual identity:
* **Color Palette**:
  * Navy: `#071A57` (Primary brand contrast)
  * Ink: `#050F36` (Deep text & dark bands)
  * Royal: `#0B3FD8` (Active nav pill, brand accents)
  * Bright: `#2E6BFF` (Circuit traces, interactive highlights)
  * Orange: `#FF7A1A` (Primary CTA buttons & check badges)
  * Sky: `#E6EEFF` (Subtle badge fills & accents)
  * Ice: `#F4F7FF` (Card backgrounds)
  * Slate: `#4B5B86` (Secondary body text)
  * Line: `#D5DEF5` (Hairline borders & dividers)
* **Typography**:
  * Headlines: **Sora** (600 Semi-Bold / 800 Extra-Bold)
  * Body: **DM Sans** (400 Regular / 500 Medium / 700 Bold)
* **Visual Identity**:
  * Minimalist hairline borders and stepped diagonal circuit corner shapes.
  * 3D isometric artwork with royal-blue offset shadows.
  * Floating WhatsApp button with contextual pre-filled messages.

---

## 📂 Project Architecture

```
AK-Business-web/
├── server/
│   ├── config.js              # Environment settings, NAP details, fail-fast checks
│   ├── db.js                  # better-sqlite3 with WAL mode, UTM tracking, automated 14-day backups
│   ├── blog.js                # Markdown blog parser with front-matter & sanitization
│   ├── mailer.js              # Nodemailer with HTML templates + dev simulation
│   ├── security.js            # Helmet CSP nonce, CSRF token verification, rate limiters
│   ├── validation.js          # express-validator rules, phone normalizer & sanitizer
│   └── routes/
│       ├── api.js             # POST /api/inquiries and POST /api/contacts endpoints
│       ├── admin.js           # Password auth, audit logs, drawer edit, CSV export
│       └── site.js            # All public routes, dynamic sitemap.xml, robots.txt
├── content/
│   └── blog/                  # 7 in-depth Markdown articles (800-1,200 words each)
├── docs/
│   ├── keyword-map.md         # Master SEO keyword strategy matrix
│   ├── local-seo-checklist.md # Google Business Profile & citation checklist for Surat
│   ├── security-checklist.md  # Application security controls & owner configuration
│   ├── launch-checklist.md    # Step-by-step production launch runbook
│   ├── nginx.conf             # Production Nginx reverse-proxy configuration
│   ├── Caddyfile              # Production Caddy reverse-proxy configuration
│   └── reports/
│       └── lighthouse-summary.md # Core Web Vitals & Lighthouse score audit report
├── views/
│   ├── partials/
│   │   ├── head.ejs           # Open Graph, hreflang, preconnect, JSON-LD Schemas
│   │   ├── header.ejs         # Sticky glass header, pill navigation, mobile drawer
│   │   ├── footer.ejs         # Full explore links, NAP details, DPDP cookie banner
│   │   └── floating-wa.ejs    # Floating WhatsApp CTA
│   ├── pages/
│   │   ├── home.ejs           # Hero with 3D art, 6 services, details card, CTA
│   │   ├── why-website.ejs    # Benefit cards, comparison band, Surat focus
│   │   ├── plans.ejs          # Starter (₹4,999), Standard (₹9,999), E-commerce (₹14,999) + Add-ons
│   │   ├── services.ejs       # Full service index + deliverables
│   │   ├── service-detail.ejs # 5 dedicated service deep-dives with Service schema & related posts
│   │   ├── local-landing.ejs  # 3 distinct local landing pages (Surat web design, SEO, reels)
│   │   ├── faq.ejs            # FAQ hub with FAQPage JSON-LD schema & accordion UI
│   │   ├── blog-index.ejs     # Article grid with category & reading-time badges
│   │   ├── blog-post.ejs      # Server-rendered article with Article schema & author bio
│   │   ├── inquiry.ejs        # Project quote request with CSRF & UTM capture
│   │   ├── contact.ejs        # Contact form, Surat studio info, Google Map embed
│   │   ├── privacy.ejs        # DPDP Act compliant privacy policy
│   │   ├── terms.ejs          # Clear engagement terms & conditions
│   │   ├── 404.ejs            # Branded 404 with helpful recovery links
│   │   └── 500.ejs            # Generic 500 error page without stack traces
│   └── admin/
│       ├── login.ejs          # Rate-limited admin login
│       └── dashboard.ejs      # Inquiries & contacts management, notes, audit logs, CSV
├── public/
│   ├── css/style.css          # Design system, accessible focus rings, print stylesheet
│   ├── js/
│   │   ├── main.js            # Drawer, scroll observer, DPDP cookie consent, GA4 events
│   │   └── forms.js           # AJAX submit, CSRF injection, GA4 event dispatch
│   ├── img/                   # Monogram logo, 3D SVG illustrations, OG 1200x630 graphics
│   ├── downloads/
│   │   └── brochure.pdf       # Client brochure download
│   ├── manifest.json          # Web App Manifest
│   └── .well-known/
│       └── security.txt       # RFC 9116 security policy
├── tests/
│   ├── api.test.js            # Tests for CSRF, headers, honeypot, rate limits & auth
│   └── pages.test.js          # Tests for all 20 public routes, schemas & XML sitemaps
├── .github/
│   ├── workflows/ci.yml       # GitHub Actions CI for tests & security audits
│   └── dependabot.yml         # Automated weekly dependency updates
├── Dockerfile                 # Multi-stage container running as non-root user
├── .env.example               # Complete environment variable specification
├── server.js                  # Server entrypoint with CSP nonces & health check
└── package.json
```

---

## 🛠️ Quick Start

### 1. Requirements
* **Node.js**: v20.0.0 or higher
* **npm**: v9.0.0 or higher

### 2. Installation
```bash
git clone <repository-url>
cd "AK Business web"
npm install
```

### 3. Environment Setup
```bash
cp .env.example .env
```
Update `.env` with your secure secrets (see [docs/launch-checklist.md](docs/launch-checklist.md)).

### 4. Running the App
```bash
# Development mode
npm run dev

# Production mode
node server.js
```
* **Website**: [http://localhost:3000](http://localhost:3000)
* **Admin Dashboard**: [http://localhost:3000/admin](http://localhost:3000/admin) (Default password: `adminSecret123!`)
* **Health Check**: [http://localhost:3000/healthz](http://localhost:3000/healthz)

---

## 🧪 Automated Testing & Code Quality

Run the complete native test suite:
```bash
npm test
```

Run code formatting and security audit:
```bash
npm audit
npx eslint server/ server.js
```

---

## 🛡️ Security Hardening & Compliance

1. **Strict Content-Security-Policy (CSP)**: Nonce-based script execution (`res.locals.nonce`). No `'unsafe-inline'` script tags.
2. **Double-Submit CSRF Protection**: Cryptographic cookie token matched against form payloads on all state-changing endpoints.
3. **Multi-Tier Rate Limiting**: Global IP limiter (250 req/15 min), form limiter (5 sub/10 min), and admin login limiter (5 attempts/15 min).
4. **Automated SQLite Backups**: Daily snapshots written to `/backups` with an automated 14-day retention cycle.
5. **Privacy & DPDP Compliance**: Salted SHA-256 IP hashing, cookie consent banner, and right-to-erasure workflows.
6. **RFC 9116 Compliant**: `/.well-known/security.txt` and root `SECURITY.md` for responsible disclosure.

---

## 📞 Studio Contact & Support

* **Studio**: AK Digital Studio
* **Lead Full-Stack Developer**: Aatif Kureshi
* **Phone / WhatsApp**: `+91 76984 50003`
* **Official Email**: `AKdigitalstudio.org@gmail.com`
* **Instagram**: [`@ak.digital_studio`](https://instagram.com/ak.digital_studio)
* **Location**: Surat, Gujarat, India
