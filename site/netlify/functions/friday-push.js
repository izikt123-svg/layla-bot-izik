/* ============================================================
   Netlify Scheduled Function: friday-push
   Runs every Friday at 09:00 UTC (≈ 12:00 IDT).
   Sends a soft push to all subscribers reminding them about
   tonight's Shabbat candle lighting + a deep-link to the page.

   Schedule below uses Netlify-supported cron syntax.
   ============================================================ */
const webpush = require('web-push');

const HEADERS = { 'Content-Type': 'application/json' };
const ok = (b) => ({ statusCode: 200, headers: HEADERS, body: JSON.stringify(b) });

exports.handler = async (event) => {
  // Allow manual trigger via POST + secret
  if (event.httpMethod === 'POST'){
    if ((event.headers['x-push-secret'] || '') !== (process.env.PUSH_SECRET || '__unset__')){
      return { statusCode: 401, headers: HEADERS, body: JSON.stringify({ error: 'Unauthorized' }) };
    }
  }

  const need = ['VAPID_PUBLIC','VAPID_PRIVATE','VAPID_SUBJECT','SUPABASE_URL','SUPABASE_SERVICE_KEY'];
  for (const k of need){
    if (!process.env[k]) return ok({ skipped: true, reason: `missing ${k}` });
  }

  webpush.setVapidDetails(process.env.VAPID_SUBJECT, process.env.VAPID_PUBLIC, process.env.VAPID_PRIVATE);

  const sUrl = process.env.SUPABASE_URL, sKey = process.env.SUPABASE_SERVICE_KEY;
  const r = await fetch(`${sUrl}/rest/v1/push_subscriptions?select=endpoint,p256dh,auth`, {
    headers: { 'apikey': sKey, 'Authorization': `Bearer ${sKey}` }
  });
  if (!r.ok) return ok({ skipped: true, reason: 'subs read failed' });
  const subs = await r.json();

  const message = JSON.stringify({
    title: '🕯 שבת קרבה',
    body: 'אל תשכחי להדליק נר וירטואלי בקיר העולמי. תפילתך תצטרף לאלפי נשים ברחבי העולם.',
    url: '/shabbat-candles.html',
    tag: 'kz-friday-shabbat',
    requireInteraction: false
  });

  let sent = 0, failed = 0;
  await Promise.all(subs.map(async (s) => {
    try {
      await webpush.sendNotification({ endpoint: s.endpoint, keys: { p256dh: s.p256dh, auth: s.auth } }, message, { TTL: 6 * 3600 });
      sent++;
    } catch { failed++; }
  }));

  return ok({ sent, failed, total: subs.length });
};

exports.config = { schedule: '0 9 * * 5' }; // Every Friday 09:00 UTC
