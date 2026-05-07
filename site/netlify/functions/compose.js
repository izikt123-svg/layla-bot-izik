/* ============================================================
   Netlify Function: /api/compose
   Meirav drafts a prayer in Hebrew (or any target lang) based on
   { intent, names, details, length, lang }.
   Returns { prayer, suggestions: [..3 alt openings] }.
   ============================================================ */
const HEADERS = {
  'Content-Type': 'application/json; charset=utf-8',
  'Cache-Control': 'no-store',
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type'
};

const SYSTEM = `את "מירב", שותפת התפילה של מרכז התפילה. תפקידך לחבר תפילה אישית, חמה, יהודית ומכבדת.
חוקים:
1. עברית קלאסית, לא רובוטית. שלב פסוקים מתהלים/תנ"ך כשמתאים — ציין מקור (כגון "תהלים כ"ג").
2. אורך לפי המבקש: short ≈ 4-6 שורות, medium ≈ 8-12, long ≈ 14-20.
3. הימנע מהבטחות הלכתיות; אם השאלה הלכתית — הוסף הערה "מומלץ להיוועץ ברב".
4. אם השפה אנגלית/צרפתית/ספרדית — תרגם בסגנון הסידור.
5. החזר תמיד JSON: { "prayer": "...", "suggestions": ["...","...","..."] }.`;

exports.handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') return { statusCode: 204, headers: HEADERS, body: '' };
  if (event.httpMethod !== 'POST')    return { statusCode: 405, headers: HEADERS, body: JSON.stringify({ error: 'Method not allowed' }) };

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return { statusCode: 500, headers: HEADERS, body: JSON.stringify({ error: 'Missing GEMINI_API_KEY' }) };

  let body;
  try { body = JSON.parse(event.body || '{}'); }
  catch { return { statusCode: 400, headers: HEADERS, body: JSON.stringify({ error: 'Invalid JSON' }) }; }

  const intent  = String(body.intent  || '').slice(0, 120);
  const names   = String(body.names   || '').slice(0, 200);
  const details = String(body.details || '').slice(0, 600);
  const length  = ['short','medium','long'].includes(body.length) ? body.length : 'medium';
  const lang    = String(body.lang || 'he').slice(0, 8);

  const userPrompt = `אנא חבר/י תפילה.
intent (קטגוריה): ${intent || 'כללי'}
שם/שמות: ${names || '(ללא)'}
פרטים מהמבקש: ${details || '(ללא)'}
length: ${length}
lang: ${lang}
החזר/י JSON תקני בלבד.`;

  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${encodeURIComponent(apiKey)}`;
  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [
          { role: 'user',  parts: [{ text: SYSTEM }] },
          { role: 'model', parts: [{ text: 'הבנתי. אני מוכנה.' }] },
          { role: 'user',  parts: [{ text: userPrompt }] }
        ],
        generationConfig: {
          temperature: 0.85, maxOutputTokens: 900,
          responseMimeType: 'application/json'
        }
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
      const m = raw.match(/\{[\s\S]*\}/);
      parsed = m ? JSON.parse(m[0]) : { prayer: raw, suggestions: [] };
    }
    return { statusCode: 200, headers: HEADERS, body: JSON.stringify(parsed) };
  } catch (err) {
    return { statusCode: 500, headers: HEADERS, body: JSON.stringify({ error: 'Network', detail: String(err).slice(0, 200) }) };
  }
};
