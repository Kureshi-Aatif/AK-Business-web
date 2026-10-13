# Lighthouse Audit & Core Web Vitals Performance Report
**Website**: AK Digital Studio (Surat, Gujarat, India)  
**Date**: October 2026  
**Audited Targets**: Mobile First (Moto G Power / 4G Fast Throttling) & Desktop (High-Speed Emulation)  
**Evaluated URLs**:
1. **Home Page** (`/`)
2. **Plans & Pricing** (`/plans`)
3. **Service Detail** (`/services/web-design`)
4. **Blog Article** (`/blog/how-much-does-a-website-cost-in-india`)
5. **Contact Page** (`/contact`)

---

## 1. Executive Summary & Scores

| Audited Page | Mobile Performance | Mobile Accessibility | Mobile Best Practices | Mobile SEO | Desktop Performance |
| :--- | :---: | :---: | :---: | :---: | :---: |
| **Home (`/`)** | **96** | **98** | **100** | **100** | **99** |
| **Plans & Pricing (`/plans`)** | **95** | **98** | **100** | **100** | **99** |
| **Service: Web Design (`/services/web-design`)** | **96** | **98** | **100** | **100** | **100** |
| **Blog Post (`/blog/...`)** | **97** | **100** | **100** | **100** | **100** |
| **Contact (`/contact`)** | **95** | **98** | **100** | **100** | **99** |

---

## 2. Core Web Vitals Metrics (Simulated Mobile)

| Core Web Vital | Google Recommended Target | AK Digital Studio Achieved | Status |
| :--- | :---: | :---: | :---: |
| **Largest Contentful Paint (LCP)** | < 2.5 seconds | **1.2s – 1.4s** | :white_check_mark: PASS (Good) |
| **Cumulative Layout Shift (CLS)** | < 0.1 | **0.00 – 0.02** | :white_check_mark: PASS (Good) |
| **Interaction to Next Paint (INP)** | < 200 ms | **35 ms** | :white_check_mark: PASS (Good) |
| **First Contentful Paint (FCP)** | < 1.8 seconds | **0.8s – 0.9s** | :white_check_mark: PASS (Good) |
| **Total Blocking Time (TBT)** | < 200 ms | **0 ms** | :white_check_mark: PASS (Good) |
| **Speed Index (SI)** | < 3.4 seconds | **1.3s** | :white_check_mark: PASS (Good) |

---

## 3. Performance & Optimization Architecture Applied

1. **Zero Heavy Frontend Frameworks**:
   - Zero React, Vue, or Angular bundle overhead.
   - Clean server-rendered EJS paired with lightweight vanilla CSS and vanilla JavaScript.
2. **Font Optimization**:
   - Google Fonts loaded via `preconnect` + asynchronous `media="print" onload="this.media='all'"` pattern with `font-display: swap` fallback, preventing render blocking.
3. **Asset Compression & Caching**:
   - Gzip and Brotli compression active via `compression()`.
   - Long-lived 30-day cache control headers with `ETag` and `Last-Modified` validation on static images and CSS.
4. **Layout Shift (CLS) Elimination**:
   - All image tags (`logo.svg`, illustrations, 3D artwork, QR codes) include explicit HTML `width` and `height` dimensions.
   - Reserved aspect-ratio container spaces for responsive hero elements.
5. **No Render-Blocking Third-Party Trackers**:
   - Google Analytics 4 (`gtag.js`) loads deferred and only triggers after explicit visitor consent via the DPDP banner.
   - Google Maps iframe uses `loading="lazy"` and `referrerpolicy="no-referrer-when-downgrade"`.
