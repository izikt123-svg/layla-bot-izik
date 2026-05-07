import { getStore } from '@netlify/blobs';

const STORE = 'kz-ask-rabbi';
const MAX_PER_PAGE = 80;

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
        if (rec && rec.publish === true) items.push(rec);
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

  const question = clean(payload.question, 1500);
  if (!question || question.length < 4) {
    return Response.json({ ok: false, error: 'missing-question' }, { status: 400 });
  }

  const record = {
    id: `ask_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    stream: clean(payload.stream, 40) || 'any',
    topic: clean(payload.topic, 40) || 'general',
    question,
    contact: clean(payload.contact, 120),
    publish: String(payload.publish || '') === 'yes',
    answer: '',
    answered_by: '',
    answered_at: '',
    ts: new Date().toISOString()
  };

  try {
    await store.setJSON(record.id, record);
  } catch {
    return Response.json({ ok: false, error: 'store-failed' }, { status: 500 });
  }

  return Response.json({
    ok: true,
    message: 'השאלה התקבלה · רב מהזרם שבחרת יחזור אליך בהקדם',
    id: record.id
  });
};

export const config = { path: '/.netlify/functions/kz-ask' };
