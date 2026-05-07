/* ============================================================
   Netlify Function: /api/heatmap
   Returns a list of {n, lat, lng, w} cities — recent prayer hot
   spots — derived from the prayers table if available, with a
   curated fallback so the visual never breaks.

   Optional Supabase shape:
     prayers (id, lat, lng, city, created_at)
   ============================================================ */
const HEADERS = {
  'Content-Type': 'application/json',
  'Cache-Control': 'public, max-age=10, s-maxage=10',
  'Access-Control-Allow-Origin': '*'
};

const FALLBACK = [
  {n:'ירושלים',lat:31.78,lng:35.22,w:9},{n:'תל אביב',lat:32.07,lng:34.78,w:7},
  {n:'New York',lat:40.71,lng:-74.00,w:8},{n:'Los Angeles',lat:34.05,lng:-118.24,w:6},
  {n:'Miami',lat:25.77,lng:-80.19,w:5},{n:'London',lat:51.51,lng:-0.13,w:6},
  {n:'Paris',lat:48.86,lng:2.35,w:5},{n:'Buenos Aires',lat:-34.60,lng:-58.38,w:5},
  {n:'Sydney',lat:-33.86,lng:151.20,w:4},{n:'Cape Town',lat:-33.92,lng:18.42,w:3},
  {n:'Moscow',lat:55.75,lng:37.62,w:4},{n:'Toronto',lat:43.65,lng:-79.38,w:4},
  {n:'Antwerp',lat:51.22,lng:4.40,w:4},{n:'São Paulo',lat:-23.55,lng:-46.63,w:4},
  {n:'Berlin',lat:52.52,lng:13.40,w:3},{n:'Rome',lat:41.89,lng:12.48,w:3},
  {n:'Mexico City',lat:19.43,lng:-99.13,w:2},{n:'Dubai',lat:25.07,lng:55.13,w:2},
  {n:'Bangkok',lat:13.75,lng:100.50,w:2},{n:'Tokyo',lat:35.65,lng:139.75,w:2}
];

exports.handler = async () => {
  const sUrl = process.env.SUPABASE_URL;
  const sKey = process.env.SUPABASE_SERVICE_KEY;
  if (!sUrl || !sKey){
    return { statusCode: 200, headers: HEADERS, body: JSON.stringify({ cities: FALLBACK }) };
  }

  // Last 24h aggregated to integer-rounded coords (~111 km per integer).
  const since = new Date(Date.now() - 24 * 3600 * 1000).toISOString();
  const url = `${sUrl}/rest/v1/prayers?select=lat,lng,city&created_at=gte.${encodeURIComponent(since)}&limit=2000`;
  try {
    const r = await fetch(url, { headers: { 'apikey': sKey, 'Authorization': `Bearer ${sKey}` } });
    if (!r.ok) throw new Error('db');
    const rows = await r.json();
    const map = new Map(); // key="lat,lng rounded" -> count
    for (const row of rows){
      if (row.lat == null || row.lng == null) continue;
      const k = `${Math.round(row.lat * 2) / 2},${Math.round(row.lng * 2) / 2}`;
      const e = map.get(k) || { n: row.city || '', lat: row.lat, lng: row.lng, w: 0 };
      e.w += 1;
      map.set(k, e);
    }
    const cities = Array.from(map.values()).sort((a,b) => b.w - a.w).slice(0, 80);
    if (!cities.length) return { statusCode: 200, headers: HEADERS, body: JSON.stringify({ cities: FALLBACK }) };
    return { statusCode: 200, headers: HEADERS, body: JSON.stringify({ cities }) };
  } catch {
    return { statusCode: 200, headers: HEADERS, body: JSON.stringify({ cities: FALLBACK }) };
  }
};
