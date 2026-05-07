/* ============================================================
   Netlify Function: /api/simchas
   GET  ?live=1   → returns up to 60 active simchas (created in last 14d)
   POST {type, who_name, city, event_date, message}  → publish
   POST {action:'bless', id}  → +1 blessings

   SQL:
     create table simchas (
       id uuid primary key default gen_random_uuid(),
       type text not null,
       who_name text not null,
       city text,
       event_date date,
       message text,
       blessings int default 0,
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
const ok = (b) => ({ statusCode: 200, headers: HEADERS, body: JSON.stringify(b) });
const er = (c, b) => ({ statusCode: c, headers: HEADERS, body: JSON.stringify(b) });

const { guarded } = require("./_security.js");
exports.handler = guarded(async (event) => {
  if (event.httpMethod === 'OPTIONS') return { statusCode: 204, headers: HEADERS, body: '' };
  const sUrl = process.env.SUPABASE_URL, sKey = process.env.SUPABASE_SERVICE_KEY;
  if (!sUrl || !sKey){
    if (event.httpMethod === 'GET') return ok({ simchas: [] });
    return ok({ ok: true, persisted: false });
  }
  const sH = { 'apikey': sKey, 'Authorization': `Bearer ${sKey}` };

  if (event.httpMethod === 'GET'){
    const since = new Date(Date.now() - 14 * 86400_000).toISOString();
    const r = await fetch(`${sUrl}/rest/v1/simchas?created_at=gte.${encodeURIComponent(since)}&select=*&order=blessings.desc.nullslast,created_at.desc&limit=60`, { headers: sH });
    if (!r.ok) return er(502, { error: 'DB', simchas: [] });
    return ok({ simchas: await r.json() });
  }

  if (event.httpMethod !== 'POST') return er(405, { error: 'Method not allowed' });
  let body;
  try { body = JSON.parse(event.body || '{}'); }
  catch { return er(400, { error: 'Invalid JSON' }); }

  if (body.action === 'bless'){
    if (!body.id) return er(400, { error: 'Missing id' });
    const get = await fetch(`${sUrl}/rest/v1/simchas?id=eq.${encodeURIComponent(body.id)}&select=blessings`, { headers: sH });
    if (!get.ok) return er(502, { error: 'DB' });
    const rows = await get.json();
    if (!rows.length) return er(404, { error: 'Not found' });
    const newCount = (rows[0].blessings || 0) + 1;
    await fetch(`${sUrl}/rest/v1/simchas?id=eq.${encodeURIComponent(body.id)}`, {
      method:'PATCH', headers:{...sH,'Content-Type':'application/json','Prefer':'return=minimal'},
      body: JSON.stringify({ blessings: newCount })
    });
    return ok({ ok: true, blessings: newCount });
  }

  const type = String(body.type || '').slice(0, 40).trim();
  const who_name = String(body.who_name || '').slice(0, 120).trim();
  const city = String(body.city || '').slice(0, 80).trim();
  const event_date = body.event_date ? new Date(body.event_date).toISOString().slice(0,10) : null;
  const message = String(body.message || '').slice(0, 800).trim();
  if (!type || !who_name) return er(400, { error: 'Missing fields' });

  const r = await fetch(`${sUrl}/rest/v1/simchas`, {
    method: 'POST',
    headers: { ...sH, 'Content-Type':'application/json', 'Prefer':'return=minimal' },
    body: JSON.stringify({ type, who_name, city, event_date, message })
  });
  if (!r.ok) return er(502, { error: 'Insert failed' });
  return ok({ ok: true });
}, { limit: 30, windowMs: 60_000 });
