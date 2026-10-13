# AK Digital Studio — Production Launch Checklist

Follow this sequential checklist to launch `akdigitalstudio.com` seamlessly with peak performance, SEO authority, and zero downtime.

---

## 1. Domain & DNS Configuration
- [ ] **DNS Records Setup**:
  - `A` Record: `@` pointing to server IPv4 address.
  - `AAAA` Record: `@` pointing to server IPv6 address (if available).
  - `CNAME` Record: `www` pointing to `akdigitalstudio.com`.
  - `CAA` Record: Issue authority restricted to Let's Encrypt / DigiCert.
- [ ] **Canonical Host Unification**:
  - Ensure all `http://` traffic redirects to `https://`.
  - Ensure all `www.akdigitalstudio.com` requests redirect to `https://akdigitalstudio.com` (301 Permanent).

---

## 2. Environment & Secrets Setup
- [ ] Create production `.env` using `.env.example` as reference:
  ```env
  PORT=3000
  NODE_ENV=production
  SITE_URL=https://akdigitalstudio.com
  ADMIN_PASSWORD="<STRONG_COMPLEX_PASSWORD_MIN_16_CHARS>"
  SESSION_SECRET="<SECURE_RANDOM_SECRET_64_CHARS>"
  ADMIN_ROUTE_PATH="/admin"
  BUSINESS_PHONE="+91 76984 50003"
  BUSINESS_EMAIL="AKdigitalstudio.org@gmail.com"
  WHATSAPP_NUMBER="+917698450003"
  INSTAGRAM_HANDLE="ak.digital_studio"
  PORTFOLIO_URL="https://drive.google.com/drive/folders/1rVIyFGmlAZ6Q309xKHGT4LxL0HUl6ej4?usp=drive_link"
  GOOGLE_REVIEW_URL="https://g.page/r/your-google-profile-id/review"
  GA_ID="G-XXXXXXXXXX"
  GSC_VERIFICATION="google-site-verification-token"
  BING_VERIFICATION="bing-site-verification-token"
  ```
- [ ] Verify `npm audit` yields **0 vulnerabilities**.

---

## 3. Google Search Console & Bing Webmaster Setup
- [ ] **Google Search Console**:
  1. Add domain property `akdigitalstudio.com`.
  2. Verify ownership via DNS TXT record or HTML meta tag (`GSC_VERIFICATION` in `.env`).
  3. Submit primary XML sitemap: `https://akdigitalstudio.com/sitemap.xml`.
  4. Test URL inspection on `/`, `/plans`, `/services`, `/website-design-surat`.
  5. Check for 0 crawl errors, mobile usability passes, and valid schema markups.
- [ ] **Bing Webmaster Tools**:
  1. Import verified Google Search Console account for instant setup.
  2. Verify XML sitemap submission.

---

## 4. Google Analytics 4 (GA4) & Tracking Setup
- [ ] Configure GA4 Data Stream for Web (`https://akdigitalstudio.com`).
- [ ] Add Measurement ID to `GA_ID` in `.env`.
- [ ] Confirm Consent Mode v2: Analytics only triggers after the visitor clicks **Accept** on the cookie banner.
- [ ] Verify custom conversion events fire in GA4 DebugView:
  - `inquiry_submit` (Triggers on quote request success)
  - `contact_submit` (Triggers on general contact success)
  - `whatsapp_click` (Triggers when user clicks floating or card WhatsApp CTA)
  - `phone_click` (Triggers on direct phone call clicks)
  - `plan_choose` (Captures plan name: Starter, Standard, E-commerce)
  - `service_enquire` (Captures service name)

---

## 5. Google Business Profile (GBP) Activation
- [ ] Complete profile at https://business.google.com with exact business details:
  - **Name**: `AK Digital Studio`
  - **Category**: `Website Designer`
  - **Address**: Surat, Gujarat 395003
  - **Phone**: `+91 76984 50003`
  - **Website**: `https://akdigitalstudio.com?utm_source=google&utm_medium=organic&utm_campaign=gbp_listing`
- [ ] Upload real office photos, team photos, and brand logo.
- [ ] Add the 3 core plans in the "Products" tab with prices (₹4,999, ₹9,999, ₹14,999).

---

## 6. Database Backups & Process Supervision
- [ ] Ensure process runs under PM2, Docker, or systemd:
  ```bash
  # PM2 Example
  pm2 start server.js --name "ak-studio" --env production
  pm2 save
  pm2 startup
  ```
- [ ] Verify automated backups run daily into `/backups` and old files (>14 days) are pruned.
- [ ] Test the health check endpoint: `curl -I https://akdigitalstudio.com/healthz` (Expect `200 OK`).

---

## 7. Performance & Core Web Vitals Final Check
- [ ] Run Lighthouse mobile audit on production URL.
- [ ] Confirm:
  - Performance: 95+
  - Accessibility: 95+
  - Best Practices: 95+
  - SEO: 100
- [ ] Verify sub-second TTFB and zero layout shift (CLS < 0.05).
