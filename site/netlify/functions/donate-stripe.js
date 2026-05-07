/* ============================================================
   Netlify Function: /api/donate-stripe
   Creates a Stripe Checkout session for a one-time donation.
   Returns { url } the client redirects to.

   Env vars:
     STRIPE_SECRET_KEY            ← live or test secret
     STRIPE_PRICE_CURRENCY        ← optional (default 'ils')
     SITE_URL                     ← https://my-hom.net  (used for return URLs)
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

  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) return { statusCode: 500, headers: HEADERS, body: JSON.stringify({ error: 'Stripe not configured' }) };

  let body;
  try { body = JSON.parse(event.body || '{}'); }
  catch { return { statusCode: 400, headers: HEADERS, body: JSON.stringify({ error: 'Invalid JSON' }) }; }

  const amountIn = parseInt(body.amount, 10) || 0;
  if (amountIn < 5 || amountIn > 100000) return { statusCode: 400, headers: HEADERS, body: JSON.stringify({ error: 'Bad amount' }) };
  const currency = (body.currency || process.env.STRIPE_PRICE_CURRENCY || 'ils').toLowerCase();
  const site = process.env.SITE_URL || ('https://' + (event.headers.host || 'my-hom.net'));

  // Stripe wants the smallest unit (agorot/cents)
  const unitAmount = amountIn * 100;

  const params = new URLSearchParams();
  params.append('mode', 'payment');
  params.append('payment_method_types[]', 'card');
  params.append('success_url', `${site}/?donation=success`);
  params.append('cancel_url',  `${site}/?donation=cancel`);
  params.append('line_items[0][quantity]', '1');
  params.append('line_items[0][price_data][currency]', currency);
  params.append('line_items[0][price_data][unit_amount]', String(unitAmount));
  params.append('line_items[0][price_data][product_data][name]', 'תרומה למרכז התפילה');
  params.append('line_items[0][price_data][product_data][description]', 'מרכז התפילה / my-hom.net');

  // Stripe issues automatic email receipts when the customer is given:
  if (body.email && /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(body.email)){
    params.append('customer_email', body.email);
    params.append('payment_intent_data[receipt_email]', body.email);
  }

  try {
    const r = await fetch('https://api.stripe.com/v1/checkout/sessions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${key}`,
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: params.toString()
    });
    const data = await r.json();
    if (!r.ok) return { statusCode: 502, headers: HEADERS, body: JSON.stringify({ error: data.error?.message || 'Stripe error' }) };
    return { statusCode: 200, headers: HEADERS, body: JSON.stringify({ url: data.url, id: data.id }) };
  } catch (err) {
    return { statusCode: 500, headers: HEADERS, body: JSON.stringify({ error: 'Network', detail: String(err).slice(0, 200) }) };
  }
};
