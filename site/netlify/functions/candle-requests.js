/* ============================================================
   Netlify Function: /api/candle-requests
   "Please light a candle for me" — requests + claims.

   GET  ?live=1                    → open requests (claimed_by IS NULL)
   POST {action:'request', for_name, prayer}        → create request
   POST {action:'claim',   id, lighter_name, city}  → mark fulfilled +
                                                      auto-create the candle

   SQL:
     create table candle_requests (
       id uuid primary key default gen_random_uuid(),
       for_name text not null,
       prayer text,
       claimed_by text,
       claimed_city text,
       claimed_at timestamptz,
       created_at timestamptz default now()
     );
   ============================================================ */
const HEADERS = {
  'Content-Type': 'application/json',
  'Cache-Control': 'no-store',
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type'
};
const ok  = (b) => ({ statusCode: 200, headers: HEADERS, body: JSON.stringify(b) });
const erR = (c, b) => ({ statusCode: c, headers: HEADERS, body: JSON.stringify(b) });

const { guarded } = require("./_security.js");
exports.handler = guarded(async (event) => {
  if (event.httpMethod === 'OPTIONS') return { statusCode: 204, headers: HEADERS, body: '' };

  const sUrl = process.env.SUPABASE_URL;
  const sKey = process.env.SUPABASE_SERVICE_KEY;
  if (!sUrl || !sKey){
    if (event.httpMethod === 'GET') return ok({ requests: [] });
    return ok({ ok: true, persisted: false });
  }
  const sHeaders = { 'apikey': sKey, 'Authorization': `Bearer ${sKey}` };

  if (event.httpMethod === 'GET'){
    const r = await fetch(`${sUrl}/rest/v1/candle_requests?claimed_by=is.null&select=*&order=created_at.desc&limit=60`, { headers: sHeaders });
    if (!r.ok) return erR(502, { error: 'DB', requests: [] });
    return ok({ requests: await r.json() });
  }

  if (event.httpMethod !== 'POST') return erR(405, { error: 'Method not allowed' });

  let body;
  try { body = JSON.parse(event.body || '{}'); }
  catch { return erR(400, { error: 'Invalid JSON' }); }

  if (body.action === 'request'){
    const for_name = String(body.for_name || '').slice(0, 80).trim();
    const prayer   = String(body.prayer   || '').slice(0, 500).trim();
    if (!for_name) return erR(400, { error: 'Missing for_name' });
    const r = await fetch(`${sUrl}/rest/v1/candle_requests`, {
      method:'POST',
      headers: { ...sHeaders, 'Content-Type':'application/json', 'Prefer':'return=minimal' },
      body: JSON.stringify({ for_name, prayer })
    });
    if (!r.ok) return erR(502, { error: 'DB write' });
    return ok({ ok: true });
  }

  if (body.action === 'claim'){
    const id           = String(body.id || '');
    const lighter_name = String(body.lighter_name || 'אנונימית').slice(0, 80);
    const claimed_city = String(body.city || '').slice(0, 100);
    if (!id) return erR(400, { error: 'Missing id' });

    // 1) Mark the request as claimed (idempotent: only if NOT yet claimed)
    const upd = await fetch(`${sUrl}/rest/v1/candle_requests?id=eq.${encodeURIComponent(id)}&claimed_by=is.null`, {
      method: 'PATCH',
      headers: { ...sHeaders, 'Content-Type':'application/json', 'Prefer':'return=representation' },
      body: JSON.stringify({ claimed_by: lighter_name, claimed_city, claimed_at: new Date().toISOString() })
    });
    if (!upd.ok) return erR(502, { error: 'DB' });
    const updRows = await upd.json();
    if (!updRows.length) return erR(409, { error: 'Already claimed' });
    const req = updRows[0];

    // 2) Auto-light a candle for the requested name
    const havdalaAt = new Date(Date.now() + 30 * 3600_000).toISOString();
    await fetch(`${sUrl}/rest/v1/shabbat_candles_live`, {
      method: 'POST',
      headers: { ...sHeaders, 'Content-Type':'application/json', 'Prefer':'return=minimal' },
      body: JSON.stringify({
        name: lighter_name + ' · עבור ' + req.for_name,
        prayer: req.prayer,
        city: claimed_city,
        candle_at: null,
        havdala_at: havdalaAt
      })
    }).catch(()=>{});

    return ok({ ok: true, request: req });
  }

  return erR(400, { error: 'Unknown action' });
}, { limit: 30, windowMs: 60_000 });
