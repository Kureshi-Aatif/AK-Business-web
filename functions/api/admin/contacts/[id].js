import { getCorsHeaders, handleOptions, constantTimeCompare, sanitize, jsonResponse } from '../../utils.js';

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

export async function onRequestPatch({ request, params, env }) {
  const cors = getCorsHeaders(request, env);
  if (!authenticate(request, env)) {
    return jsonResponse({ ok: false, error: 'Unauthorized.' }, 401, cors);
  }

  const id = parseInt(params.id, 10);
  if (!id) return jsonResponse({ ok: false, error: 'Invalid ID.' }, 400, cors);

  let body;
  try {
    body = await request.json();
  } catch (e) {
    return jsonResponse({ ok: false, error: 'Invalid JSON.' }, 400, cors);
  }

  const status = sanitize(body.status, 50);
  const notes = sanitize(body.notes, 2000);

  if (env.DB) {
    try {
      await env.DB.prepare(`
        UPDATE contacts
        SET status = coalesce(nullif(?, ''), status),
            notes = coalesce(?, notes),
            updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `).bind(status, notes, id).run();

      return jsonResponse({ ok: true, message: 'Record updated.' }, 200, cors);
    } catch (err) {
      return jsonResponse({ ok: false, error: 'Database update failed.' }, 500, cors);
    }
  }

  return jsonResponse({ ok: true }, 200, cors);
}

export async function onRequestDelete({ request, params, env }) {
  const cors = getCorsHeaders(request, env);
  if (!authenticate(request, env)) {
    return jsonResponse({ ok: false, error: 'Unauthorized.' }, 401, cors);
  }

  const id = parseInt(params.id, 10);
  if (!id) return jsonResponse({ ok: false, error: 'Invalid ID.' }, 400, cors);

  if (env.DB) {
    try {
      await env.DB.prepare('DELETE FROM contacts WHERE id = ?').bind(id).run();
      return jsonResponse({ ok: true, message: 'Record deleted.' }, 200, cors);
    } catch (err) {
      return jsonResponse({ ok: false, error: 'Failed to delete record.' }, 500, cors);
    }
  }

  return jsonResponse({ ok: true }, 200, cors);
}
