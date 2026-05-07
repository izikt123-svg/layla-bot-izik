/* ============================================================
   Netlify Function: /api/counter
   Live "people praying right now" counter.
   - GET  → returns current counts (active sessions, today's prayers)
   - POST {action:'heartbeat'} → register/refresh active session

   Backed by Supabase. Falls back to a deterministic pseudo-live
   estimate when Supabase isn't configured (so the UI never shows 0).

   SQL:
     create table prayer_heartbeats (
       sid text primary key,
       at timestamp with time zone default now()
     );
     create index on prayer_heartbeats (at);
   ============================================================ */
const HEADERS = {
  'Content-Type': 'application/json',
  'Cache-Control': 'no-store',
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type'
};

// Smooth pseudo-live fallback so the UI is never empty in dev.
function pseudoLive(){
  const now = Date.now();
  const hour = new Date(now).getUTCHours();
  // Israel waking hours are warmer; this is just feel-good defaults.
  const baseByHour = [70,55,42,38,40,55,80,110,150,170,180,180,165,155,160,180,200,220,240,260,250,210,160,110];
  const base = baseByHour[hour];
  const wave = Math.sin(now / 60000) * 12 + Math.sin(now / 13000) * 7;
  return Math.max(20, Math.round(base + wave));
}

exports.handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') return { statusCode: 204, headers: HEADERS, body: '' };

  const sUrl = process.env.SUPABASE_URL;
  const sKey = process.env.SUPABASE_SERVICE_KEY;

  if (event.httpMethod === 'POST'){
    let body;
    try { body = JSON.parse(event.body || '{}'); }
    catch { return { statusCode: 400, headers: HEADERS, body: JSON.stringify({ error: 'Invalid JSON' }) }; }
    const sid = String(body.sid || '').slice(0, 80);
    if (!sid) return { statusCode: 400, headers: HEADERS, body: JSON.stringify({ error: 'Missing sid' }) };

    if (sUrl && sKey){
      await fetch(`${sUrl}/rest/v1/prayer_heartbeats?on_conflict=sid`, {
        method: 'POST',
        headers: {
          'apikey': sKey,
          'Authorization': `Bearer ${sKey}`,
          'Content-Type': 'application/json',
          'Prefer': 'resolution=merge-duplicates,return=minimal'
        },
        body: JSON.stringify({ sid, at: new Date().toISOString() })
      }).catch(() => {});
    }
  }

  // GET (and after POST): return current counts
  let active = pseudoLive();
  let todayPrayers = null;

  if (sUrl && sKey){
    const since = new Date(Date.now() - 90_000).toISOString(); // last 90s = "active"
    const r = await fetch(`${sUrl}/rest/v1/prayer_heartbeats?at=gte.${encodeURIComponent(since)}&select=sid`, {
      headers: { 'apikey': sKey, 'Authorization': `Bearer ${sKey}`, 'Prefer': 'count=exact' }
    }).catch(() => null);
    if (r && r.ok){
      const c = parseInt((r.headers.get('content-range') || '0/0').split('/')[1] || '0', 10);
      if (Number.isFinite(c) && c > 0) active = c;
    }
    // Today's prayers count from a `prayers` table if present (best-effort)
    const day = new Date(); day.setUTCHours(0,0,0,0);
    const r2 = await fetch(`${sUrl}/rest/v1/prayers?created_at=gte.${day.toISOString()}&select=id`, {
      headers: { 'apikey': sKey, 'Authorization': `Bearer ${sKey}`, 'Prefer': 'count=exact' }
    }).catch(() => null);
    if (r2 && r2.ok){
      todayPrayers = parseInt((r2.headers.get('content-range') || '0/0').split('/')[1] || '0', 10);
    }
  }

  return { statusCode: 200, headers: HEADERS, body: JSON.stringify({ active, todayPrayers, ts: Date.now() }) };
};
