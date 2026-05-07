import { getStore } from '@netlify/blobs';

const STORE = 'kz-hosting';

function clean(s, max = 200) {
  return String(s == null ? '' : s).replace(/[\u0000-\u001F\u007F]/g, '').trim().slice(0, max);
}

export default async (req) => {
  if (req.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 });
  }

  let payload = {};
  try { payload = await req.json(); } catch {
    return Response.json({ ok: false, error: 'invalid-json' }, { status: 400 });
  }

  const role = clean(payload.role, 20);
  if (role !== 'host' && role !== 'guest') {
    return Response.json({ ok: false, error: 'missing-role' }, { status: 400 });
  }

  const name = clean(payload.name, 160);
  const contact = clean(payload.contact, 160);
  if (!name || !contact) {
    return Response.json({ ok: false, error: 'missing-contact' }, { status: 400 });
  }

  const record = {
    id: `host_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    role,
    name,
    contact,
    city: clean(payload.city, 120),
    country: clean(payload.country, 80),
    occasion: clean(payload.occasion, 80),
    seats: clean(payload.seats, 10),
    community: clean(payload.community, 40),
    kashrut: clean(payload.kashrut, 40),
    languages: clean(payload.languages, 120),
    dates: clean(payload.dates, 120),
    note: clean(payload.note, 800),
    matched: false,
    ts: new Date().toISOString()
  };

  try {
    const store = getStore(STORE);
    await store.setJSON(record.id, record);
  } catch {
    return Response.json({ ok: false, error: 'store-failed' }, { status: 500 });
  }

  const msg = role === 'host'
    ? 'תודה! הבקשה שלך לארח התקבלה · נחבר אותך עם יהודי שמחפש בית'
    : 'קיבלנו! נחבר אותך למארח מתאים בקרוב — בהצלחה רבה';

  return Response.json({ ok: true, message: msg });
};

export const config = { path: '/.netlify/functions/kz-host' };
