import { getCorsHeaders, handleOptions, constantTimeCompare, jsonResponse } from '../../utils.js';

function authenticate(request, env) {
  const auth = request.headers.get('Authorization') || '';
  if (!auth.startsWith('Bearer ')) return false;
  const token = auth.slice(7).trim();
  const secret = env.ADMIN_TOKEN;
  if (!secret) return false;
  return constantTimeCompare(token, secret);
}

export async function onRequestOptions({ request, env }) {
  return handleOptions(request, env);
}

export async function onRequestGet({ request, env }) {
  const cors = getCorsHeaders(request, env);
  if (!authenticate(request, env)) {
    return jsonResponse({ ok: false, error: 'Unauthorized: invalid admin token.' }, 401, cors);
  }

  if (!env.DB) {
    return jsonResponse({ ok: true, items: [] }, 200, cors);
  }

  try {
    const { results } = await env.DB.prepare(`
      SELECT id, reference, name, email, phone, subject, message,
             consent, status, notes, ip_hash, user_agent, utm_source, created_at, updated_at
      FROM contacts
      ORDER BY id DESC
      LIMIT 200
    `).all();

    return jsonResponse({ ok: true, items: results || [] }, 200, cors);
  } catch (err) {
    console.error('Error fetching contacts:', err);
    return jsonResponse({ ok: false, error: 'Database query error.' }, 500, cors);
  }
}
