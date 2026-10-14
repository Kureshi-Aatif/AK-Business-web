/**
 * Cloudflare Pages Functions & Worker Shared Utilities
 * Zero dependencies: Web Crypto, Fetch API, standard D1 calls
 */

export function getCorsHeaders(request, env) {
  const origin = request.headers.get('Origin') || '';
  const allowed = env.SITE_URL || '';
  
  // Allow matching origin, localhost, or same-origin
  let allowOrigin = allowed;
  if (!allowed || origin === allowed || origin.includes('localhost') || origin.includes('127.0.0.1') || origin.includes('pages.dev') || origin.includes('github.io')) {
    allowOrigin = origin || '*';
  }

  return {
    'Access-Control-Allow-Origin': allowOrigin,
    'Access-Control-Allow-Methods': 'GET, POST, PATCH, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With',
    'Access-Control-Max-Age': '86400'
  };
}

export function handleOptions(request, env) {
  return new Response(null, {
    status: 204,
    headers: getCorsHeaders(request, env)
  });
}

export async function hashIp(ip, salt = 'ak-salt') {
  if (!ip) return 'anonymous';
  const encoder = new TextEncoder();
  const data = encoder.encode(`${ip}-${salt}`);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('').slice(0, 32);
}

export function constantTimeCompare(a, b) {
  if (typeof a !== 'string' || typeof b !== 'string') return false;
  if (a.length !== b.length) return false;
  let result = 0;
  for (let i = 0; i < a.length; i++) {
    result |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return result === 0;
}

export function generateReference(prefix = 'INQ') {
  const year = new Date().getFullYear();
  const randomBytes = new Uint8Array(3);
  crypto.getRandomValues(randomBytes);
  const randomChars = Array.from(randomBytes).map(b => b.toString(16).padStart(2, '0')).join('').toUpperCase();
  return `${prefix}-${year}-${randomChars}`;
}

export function sanitize(str, maxLen = 2000) {
  if (str === null || str === undefined) return '';
  return String(str)
    .replace(/<[^>]*>/g, '') // Strip HTML tags
    .trim()
    .slice(0, maxLen);
}

export async function verifyTurnstile(token, secret, remoteIp) {
  if (!secret) return true; // Turnstile optional unless secret is configured
  if (!token) return false;

  try {
    const formData = new FormData();
    formData.append('secret', secret);
    formData.append('response', token);
    if (remoteIp) formData.append('remoteip', remoteIp);

    const res = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
      method: 'POST',
      body: formData
    });
    const outcome = await res.json();
    return outcome.success === true;
  } catch (e) {
    return false;
  }
}

export async function checkRateLimit(db, ipHash, limit = 10, windowSecs = 3600) {
  if (!db) return true; // If D1 not bound (e.g. mock), allow
  try {
    const now = Math.floor(Date.now() / 1000);
    // Cleanup expired
    await db.prepare('DELETE FROM rate_limits WHERE reset_at < ?').bind(now).run();

    const row = await db.prepare('SELECT count, reset_at FROM rate_limits WHERE key = ?').bind(ipHash).first();
    if (!row) {
      await db.prepare('INSERT INTO rate_limits (key, count, reset_at) VALUES (?, 1, ?)').bind(ipHash, now + windowSecs).run();
      return true;
    }

    if (row.count >= limit) {
      return false;
    }

    await db.prepare('UPDATE rate_limits SET count = count + 1 WHERE key = ?').bind(ipHash).run();
    return true;
  } catch (err) {
    // Fail-open for rate limiter on DB transient error
    return true;
  }
}

export async function sendEmail({ apiKey, to, subject, html }) {
  if (!apiKey) return;
  try {
    await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        from: 'AK Digital Studio <onboarding@resend.dev>',
        to: Array.isArray(to) ? to : [to],
        subject,
        html
      })
    });
  } catch (err) {
    console.error('Email delivery error (non-fatal):', err);
  }
}

export function jsonResponse(data, status = 200, corsHeaders = {}) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'Content-Type': 'application/json',
      ...corsHeaders
    }
  });
}
