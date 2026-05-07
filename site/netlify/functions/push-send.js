/* ============================================================
   Netlify Function: /api/push-send  (PROTECTED)
   Sends a Web Push to all subscribers (or a filtered subset).
   Authenticated via header  x-push-secret == process.env.PUSH_SECRET.

   POST body:
   { title, body, url?, image?, lang?, tag? }

   Required env vars:
     VAPID_PUBLIC, VAPID_PRIVATE, VAPID_SUBJECT (e.g. mailto:you@my-hom.net)
     SUPABASE_URL, SUPABASE_SERVICE_KEY
     PUSH_SECRET   (any long random string — used to authorize this endpoint)

   Generate VAPID keys once:
     npx web-push generate-vapid-keys
   ============================================================ */
const webpush = require('web-push');

const HEADERS = {
  'Content-Type': 'application/json',
  'Cache-Control': 'no-store'
};

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') return { statusCode: 405, headers: HEADERS, body: JSON.stringify({ error: 'Method not allowed' }) };
  if ((event.headers['x-push-secret'] || '') !== (process.env.PUSH_SECRET || '__unset__')){
    return { statusCode: 401, headers: HEADERS, body: JSON.stringify({ error: 'Unauthorized' }) };
  }
  const need = ['VAPID_PUBLIC','VAPID_PRIVATE','VAPID_SUBJECT','SUPABASE_URL','SUPABASE_SERVICE_KEY'];
  for (const k of need) if (!process.env[k]) return { statusCode: 500, headers: HEADERS, body: JSON.stringify({ error: `Missing env ${k}` }) };

  webpush.setVapidDetails(process.env.VAPID_SUBJECT, process.env.VAPID_PUBLIC, process.env.VAPID_PRIVATE);

  let payload;
  try { payload = JSON.parse(event.body || '{}'); }
  catch { return { statusCode: 400, headers: HEADERS, body: JSON.stringify({ error: 'Invalid JSON' }) }; }

  const { title = 'מרכז התפילה', body, url = '/', image, lang, tag = 'kz-broadcast' } = payload;

  // Fetch subscriptions (optionally filter by lang)
  const sUrl = process.env.SUPABASE_URL;
  const sKey = process.env.SUPABASE_SERVICE_KEY;
  const filter = lang ? `&lang=eq.${encodeURIComponent(lang)}` : '';
  const r = await fetch(`${sUrl}/rest/v1/push_subscriptions?select=endpoint,p256dh,auth${filter}`, {
    headers: { 'apikey': sKey, 'Authorization': `Bearer ${sKey}` }
  });
  if (!r.ok) return { statusCode: 502, headers: HEADERS, body: JSON.stringify({ error: 'DB read failed' }) };
  const subs = await r.json();

  const message = JSON.stringify({ title, body, url, image, tag });
  const dead = [];
  let sent = 0, failed = 0;

  await Promise.all(subs.map(async (s) => {
    const sub = { endpoint: s.endpoint, keys: { p256dh: s.p256dh, auth: s.auth } };
    try {
      await webpush.sendNotification(sub, message, { TTL: 60 * 60 * 24 });
      sent++;
    } catch (err) {
      failed++;
      if (err.statusCode === 404 || err.statusCode === 410) dead.push(s.endpoint); // expired
    }
  }));

  // Garbage-collect expired subs
  if (dead.length){
    await fetch(`${sUrl}/rest/v1/push_subscriptions?endpoint=in.(${dead.map(e => `"${encodeURIComponent(e)}"`).join(',')})`, {
      method: 'DELETE',
      headers: { 'apikey': sKey, 'Authorization': `Bearer ${sKey}` }
    }).catch(() => {});
  }

  return { statusCode: 200, headers: HEADERS, body: JSON.stringify({ sent, failed, dead: dead.length, total: subs.length }) };
};
