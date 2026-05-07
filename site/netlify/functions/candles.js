/* ============================================================
   Netlify Function: /api/candles
   Live virtual Shabbat-candle wall + likes + sharing.

   GET  ?live=1            → all candles where havdala_at > now()
   GET  ?id=<uuid>         → single candle (for share page)
   GET  ?top=1             → top 12 by likes (still burning)
   POST {action:'light',  ...}  → insert candle  (default action)
   POST {action:'like',   id }  → +1 likes
   POST { name, prayer, city, candleAt, havdalaAt }   ← also OK, defaults to 'light'

   SQL:
     create table shabbat_candles_live (
       id uuid primary key default gen_random_uuid(),
       name text not null,
       prayer text,
       city text,
       city_id text,
       likes int default 0,
       candle_at timestamptz,
       havdala_at timestamptz,
       created_at timestamptz default now()
     );
     create index on shabbat_candles_live (havdala_at);
     create index on shabbat_candles_live (likes desc);
   ============================================================ */
const HEADERS = {
  'Content-Type': 'application/json',
  'Cache-Control': 'no-store',
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type'
};

function ok(body){ return { statusCode: 200, headers: HEADERS, body: JSON.stringify(body) }; }
function err(code, body){ return { statusCode: code, headers: HEADERS, body: JSON.stringify(body) }; }

function shape(c){
  return {
    id: c.id, name: c.name, prayer: c.prayer, city: c.city,
    likes: c.likes || 0,
    audio: c.audio_url || null,
    photo: c.photo_url || null,
    lat: c.lat, lng: c.lng,
    candleAt: c.candle_at, havdalaAt: c.havdala_at,
    created_at: c.created_at
  };
}

const { guarded } = require("./_security.js");
exports.handler = guarded(async (event) => {
  if (event.httpMethod === 'OPTIONS') return { statusCode: 204, headers: HEADERS, body: '' };

  const sUrl = process.env.SUPABASE_URL;
  const sKey = process.env.SUPABASE_SERVICE_KEY;
  if (!sUrl || !sKey){
    if (event.httpMethod === 'GET') return ok({ candles: [] });
    return ok({ ok: true, persisted: false });
  }

  const sHeaders = { 'apikey': sKey, 'Authorization': `Bearer ${sKey}` };

  if (event.httpMethod === 'GET'){
    const q = event.queryStringParameters || {};
    const select = 'id,name,prayer,city,likes,audio_url,photo_url,lat,lng,candle_at,havdala_at,created_at';

    if (q.id){
      const r = await fetch(`${sUrl}/rest/v1/shabbat_candles_live?id=eq.${encodeURIComponent(q.id)}&select=${select}`, { headers: sHeaders });
      if (!r.ok) return err(502, { error: 'DB' });
      const rows = await r.json();
      if (!rows.length) return err(404, { error: 'Not found' });
      return ok({ candle: shape(rows[0]) });
    }

    const nowIso = new Date().toISOString();
    const baseUrl = `${sUrl}/rest/v1/shabbat_candles_live?havdala_at=gte.${encodeURIComponent(nowIso)}&select=${select}&limit=200`;
    const url = q.top ? `${baseUrl}&order=likes.desc.nullslast,created_at.desc&limit=12` : `${baseUrl}&order=created_at.desc`;

    const r = await fetch(url, { headers: sHeaders });
    if (!r.ok) return err(502, { error: 'DB read', candles: [] });
    const rows = await r.json();
    return ok({ candles: rows.map(shape) });
  }

  if (event.httpMethod !== 'POST') return err(405, { error: 'Method not allowed' });

  let body;
  try { body = JSON.parse(event.body || '{}'); }
  catch { return err(400, { error: 'Invalid JSON' }); }

  const action = body.action || 'light';

  if (action === 'like'){
    if (!body.id) return err(400, { error: 'Missing id' });
    // Atomic-ish increment: read → write +1 (race-tolerant for low traffic)
    const get = await fetch(`${sUrl}/rest/v1/shabbat_candles_live?id=eq.${encodeURIComponent(body.id)}&select=likes`, { headers: sHeaders });
    if (!get.ok) return err(502, { error: 'DB' });
    const rows = await get.json();
    if (!rows.length) return err(404, { error: 'Not found' });
    const newLikes = (rows[0].likes || 0) + 1;
    const upd = await fetch(`${sUrl}/rest/v1/shabbat_candles_live?id=eq.${encodeURIComponent(body.id)}`, {
      method: 'PATCH',
      headers: { ...sHeaders, 'Content-Type':'application/json', 'Prefer':'return=minimal' },
      body: JSON.stringify({ likes: newLikes })
    });
    if (!upd.ok) return err(502, { error: 'DB write' });
    return ok({ ok: true, likes: newLikes });
  }

  // Default: 'light'
  const name      = String(body.name    || '').slice(0, 80).trim();
  const prayer    = String(body.prayer  || '').slice(0, 500).trim();
  const city      = String(body.city    || '').slice(0, 100).trim();
  const cityId    = String(body.cityId  || '').slice(0, 40);
  const candleAt  = body.candleAt  ? new Date(body.candleAt).toISOString()  : null;
  const havdalaAt = body.havdalaAt ? new Date(body.havdalaAt).toISOString() : new Date(Date.now() + 30*3600_000).toISOString();
  if (!name) return err(400, { error: 'Missing name' });

  // Audio + Photo: accept up to ~2.5MB of base64. Beyond that → drop quietly.
  const audio = (typeof body.audio === 'string' && body.audio.startsWith('data:audio/') && body.audio.length < 2_800_000) ? body.audio : null;
  const photo = (typeof body.photo === 'string' && body.photo.startsWith('data:image/') && body.photo.length < 2_800_000) ? body.photo : null;
  const lat = Number.isFinite(body.lat) ? body.lat : null;
  const lng = Number.isFinite(body.lng) ? body.lng : null;

  const r = await fetch(`${sUrl}/rest/v1/shabbat_candles_live`, {
    method: 'POST',
    headers: { ...sHeaders, 'Content-Type':'application/json', 'Prefer':'return=representation' },
    body: JSON.stringify({
      name, prayer, city, city_id: cityId,
      candle_at: candleAt, havdala_at: havdalaAt,
      audio_url: audio, photo_url: photo,
      lat, lng
    })
  });
  if (!r.ok){
    const detail = await r.text();
    return err(502, { error: 'Insert failed', detail: detail.slice(0, 200) });
  }
  const rows = await r.json();
  return ok({ ok: true, candle: rows[0] ? shape(rows[0]) : null });
}, { limit: 30, windowMs: 60_000 });
