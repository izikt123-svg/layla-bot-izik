import { getStore } from '@netlify/blobs';

const STORE = 'kz-learning-subs';

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

  const contact = clean(payload.contact, 160);
  const track = clean(payload.track, 60);
  if (!contact || !track) {
    return Response.json({ ok: false, error: 'missing-fields' }, { status: 400 });
  }

  const record = {
    id: `sub_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    contact,
    track,
    channel: clean(payload.channel, 20) || 'email',
    language: clean(payload.language, 20) || 'he',
    name: clean(payload.name, 120),
    active: true,
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
    message: `נרשמת ל־${track} · הלימוד יחכה לך כל יום`
  });
};

export const config = { path: '/.netlify/functions/kz-subscribe' };
