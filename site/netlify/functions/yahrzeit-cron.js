/* ============================================================
   Netlify Scheduled Function: yahrzeit-cron
   Runs daily at 06:00 UTC (≈ 09:00 Israel) and sends push
   notifications for yahrzeits happening today, tomorrow, and in 7 days.

   Schedule (Netlify will pick this up automatically):
     `daily 06:00`

   DB shape (Supabase):
     yahrzeits (
       id uuid pk default gen_random_uuid(),
       user_id uuid,
       endpoint text,                -- recipient push subscription
       deceased_name text not null,
       hebrew_date_day int not null, -- 1-30
       hebrew_date_month text not null, -- 'Tishrei','Cheshvan',...
       leap_aware boolean default true,
       created_at timestamptz default now()
     );
   ============================================================ */
const webpush = require('web-push');

const HEBREW_MONTHS = [
  'Nisan','Iyyar','Sivan','Tammuz','Av','Elul',
  'Tishrei','Cheshvan','Kislev','Tevet','Shevat','Adar','Adar I','Adar II'
];

async function fetchHebrewDate(date){
  // Hebcal converter — public, free, accurate
  const y = date.getUTCFullYear(), m = date.getUTCMonth() + 1, d = date.getUTCDate();
  const url = `https://www.hebcal.com/converter?cfg=json&gy=${y}&gm=${m}&gd=${d}&g2h=1`;
  const r = await fetch(url);
  if (!r.ok) throw new Error('hebcal');
  return r.json();
}

const HEADERS = { 'Content-Type': 'application/json' };

exports.handler = async (event) => {
  // Allow manual invocation via POST + secret for testing
  if (event.httpMethod && event.httpMethod !== 'POST'){
    // Scheduled invocation has no httpMethod
  }
  if (event.httpMethod === 'POST' && (event.headers['x-push-secret'] || '') !== (process.env.PUSH_SECRET || '__unset__')){
    return { statusCode: 401, headers: HEADERS, body: JSON.stringify({ error: 'Unauthorized' }) };
  }

  const sUrl = process.env.SUPABASE_URL;
  const sKey = process.env.SUPABASE_SERVICE_KEY;
  const need = ['VAPID_PUBLIC','VAPID_PRIVATE','VAPID_SUBJECT'];
  for (const k of need) if (!process.env[k]) return { statusCode: 500, headers: HEADERS, body: JSON.stringify({ error: `Missing ${k}` }) };
  if (!sUrl || !sKey) return { statusCode: 500, headers: HEADERS, body: JSON.stringify({ error: 'Supabase not configured' }) };

  webpush.setVapidDetails(process.env.VAPID_SUBJECT, process.env.VAPID_PUBLIC, process.env.VAPID_PRIVATE);

  // Compute Hebrew dates for today, tomorrow, +7d
  const today = new Date(); today.setUTCHours(12, 0, 0, 0);
  const todayHeb    = await fetchHebrewDate(today).catch(() => null);
  const tomorrowHeb = await fetchHebrewDate(new Date(today.getTime() + 86400000)).catch(() => null);
  const weekHeb     = await fetchHebrewDate(new Date(today.getTime() + 7 * 86400000)).catch(() => null);
  if (!todayHeb) return { statusCode: 502, headers: HEADERS, body: JSON.stringify({ error: 'Hebcal failed' }) };

  // Pull all yahrzeits and match
  const r = await fetch(`${sUrl}/rest/v1/yahrzeits?select=id,deceased_name,hebrew_date_day,hebrew_date_month,endpoint`, {
    headers: { 'apikey': sKey, 'Authorization': `Bearer ${sKey}` }
  });
  if (!r.ok) return { statusCode: 502, headers: HEADERS, body: JSON.stringify({ error: 'DB read failed' }) };
  const list = await r.json();

  const matchOn = (heb, days) => list.filter(y =>
    y.hebrew_date_day === heb.hd && (y.hebrew_date_month === heb.hm)
  ).map(y => ({ ...y, when: days }));

  const targets = [
    ...matchOn(todayHeb, 0),
    ...(tomorrowHeb ? matchOn(tomorrowHeb, 1) : []),
    ...(weekHeb     ? matchOn(weekHeb, 7) : [])
  ];

  // Subscriptions lookup
  const epSet = new Set(targets.map(t => t.endpoint).filter(Boolean));
  const subsRes = await fetch(`${sUrl}/rest/v1/push_subscriptions?select=endpoint,p256dh,auth&endpoint=in.(${[...epSet].map(e => `"${encodeURIComponent(e)}"`).join(',') || '""'})`, {
    headers: { 'apikey': sKey, 'Authorization': `Bearer ${sKey}` }
  });
  const subs = subsRes.ok ? await subsRes.json() : [];
  const byEp = new Map(subs.map(s => [s.endpoint, s]));

  let sent = 0, failed = 0;
  await Promise.all(targets.map(async (t) => {
    const sub = byEp.get(t.endpoint);
    if (!sub) return;
    const phrase = t.when === 0
      ? `🕯 היום יום הזיכרון של ${t.deceased_name} ז"ל`
      : t.when === 1
        ? `🕯 מחר יום הזיכרון של ${t.deceased_name} ז"ל`
        : `🕯 בעוד שבוע יום הזיכרון של ${t.deceased_name} ז"ל`;
    const payload = JSON.stringify({
      title: 'יום זיכרון',
      body: phrase + ' — להדליק נר זיכרון בקיר העולמי.',
      url: '/memorial.html',
      tag: `yahrzeit-${t.id}`,
      requireInteraction: true
    });
    try {
      await webpush.sendNotification({ endpoint: sub.endpoint, keys: { p256dh: sub.p256dh, auth: sub.auth } }, payload, { TTL: 86400 });
      sent++;
    } catch { failed++; }
  }));

  return { statusCode: 200, headers: HEADERS, body: JSON.stringify({ sent, failed, candidates: targets.length, hebrew_today: todayHeb }) };
};

// Netlify scheduled syntax — daily at 06:00 UTC
exports.config = { schedule: '0 6 * * *' };
