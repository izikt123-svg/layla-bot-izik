import { getStore } from '@netlify/blobs';

const STORE = 'kz-memorial';
const MAX_PER_PAGE = 60;

function clean(s, max = 200) {
  return String(s == null ? '' : s).replace(/[\u0000-\u001F\u007F]/g, '').trim().slice(0, max);
}

export default async (req) => {
  const store = getStore(STORE);

  if (req.method === 'GET') {
    try {
      const list = await store.list();
      const blobs = (list.blobs || []).slice(-MAX_PER_PAGE).reverse();
      const items = [];
      for (const b of blobs) {
        const rec = await store.get(b.key, { type: 'json' });
        if (rec && rec.published !== false) items.push(rec);
      }
      return Response.json({ ok: true, items });
    } catch {
      return Response.json({ ok: true, items: [] });
    }
  }

  if (req.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 });
  }

  let payload = {};
  try { payload = await req.json(); } catch {
    return Response.json({ ok: false, error: 'invalid-json' }, { status: 400 });
  }

  const name = clean(payload.name, 120);
  if (!name) {
    return Response.json({ ok: false, error: 'missing-name' }, { status: 400 });
  }

  const record = {
    id: `mem_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    name,
    mother: clean(payload.mother, 120),
    category: clean(payload.category, 40) || 'family',
    yahrzeit: clean(payload.yahrzeit, 40),
    note: clean(payload.note, 800),
    submitter: clean(payload.submitter, 80),
    ts: new Date().toISOString(),
    published: true
  };

  try {
    await store.setJSON(record.id, record);
  } catch {
    return Response.json({ ok: false, error: 'store-failed' }, { status: 500 });
  }

  return Response.json({
    ok: true,
    message: `שמו של ${name} נכתב בספר הנשמות · תהי נשמתו צרורה בצרור החיים`,
    id: record.id
  });
};

export const config = { path: '/.netlify/functions/kz-memorial' };
