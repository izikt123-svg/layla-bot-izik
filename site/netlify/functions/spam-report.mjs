import { getStore } from '@netlify/blobs';

const ALERT_PHONE = '972542233888';

export default async (req) => {
  if (req.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 });
  }

  let payload = {};
  try {
    payload = await req.json();
  } catch {
    return Response.json({ ok: false, error: 'invalid-json' }, { status: 400 });
  }

  const record = {
    phone: ALERT_PHONE,
    source: payload.source || 'unknown',
    text: String(payload.text || '').slice(0, 2000),
    flagged: Array.isArray(payload.flagged) ? payload.flagged.slice(0, 20) : [],
    path: payload.path || '',
    ts: payload.ts || new Date().toISOString(),
    ua: req.headers.get('user-agent') || '',
    ip: req.headers.get('x-nf-client-connection-ip') || ''
  };

  try {
    const store = getStore('spam-reports');
    const key = `incident_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
    await store.setJSON(key, record);
  } catch (err) {
    return Response.json({ ok: false, error: 'store-failed' }, { status: 500 });
  }

  return Response.json({
    ok: true,
    alertedPhone: ALERT_PHONE,
    message: 'התקבל · צוות השמירה עודכן'
  });
};

export const config = { path: '/.netlify/functions/spam-report' };
