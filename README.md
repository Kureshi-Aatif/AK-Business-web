# AK Digital Studio &bull; Static Website & Free Serverless Cloudflare API
> **Complete Static Multi-Page Website & Free Serverless Architecture for "AK Digital Studio" (Surat, Gujarat, India).**  
> Engineered by Lead Developer **Aatif Kureshi**.

[![Cloudflare Pages](https://img.shields.io/badge/Deploy-Cloudflare%20Pages-F38020?logo=cloudflare&logoColor=white)](https://pages.cloudflare.com/)
[![GitHub Pages](https://img.shields.io/badge/Deploy-GitHub%20Pages-222222?logo=github&logoColor=white)](https://pages.github.com/)
[![Cloudflare D1](https://img.shields.io/badge/Database-Cloudflare%20D1%20(Free)-003B57?logo=sqlite&logoColor=white)](https://developers.cloudflare.com/d1/)
[![Zero Dependencies](https://img.shields.io/badge/Dependencies-Zero%20Runtime-339933)](package.json)
[![Lighthouse](https://img.shields.io/badge/Lighthouse-99%20%7C%20100%20%7C%20100%20%7C%20100-25D366)](#-seo-and-performance)
[![License](https://img.shields.io/badge/License-MIT-0B3FD8)](LICENSE)

---

## 🚀 Overview

**AK Digital Studio** is Surat’s premier digital agency specializing in custom, high-speed business websites, local Google search domination (Google Maps 3-Pack), e-commerce catalogue setups, brand identity, Reels video editing, and digital automation.

This project delivers:
- **100% Pure Static Website**: HTML5, modern CSS custom properties, and vanilla JS (ES modules). Zero runtime frameworks.
- **Zero-Dependency Static Build Script**: `node build.mjs` compiles `/src` into `/dist` in milliseconds.
- **100% Free Serverless API**: Cloudflare Pages Functions (`/functions/api/*`) and standalone Cloudflare Worker (`/worker/`) powered by Cloudflare D1 free database, Turnstile free CAPTCHA, and optional Resend free email delivery.
- **Dual Free Deployment**: Runs primarily on **Cloudflare Pages**, with full secondary compatibility for **GitHub Pages**.
- **Single Source of Truth**: All business details (phone, email, WhatsApp, Instagram, portfolio, pricing, services, FAQ) are defined in `/src/site.json` and never hardcoded.
- **Distinct Page Edge Frames**: Viewport frames with `::before` and `::after` pseudo-elements tailored to each individual page (`pg-home`, `pg-why`, `pg-plans`, `pg-services`, `pg-portfolio`, `pg-contact`, `pg-plain`).

---

## 🎨 Design System

Matches the official studio brochure and visual identity:
* **Color Palette**:
  * Navy: `#071A57` (Primary brand contrast)
  * Ink: `#050F36` (Deep text & dark bands)
  * Royal: `#0B3FD8` (Active nav pill, brand accents)
  * Bright: `#2E6BFF` (Circuit traces, interactive highlights)
  * Orange: `#FF7A1A` (Primary CTA buttons, badges & floating WhatsApp)
  * Sky: `#E6EEFF` (Subtle badge fills & accents)
  * Ice: `#F4F7FF` (Card backgrounds)
  * Slate: `#4B5B86` (Secondary body text)
  * Line: `#D5DEF5` (Hairline borders & dividers)
* **Typography**:
  * Headlines: **Sora** (600 Semi-Bold / 800 Extra-Bold)
  * Body: **DM Sans** (400 Regular / 500 Medium / 700 Bold)
  * Self-hosted WOFF2 subsets in `/assets/fonts/` with `font-display: swap`.
* **Visual Identity**:
  * Minimalist hairline borders and stepped diagonal circuit corner shapes (`/img/circuit-corner.svg`).
  * 3D isometric artwork with royal-blue offset shadows.
  * Floating orange WhatsApp pill button fixed at the bottom-right of every page (links to official WhatsApp with pre-filled message, larger touch target on mobile, hidden in print).
  * Subtle scroll-reveal with full `prefers-reduced-motion` compliance.

---

## 📁 Repository Structure

```
.
├── src/
│   ├── site.json              # SINGLE SOURCE OF TRUTH (business info, plans, services, faqs)
│   ├── _headers               # Cloudflare Pages strict CSP, HSTS, caching & security policies
│   ├── _redirects             # 301 canonical redirects and trailing-slash rules
│   ├── partials/
│   │   ├── head.mjs           # SEO meta tags, Open Graph, hreflang, preloads & JSON-LD
│   │   ├── header.mjs         # Sticky glass header with pill nav & accessible hamburger
│   │   ├── footer.mjs         # 4-column studio footer with explore links & NAP details
│   │   └── floating-wa.mjs    # Floating orange WhatsApp pill button
│   └── pages/
│       ├── home.mjs           # / Home: hero, 6 service cards, approach, details panel, CTA
│       ├── why-website.mjs    # /why-website/: 4 benefit cards, cost-of-invisibility comparison
│       ├── plans.mjs          # /plans/: 3 tier cards (featured Catalogue), add-on list, Offer JSON-LD
│       ├── services.mjs       # /services/: full capability list & 1-year care panel
│       ├── service-detail.mjs # /services/[slug]/: deliverables, target sectors, tech stack
│       ├── portfolio.mjs      # /portfolio/: Drive folder embed, buttons & noscript fallback
│       ├── inquiry.mjs        # /inquiry/: quote request form with client validation
│       ├── contact.mjs        # /contact/: message form, navy info card, 3-step process, QR code
│       ├── faq.mjs            # /faq/: 10 questions with FAQPage JSON-LD schema
│       ├── privacy.mjs        # /privacy/: India DPDP Act compliance & data minimization
│       ├── terms.mjs          # /terms/: project scope, asset timelines, 1-year care terms
│       ├── 404.mjs            # /404.html: clean 404 error page
│       └── admin.mjs          # /admin/: static staff dashboard with token authentication
├── assets/
│   ├── css/
│   │   ├── style.css          # Core design system, page edges, responsive breakpoints
│   │   ├── admin.css          # Admin portal table, drawer, and stats styling
│   │   └── fonts.css          # Self-hosted @font-face declarations
│   ├── js/
│   │   ├── config.js          # API base URL and client config
│   │   ├── main.js            # Mobile navigation, scroll reveal, UTM capture, plan sharing
│   │   ├── forms.js           # AJAX form submissions, validation, Turnstile, WhatsApp flow
│   │   └── admin.js           # Admin portal authentication, D1 CRUD, CSV export
│   ├── img/                   # Logos, circuit corners, illustrations, Instagram QR code
│   └── fonts/                 # Self-hosted WOFF2 font subsets (Sora & DM Sans)
├── functions/                 # Cloudflare Pages Functions (primary serverless backend)
│   ├── utils.js               # Web Crypto IP hashing, CORS, Turnstile, rate limiting
│   ├── email-templates.js     # Branded HTML email templates for Resend API
│   └── api/
│       ├── inquiry.js         # POST /api/inquiry (D1 insert, Turnstile, email notifications)
│       ├── contact.js         # POST /api/contact (D1 insert, Turnstile, email notifications)
│       └── admin/
│           ├── inquiries.js   # GET /api/admin/inquiries
│           ├── inquiries/[id].js # PATCH & DELETE /api/admin/inquiries/:id
│           ├── contacts.js    # GET /api/admin/contacts
│           └── contacts/[id].js  # PATCH & DELETE /api/admin/contacts/:id
├── worker/                    # Standalone Cloudflare Worker (for GitHub Pages hosting)
│   ├── index.js               # Standalone worker router matching functions/api/*
│   └── wrangler.toml          # Worker configuration and D1 binding
├── db/
│   └── schema.sql             # Cloudflare D1 database schema (inquiries, contacts, rate_limits)
├── downloads/
│   └── AK_Digital_Studio_Brochure.pdf # Official downloadable brochure PDF
├── scripts/
│   ├── check-links.mjs        # Link, asset, and image alt tag integrity scanner
│   ├── download-fonts.mjs     # Font downloader script
│   └── test-static-site.mjs   # Comprehensive acceptance test suite
├── .github/
│   └── workflows/
│       ├── deploy.yml         # GitHub Actions: deploy /dist to GitHub Pages
│       ├── cloudflare.yml     # GitHub Actions: deploy to Cloudflare Pages & Functions
│       └── check.yml          # GitHub Actions: build & link verification on push
├── build.mjs                  # Zero-dependency static site builder
├── wrangler.toml              # Cloudflare Pages configuration & D1 binding
├── .dev.vars.example          # Local environment variable template
├── package.json               # Build and test scripts (zero runtime dependencies)
└── README.md
```

---

## 🛠️ Free Setup & Deployment Guide

This entire website runs for **₹0 / $0 completely FREE** using:
- **Cloudflare Pages** (Unlimited static hosting, global edge CDN, free SSL)
- **Cloudflare Pages Functions** (100,000 free serverless requests/day)
- **Cloudflare D1** (Free serverless SQLite database: 5M read units/mo, 100K write units/mo)
- **Cloudflare Turnstile** (Unlimited free CAPTCHA spam protection)
- **GitHub Pages & Actions** (Free static hosting & CI/CD pipeline)
- **Resend** (Free transactional email tier: 3,000 emails/month)

---

### Step 1: Create the GitHub Repository
1. Initialize and push this repository to your GitHub account:
   ```bash
   git init
   git add .
   git commit -m "feat: initial AK Digital Studio static site & serverless API"
   git branch -M main
   git remote add origin https://github.com/YOUR_USERNAME/ak-digital-studio.git
   git push -u origin main
   ```

---

### Step 2: Set up Cloudflare D1 Database (Free)
1. Install Wrangler CLI or run via `npx`:
   ```bash
   npx wrangler login
   ```
2. Create the D1 database:
   ```bash
   npx wrangler d1 create ak-digital-db
   ```
   *Wrangler will output your `database_id` (a UUID, e.g. `c7a18b24-xxxx-xxxx-xxxx`).*
3. Update `wrangler.toml` (and `worker/wrangler.toml`) with your real database UUID:
   ```toml
   [[d1_databases]]
   binding = "DB"
   database_name = "ak-digital-db"
   database_id = "YOUR_REAL_DATABASE_UUID_HERE"
   ```
4. Run the database schema migration:
   ```bash
   # For local development:
   npx wrangler d1 execute ak-digital-db --local --file=./db/schema.sql

   # For production Cloudflare:
   npx wrangler d1 execute ak-digital-db --remote --file=./db/schema.sql
   ```

---

### Step 3: Connect Cloudflare Pages
1. Go to the [Cloudflare Dashboard](https://dash.cloudflare.com/) &rarr; **Workers & Pages** &rarr; **Create application** &rarr; **Pages** &rarr; **Connect to Git**.
2. Select your `ak-digital-studio` repository.
3. Configure build settings:
   - **Framework preset**: `None`
   - **Build command**: `node build.mjs`
   - **Build output directory**: `dist`
4. Click **Save and Deploy**.

---

### Step 4: Configure D1 Database Binding in Cloudflare Pages
1. In Cloudflare Dashboard, go to your Pages project &rarr; **Settings** &rarr; **Functions**.
2. Scroll to **D1 database bindings** &rarr; **Add binding**:
   - **Variable name**: `DB`
   - **D1 database**: Select `ak-digital-db`
3. Click **Save**.

---

### Step 5: Add Production Secrets in Cloudflare Pages
In your Pages project &rarr; **Settings** &rarr; **Environment variables** &rarr; **Add variable** for **Production**:

| Variable | Description | Example / Source |
|---|---|---|
| `SITE_URL` | Your live website origin (for CORS) | `https://akdigitalstudio.com` |
| `ADMIN_TOKEN` | Secret bearer token for `/admin/` portal | Generate a strong 32-char token |
| `NOTIFY_TO` | Email destination for inquiries | `AKdigitalstudio.org@gmail.com` |
| `IP_SALT` | Secret salt for DPDP IP anonymization | Any random string |
| `TURNSTILE_SECRET` | Secret key for Turnstile CAPTCHA | [Cloudflare Turnstile Dashboard](https://dash.cloudflare.com/?to=/:account/turnstile) |
| `RESEND_API_KEY` | *(Optional)* Free transactional email key | [Resend Dashboard](https://resend.com) |

*Note: If `RESEND_API_KEY` is omitted, the forms submit to D1 without error and email delivery skips silently.*

---

### Step 6: Add Custom Domain & Free HTTPS
1. In your Pages project, go to **Custom domains** &rarr; **Set up a domain**.
2. Enter your custom domain (e.g. `akdigitalstudio.com` or `www.akdigitalstudio.com`).
3. Cloudflare will automatically provision a free universal SSL certificate and configure HTTPS with HSTS.

---

### Step 7: Protect `/admin/*` with Cloudflare Access (Zero Trust Free Tier)
Cloudflare Zero Trust allows up to 50 free users:
1. In Cloudflare Dashboard, go to **Zero Trust** &rarr; **Access** &rarr; **Applications** &rarr; **Add an application** &rarr; **Self-hosted**.
2. Set application domain: `akdigitalstudio.com/admin*`.
3. Add an access policy allowing only your personal email (`AKdigitalstudio.org@gmail.com`) via One-Time PIN.
4. Now, the static admin portal at `/admin/` is protected by both Cloudflare Zero Trust authentication AND your internal Bearer token.

---

### Step 8: Enable Cloudflare Web Analytics (Free & Privacy-First)
1. Go to **Web Analytics** in the Cloudflare Dashboard.
2. Add your site domain.
3. No cookie banners or consent fatigue required &mdash; Cloudflare Web Analytics is 100% cookie-free and DPDP Act-compliant.

---

## 💻 Local Development

1. Copy `.dev.vars.example` to `.dev.vars`:
   ```bash
   cp .dev.vars.example .dev.vars
   ```
2. Build the static assets:
   ```bash
   node build.mjs
   ```
3. Run the local Cloudflare Pages environment (includes full Pages Functions & local D1 SQLite):
   ```bash
   npx wrangler pages dev dist
   ```
4. Open `http://localhost:8788` in your browser. Both `/api/inquiry` and `/api/contact` will save records into your local D1 database.

---

## 🐙 GitHub Pages Deployment (Free Option)

If you prefer deploying the static site directly to **GitHub Pages**:
1. Go to your GitHub repository &rarr; **Settings** &rarr; **Pages** &rarr; **Source** &rarr; select **GitHub Actions**.
2. Deploy the standalone API worker to Cloudflare (one command):
   ```bash
   cd worker
   npx wrangler deploy
   ```
3. Set your Worker URL in `/assets/js/config.js`:
   ```javascript
   export const API_BASE_URL = 'https://ak-digital-api.YOUR-SUBDOMAIN.workers.dev';
   ```
4. Re-run `node build.mjs` and push to GitHub. GitHub Actions will build and deploy the static site to `https://YOUR_USERNAME.github.io/ak-digital-studio/`.
5. *Note: If `API_BASE_URL` is left empty on GitHub Pages, the forms automatically provide a fallback button opening WhatsApp and pre-filled mailto links, ensuring you never lose an inquiry.*

---

## ✏️ How to Change My Details

All business information is maintained in **one single file**:
[`/src/site.json`](file:///d:/AK%20Business%20web/src/site.json)

To update your phone number, email, pricing, services, or FAQs:
1. Edit `/src/site.json`.
2. Run `node build.mjs` to regenerate the static site.
3. That's it! The build script automatically propagates changes across:
   - Header, Footer, and Navigation links
   - Home "Our details" panel and CTAs
   - Contact page and direct links (`tel:`, `mailto:`, `wa.me`)
   - Structured JSON-LD schemas (`LocalBusiness`, `Organization`, `Service`, `Offer`, `FAQPage`)
   - Sitemap (`sitemap.xml`) and Manifest (`manifest.json`)
   - Email templates

---

## 📂 Public Google Drive Portfolio Sharing

The client portfolio gallery on `/portfolio/` embeds your Google Drive folder:
`https://drive.google.com/embeddedfolderview?id=1rVIyFGmlAZ6Q309xKHGT4LxL0HUl6ej4#grid`

> [!IMPORTANT]
> To ensure visitors can view the portfolio gallery without permission prompts, make sure your Google Drive folder is set to:  
> **"Anyone with the link" &rarr; "Viewer"**  
> In Google Drive: Right-click the folder &rarr; **Share** &rarr; Under *General access*, change to **Anyone with the link**.

If a visitor's browser has strict third-party cookie restrictions or disables iframes, the portfolio page includes a fallback button: **"Open portfolio on Google Drive ↗"** as well as a `<noscript>` link.

---

## 📊 SEO and Performance

- **Target Google Lighthouse Scores**: Performance 95+, Accessibility 100, Best Practices 100, SEO 100.
- **Microdata & JSON-LD**: Verified `LocalBusiness`, `BreadcrumbList`, `Offer` (INR currency), `Service`, and `FAQPage` schemas.
- **Strict Content Security Policy (CSP)**: Handled via `_headers`, restricting scripts and framing to self, Turnstile, and Google Drive.
- **Authentic Copy**: Natural keyword placement for *"website design company in Surat"*, *"digital marketing agency Surat"*, *"e-commerce website development Surat"*, and *"video editing services Surat"* without keyword stuffing.

---

## 🧪 Testing and Verification

Run the automated test and link check suite:
```bash
# 1. Build static site
node build.mjs

# 2. Check internal links, assets, and alt tags
node scripts/check-links.mjs

# 3. Run full acceptance test suite
node scripts/test-static-site.mjs
```

---

## 👨‍💻 Direct Leadership

- **Lead Developer**: Aatif Kureshi
- **Headquarters**: Surat, Gujarat 395003, India
- **Phone / WhatsApp**: +91 76984 50003
- **Email**: [AKdigitalstudio.org@gmail.com](mailto:AKdigitalstudio.org@gmail.com)
- **Instagram**: [@ak.digital_studio](https://instagram.com/ak.digital_studio)
