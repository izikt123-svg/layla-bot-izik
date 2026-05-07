/* ============================================================
   Netlify Function: /api/translate
   Cheap batched translation via Gemini.
   POST { texts: ["…","…"], target: "en" | "fr" | "es" | "ru" | … , source?: "he" }
   → { translations: ["…","…"] }
   ============================================================ */
const HEADERS = {
  'Content-Type': 'application/json; charset=utf-8',
  'Cache-Control': 'public, max-age=86400, s-maxage=604800',
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type'
};

exports.handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') return { statusCode: 204, headers: HEADERS, body: '' };
  if (event.httpMethod !== 'POST')    return { statusCode: 405, headers: HEADERS, body: JSON.stringify({ error: 'Method not allowed' }) };

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return { statusCode: 500, headers: HEADERS, body: JSON.stringify({ error: 'Missing GEMINI_API_KEY' }) };

  let body;
  try { body = JSON.parse(event.body || '{}'); }
  catch { return { statusCode: 400, headers: HEADERS, body: JSON.stringify({ error: 'Invalid JSON' }) }; }

  const texts = Array.isArray(body.texts) ? body.texts.slice(0, 200).map(t => String(t || '').slice(0, 600)) : [];
  const target = String(body.target || 'en').slice(0, 8);
  const source = String(body.source || 'he').slice(0, 8);
  if (!texts.length) return { statusCode: 400, headers: HEADERS, body: JSON.stringify({ error: 'No texts' }) };

  const prompt = `Translate the following ${source} strings to ${target}. Return STRICT JSON ONLY:
{"translations": ["…", "…"]}
Preserve numbers, emoji, punctuation, and any HTML tags. Keep tone warm and brief.

INPUT:
${JSON.stringify(texts)}`;

  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${encodeURIComponent(apiKey)}`;
  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
        generationConfig: { temperature: 0.1, maxOutputTokens: 2048, responseMimeType: 'application/json' }
      })
    });
    if (!res.ok){
      const detail = await res.text();
      return { statusCode: 502, headers: HEADERS, body: JSON.stringify({ error: 'Upstream', detail: detail.slice(0, 300) }) };
    }
    const data = await res.json();
    const raw = data?.candidates?.[0]?.content?.parts?.map(p => p.text).join('') || '{}';
    let parsed;
    try { parsed = JSON.parse(raw); }
    catch {
      // Fallback: try to find a JSON object in the text
      const m = raw.match(/\{[\s\S]*\}/);
      parsed = m ? JSON.parse(m[0]) : { translations: texts };
    }
    return { statusCode: 200, headers: HEADERS, body: JSON.stringify({ translations: parsed.translations || texts }) };
  } catch (err) {
    return { statusCode: 500, headers: HEADERS, body: JSON.stringify({ error: 'Network', detail: String(err).slice(0, 200) }) };
  }
};
