/* ============================================================
   Netlify Function: /api/hospitality
   GET  ?kind=host|guest&city=...   → list nearby
   POST {kind, name, contact, city, lat, lng, ...}  → insert
   ============================================================ */
const HEADERS = {
  'Content-Type': 'application/json',
  'Cache-Control': 'no-store',
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type'
};

const { guarded } = require("./_security.js");
exports.handler = guarded(async (event) => {
  if (event.httpMethod === 'OPTIONS') return { statusCode: 204, headers: HEADERS, body: '' };
  const sUrl = process.env.SUPABASE_URL;
  const sKey = process.env.SUPABASE_SERVICE_KEY;
  if (!sUrl || !sKey) return { statusCode: 500, headers: HEADERS, body: JSON.stringify({ error: 'Supabase not configured' }) };

  if (event.httpMethod === 'GET'){
    const kind = (event.queryStringParameters?.kind || 'host').slice(0, 8);
    const city = (event.queryStringParameters?.city || '').slice(0, 80);
    const filter = `kind=eq.${encodeURIComponent(kind)}` + (city ? `&city=ilike.*${encodeURIComponent(city)}*` : '');
    const r = await fetch(`${sUrl}/rest/v1/shabbat_hospitality?${filter}&order=created_at.desc&limit=30`, {
      headers: { 'apikey': sKey, 'Authorization': `Bearer ${sKey}` }
    });
    if (!r.ok) return { statusCode: 502, headers: HEADERS, body: JSON.stringify({ error: 'DB' }) };
    const rows = await r.json();
    return { statusCode: 200, headers: HEADERS, body: JSON.stringify(rows) };
  }

  if (event.httpMethod !== 'POST') return { statusCode: 405, headers: HEADERS, body: JSON.stringify({ error: 'Method not allowed' }) };
  let body;
  try { body = JSON.parse(event.body || '{}'); }
  catch { return { statusCode: 400, headers: HEADERS, body: JSON.stringify({ error: 'Invalid JSON' }) }; }

  if (!body.contact || !['host','guest'].includes(body.kind)){
    return { statusCode: 400, headers: HEADERS, body: JSON.stringify({ error: 'Missing fields' }) };
  }

  const r = await fetch(`${sUrl}/rest/v1/shabbat_hospitality`, {
    method: 'POST',
    headers: {
      'apikey': sKey, 'Authorization': `Bearer ${sKey}`,
      'Content-Type': 'application/json',
      'Prefer': 'return=minimal'
    },
    body: JSON.stringify({
      kind: body.kind,
      name: String(body.name || '').slice(0, 80),
      contact: String(body.contact || '').slice(0, 120),
      city: String(body.city || '').slice(0, 80),
      country: String(body.country || '').slice(0, 80),
      lat: body.lat || null, lng: body.lng || null,
      date_start: body.date_start || null,
      notes: String(body.notes || '').slice(0, 500)
    })
  });
  if (!r.ok) return { statusCode: 502, headers: HEADERS, body: JSON.stringify({ error: 'Insert failed' }) };
  return { statusCode: 200, headers: HEADERS, body: JSON.stringify({ ok: true }) };
}, { limit: 30, windowMs: 60_000 });
