/* ============================================================
   Netlify Function: /api/prayer-wall
   Year-round public prayer requests + counters.

   GET  ?live=1                   → top 100 active (within 30 days)
   POST {cat,for_name,text}       → publish
   POST {action:'pray', id}       → +1 prayers counter

   SQL:
     create table prayer_wall (
       id uuid primary key default gen_random_uuid(),
       cat text not null,
       for_name text not null,
       text text,
       posted_by text default 'אנונימית',
       prayers int default 0,
       created_at timestamptz default now()
     );
     create index on prayer_wall (created_at desc);
   ============================================================ */
const HEADERS = {
  'Content-Type': 'application/json',
  'Cache-Control': 'no-store',
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type'
};
const ok = (b) => ({ statusCode: 200, headers: HEADERS, body: JSON.stringify(b) });
const er = (c, b) => ({ statusCode: c, headers: HEADERS, body: JSON.stringify(b) });
const { guarded } = require('./_security.js');

exports.handler = guarded(async (event) => {
  if (event.httpMethod === 'OPTIONS') return { statusCode: 204, headers: HEADERS, body: '' };

  const sUrl = process.env.SUPABASE_URL, sKey = process.env.SUPABASE_SERVICE_KEY;
  if (!sUrl || !sKey){
    if (event.httpMethod === 'GET') return ok({ requests: [] });
    return ok({ ok: true, persisted: false });
  }
  const sH = { 'apikey': sKey, 'Authorization': `Bearer ${sKey}` };

  if (event.httpMethod === 'GET'){
    const since = new Date(Date.now() - 30 * 86400_000).toISOString();
    const r = await fetch(`${sUrl}/rest/v1/prayer_wall?created_at=gte.${encodeURIComponent(since)}&select=*&order=prayers.desc.nullslast,created_at.desc&limit=100`, { headers: sH });
    if (!r.ok) return er(502, { error: 'DB', requests: [] });
    return ok({ requests: await r.json() });
  }

  if (event.httpMethod !== 'POST') return er(405, { error: 'Method not allowed' });
  let body;
  try { body = JSON.parse(event.body || '{}'); }
  catch { return er(400, { error: 'Invalid JSON' }); }

  if (body.action === 'pray'){
    if (!body.id) return er(400, { error: 'Missing id' });
    const get = await fetch(`${sUrl}/rest/v1/prayer_wall?id=eq.${encodeURIComponent(body.id)}&select=prayers`, { headers: sH });
    if (!get.ok) return er(502, { error: 'DB' });
    const rows = await get.json();
    if (!rows.length) return er(404, { error: 'Not found' });
    const newCount = (rows[0].prayers || 0) + 1;
    await fetch(`${sUrl}/rest/v1/prayer_wall?id=eq.${encodeURIComponent(body.id)}`, {
      method:'PATCH',
      headers: { ...sH, 'Content-Type':'application/json', 'Prefer':'return=minimal' },
      body: JSON.stringify({ prayers: newCount })
    });
    return ok({ ok: true, prayers: newCount });
  }

  const cat = String(body.cat || 'כללי').slice(0, 30);
  const for_name = String(body.for_name || '').slice(0, 120).trim();
  const text = String(body.text || '').slice(0, 500).trim();
  const posted_by = String(body.posted_by || 'אנונימית').slice(0, 60);
  if (!for_name) return er(400, { error: 'Missing for_name' });

  const r = await fetch(`${sUrl}/rest/v1/prayer_wall`, {
    method: 'POST',
    headers: { ...sH, 'Content-Type':'application/json', 'Prefer':'return=minimal' },
    body: JSON.stringify({ cat, for_name, text, posted_by })
  });
  if (!r.ok) return er(502, { error: 'Insert failed' });
  return ok({ ok: true });
}, { limit: 20, windowMs: 60_000 });
