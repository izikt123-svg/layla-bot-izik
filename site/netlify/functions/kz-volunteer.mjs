import { getStore } from '@netlify/blobs';

const STORE = 'kz-volunteers';

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
  if (role !== 'offer' && role !== 'request') {
    return Response.json({ ok: false, error: 'missing-role' }, { status: 400 });
  }

  const contact = clean(payload.contact, 160);
  if (!contact) {
    return Response.json({ ok: false, error: 'missing-contact' }, { status: 400 });
  }

  const record = {
    id: `vol_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    role,
    name: clean(payload.name, 160),
    contact,
    area: clean(payload.area, 80),
    city: clean(payload.city, 120),
    country: clean(payload.country, 80),
    skills: clean(payload.skills, 300),
    languages: clean(payload.languages, 120),
    availability: clean(payload.availability, 120),
    note: clean(payload.note, 800),
    urgency: clean(payload.urgency, 20),
    matched: false,
    ts: new Date().toISOString()
  };

  try {
    const store = getStore(STORE);
    await store.setJSON(record.id, record);
  } catch {
    return Response.json({ ok: false, error: 'store-failed' }, { status: 500 });
  }

  const msg = role === 'offer'
    ? 'תודה שהתנדבת · כשתהיה בקשה מתאימה ניצור איתך קשר'
    : 'קיבלנו את בקשתך · ננסה להצמיד לך מתנדב בהקדם';

  return Response.json({ ok: true, message: msg });
};

export const config = { path: '/.netlify/functions/kz-volunteer' };
