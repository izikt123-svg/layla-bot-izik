/* ============================================================
   Netlify Function: /api/menu-vision
   POST { image: dataURL, target: 'he'|'en'|... }
   Returns: { translation, warnings: [..non-kosher hints..] }
   Uses Gemini 1.5 Flash with vision input.
   ============================================================ */
const HEADERS = {
  'Content-Type': 'application/json; charset=utf-8',
  'Cache-Control': 'no-store',
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
  const image  = String(body.image || '');
  const target = (body.target || 'he').slice(0, 5);
  if (!image.startsWith('data:image/')) return { statusCode: 400, headers: HEADERS, body: JSON.stringify({ error: 'Image must be a data URL' }) };

  const m = image.match(/^data:(image\/[a-z+.\-]+);base64,(.+)$/i);
  if (!m) return { statusCode: 400, headers: HEADERS, body: JSON.stringify({ error: 'Bad data URL' }) };
  const mime = m[1], data = m[2];

  const prompt = `אתה עוזר תיירות יהודי. תוצג לך תמונה של תפריט מסעדה.
1. תרגם את כל פריטי התפריט לשפה: ${target}.
2. זהה אילו פריטים עלולים להיות לא-כשרים (חזיר, שרימפ/פירות ים, בשר וחלב יחד, ג'לטין מהחי, קונטיאק לא מאושר וכו').
החזר JSON תקני בלבד:
{"translation":"...","warnings":["...","..."]}`;

  try {
    const r = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${encodeURIComponent(apiKey)}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{
          role: 'user',
          parts: [
            { text: prompt },
            { inline_data: { mime_type: mime, data } }
          ]
        }],
        generationConfig: { temperature: 0.2, maxOutputTokens: 1024, responseMimeType: 'application/json' }
      })
    });
    if (!r.ok){
      const detail = await r.text();
      return { statusCode: 502, headers: HEADERS, body: JSON.stringify({ error: 'Upstream', detail: detail.slice(0, 300) }) };
    }
    const data2 = await r.json();
    const raw = data2?.candidates?.[0]?.content?.parts?.map(p => p.text).join('') || '{}';
    let parsed;
    try { parsed = JSON.parse(raw); }
    catch {
      const m2 = raw.match(/\{[\s\S]*\}/);
      parsed = m2 ? JSON.parse(m2[0]) : { translation: raw, warnings: [] };
    }
    return { statusCode: 200, headers: HEADERS, body: JSON.stringify(parsed) };
  } catch (err) {
    return { statusCode: 500, headers: HEADERS, body: JSON.stringify({ error: 'Network', detail: String(err).slice(0, 200) }) };
  }
};
