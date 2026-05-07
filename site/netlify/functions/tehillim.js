/* ============================================================
   Netlify Function: /api/tehillim
   Collaborative Tehillim split per session.
   GET  ?id=<sid>          → { id, done: [..], inProgress: [..] }
   POST { id, action:'claim', count }    → { chapters: [..], done: [..] }
   POST { id, action:'complete', chapter:N }

   SQL:
     create table tehillim_sessions (
       id text primary key,
       done int[] default '{}',
       in_progress int[] default '{}',
       updated_at timestamptz default now()
     );
   ============================================================ */
const HEADERS = {
  'Content-Type': 'application/json',
  'Cache-Control': 'no-store',
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type'
};
const TOTAL = 150;

async function getSession(sUrl, sKey, id){
  const r = await fetch(`${sUrl}/rest/v1/tehillim_sessions?id=eq.${encodeURIComponent(id)}&select=*`, {
    headers: { 'apikey': sKey, 'Authorization': `Bearer ${sKey}` }
  });
  if (!r.ok) return null;
  const rows = await r.json();
  return rows[0] || null;
}

async function upsertSession(sUrl, sKey, row){
  const r = await fetch(`${sUrl}/rest/v1/tehillim_sessions?on_conflict=id`, {
    method: 'POST',
    headers: {
      'apikey': sKey, 'Authorization': `Bearer ${sKey}`,
      'Content-Type': 'application/json',
      'Prefer': 'resolution=merge-duplicates,return=representation'
    },
    body: JSON.stringify(row)
  });
  if (!r.ok) return null;
  const rows = await r.json();
  return rows[0] || null;
}

exports.handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') return { statusCode: 204, headers: HEADERS, body: '' };

  const sUrl = process.env.SUPABASE_URL;
  const sKey = process.env.SUPABASE_SERVICE_KEY;
  if (!sUrl || !sKey) return { statusCode: 500, headers: HEADERS, body: JSON.stringify({ error: 'Supabase not configured' }) };

  if (event.httpMethod === 'GET'){
    const id = (event.queryStringParameters?.id || '').slice(0, 200);
    if (!id) return { statusCode: 400, headers: HEADERS, body: JSON.stringify({ error: 'Missing id' }) };
    const s = await getSession(sUrl, sKey, id);
    return { statusCode: 200, headers: HEADERS, body: JSON.stringify(s || { id, done: [], in_progress: [] }) };
  }

  if (event.httpMethod !== 'POST') return { statusCode: 405, headers: HEADERS, body: JSON.stringify({ error: 'Method not allowed' }) };

  let body;
  try { body = JSON.parse(event.body || '{}'); }
  catch { return { statusCode: 400, headers: HEADERS, body: JSON.stringify({ error: 'Invalid JSON' }) }; }
  const id = String(body.id || '').slice(0, 200);
  if (!id) return { statusCode: 400, headers: HEADERS, body: JSON.stringify({ error: 'Missing id' }) };

  let session = await getSession(sUrl, sKey, id) || { id, done: [], in_progress: [] };

  if (body.action === 'claim'){
    const count = Math.max(1, Math.min(5, parseInt(body.count, 10) || 2));
    const taken = new Set([...(session.done || []), ...(session.in_progress || [])]);
    const chapters = [];
    let guard = 0;
    while (chapters.length < count && taken.size + chapters.length < TOTAL && guard++ < 1000){
      const c = 1 + Math.floor(Math.random() * TOTAL);
      if (!taken.has(c) && !chapters.includes(c)) chapters.push(c);
    }
    session.in_progress = Array.from(new Set([...(session.in_progress || []), ...chapters]));
    session.updated_at = new Date().toISOString();
    await upsertSession(sUrl, sKey, session);
    return { statusCode: 200, headers: HEADERS, body: JSON.stringify({ chapters, done: session.done }) };
  }

  if (body.action === 'complete'){
    const ch = parseInt(body.chapter, 10);
    if (!ch || ch < 1 || ch > TOTAL) return { statusCode: 400, headers: HEADERS, body: JSON.stringify({ error: 'Bad chapter' }) };
    session.done = Array.from(new Set([...(session.done || []), ch]));
    session.in_progress = (session.in_progress || []).filter(c => c !== ch);
    session.updated_at = new Date().toISOString();
    await upsertSession(sUrl, sKey, session);
    return { statusCode: 200, headers: HEADERS, body: JSON.stringify({ ok: true, done: session.done }) };
  }

  return { statusCode: 400, headers: HEADERS, body: JSON.stringify({ error: 'Unknown action' }) };
};
