/* ============================================================
   Netlify Function: /api/push-subscribe
   Stores a Web Push subscription in Supabase. Idempotent — same
   endpoint won't be inserted twice.

   Required env vars (Netlify dashboard → Environment):
     SUPABASE_URL
     SUPABASE_SERVICE_KEY  (service role — server-side ONLY)

   SQL (run once in Supabase → SQL editor):
     create table push_subscriptions (
       id uuid primary key default gen_random_uuid(),
       endpoint text unique not null,
       p256dh text not null,
       auth text not null,
       lang text default 'he',
       created_at timestamp with time zone default now()
     );
     alter table push_subscriptions enable row level security;
     -- Server (service key) bypasses RLS, no client policies needed.
   ============================================================ */
const HEADERS = {
  'Content-Type': 'application/json',
  'Cache-Control': 'no-store',
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type'
};

exports.handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') return { statusCode: 204, headers: HEADERS, body: '' };
  if (event.httpMethod !== 'POST')    return { statusCode: 405, headers: HEADERS, body: JSON.stringify({ error: 'Method not allowed' }) };

  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_KEY;
  if (!url || !key) return { statusCode: 500, headers: HEADERS, body: JSON.stringify({ error: 'Server not configured' }) };

  let sub;
  try { sub = JSON.parse(event.body || '{}'); }
  catch { return { statusCode: 400, headers: HEADERS, body: JSON.stringify({ error: 'Invalid JSON' }) }; }

  if (!sub.endpoint || !sub.keys?.p256dh || !sub.keys?.auth){
    return { statusCode: 400, headers: HEADERS, body: JSON.stringify({ error: 'Missing fields' }) };
  }

  const lang = (event.headers['accept-language'] || 'he').split(',')[0].split('-')[0];

  // Upsert via Supabase REST API
  const res = await fetch(`${url}/rest/v1/push_subscriptions?on_conflict=endpoint`, {
    method: 'POST',
    headers: {
      'apikey': key,
      'Authorization': `Bearer ${key}`,
      'Content-Type': 'application/json',
      'Prefer': 'resolution=merge-duplicates,return=minimal'
    },
    body: JSON.stringify({
      endpoint: sub.endpoint,
      p256dh: sub.keys.p256dh,
      auth: sub.keys.auth,
      lang
    })
  });

  if (!res.ok){
    const detail = await res.text();
    return { statusCode: 502, headers: HEADERS, body: JSON.stringify({ error: 'DB error', detail: detail.slice(0, 300) }) };
  }
  return { statusCode: 200, headers: HEADERS, body: JSON.stringify({ ok: true }) };
};
