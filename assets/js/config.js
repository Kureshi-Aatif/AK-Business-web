/**
 * AK Digital Studio - Frontend API Configuration
 * 
 * For Cloudflare Pages: API_BASE_URL is left empty ('') to use same-origin Pages Functions (/api/*).
 * For GitHub Pages: Set API_BASE_URL to your deployed Cloudflare Worker URL, e.g.:
 *   export const API_BASE_URL = 'https://ak-digital-api.YOUR-SUBDOMAIN.workers.dev';
 * If API_BASE_URL is empty and running on GitHub Pages (or backend unavailable),
 * the forms gracefully fall back to pre-filled WhatsApp and mailto links.
 */

export const API_BASE_URL = '';

export const SITE_CONFIG = {
  phoneDisplay: '+91 76984 50003',
  phoneRaw: '7698450003',
  whatsappNumber: '917698450003',
  email: 'AKdigitalstudio.org@gmail.com',
  turnstileSiteKey: '' // Cloudflare Turnstile Site Key (if enabled)
};
