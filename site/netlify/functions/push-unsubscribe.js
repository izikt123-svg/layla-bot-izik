/* ============================================================
   Netlify Function: /api/push-unsubscribe
   Removes a Web Push subscription by endpoint.
   ============================================================ */
const HEADERS = {
  'Content-Type': 'application/json',
  'Cache-Control': 'no-store',
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type'
};

exports.handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') return { statusCode: 204, headers: HEADERS, body: '' };
  if (event.httpMethod !== 'POST')    return { statusCode: 405, headers: HEADERS, body: JSON.stringify({ error: 'Method not allowed' }) };

  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_KEY;
  if (!url || !key) return { statusCode: 500, headers: HEADERS, body: JSON.stringify({ error: 'Server not configured' }) };

  let body;
  try { body = JSON.parse(event.body || '{}'); }
  catch { return { statusCode: 400, headers: HEADERS, body: JSON.stringify({ error: 'Invalid JSON' }) }; }
  if (!body.endpoint) return { statusCode: 400, headers: HEADERS, body: JSON.stringify({ error: 'Missing endpoint' }) };

  const res = await fetch(`${url}/rest/v1/push_subscriptions?endpoint=eq.${encodeURIComponent(body.endpoint)}`, {
    method: 'DELETE',
    headers: { 'apikey': key, 'Authorization': `Bearer ${key}` }
  });

  if (!res.ok){
    return { statusCode: 502, headers: HEADERS, body: JSON.stringify({ error: 'DB error' }) };
  }
  return { statusCode: 200, headers: HEADERS, body: JSON.stringify({ ok: true }) };
};
