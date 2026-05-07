import { getStore } from '@netlify/blobs';

const STORE = 'kz-suggestions';

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

  const name = clean(payload.name, 160);
  const city = clean(payload.city, 120);
  if (!name || !city) {
    return Response.json({ ok: false, error: 'missing-fields' }, { status: 400 });
  }

  const record = {
    id: `sug_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    name,
    city,
    country: clean(payload.country, 80),
    type: clean(payload.type, 40),
    address: clean(payload.address, 300),
    phone: clean(payload.phone, 40),
    note: clean(payload.note, 800),
    submitter: clean(payload.submitter, 120),
    reviewed: false,
    ts: new Date().toISOString()
  };

  try {
    const store = getStore(STORE);
    await store.setJSON(record.id, record);
  } catch {
    return Response.json({ ok: false, error: 'store-failed' }, { status: 500 });
  }

  return Response.json({
    ok: true,
    message: `תודה! ${name} ב${city} הוזן למאגר · הצוות יבדוק ויוסיף לציבור`
  });
};

export const config = { path: '/.netlify/functions/kz-suggest' };
