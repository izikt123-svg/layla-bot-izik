import { getStore } from '@netlify/blobs';

/*
 * kz-communities — same-origin proxy for Jewish community data.
 * Serves a curated seed catalog + any entries the team promoted from
 * kz-suggestions (Netlify Blobs). External APIs (Chabad.org, GoDaven,
 * JewishCommunity.com) can be plugged in later through fetchExternal()
 * once CSP / terms allow it; they are intentionally not called today.
 */

const BLOB_STORE = 'kz-communities-approved';

const SEED = [
  { id: 'ny-770',       city: 'ניו יורק',       country: 'ארה"ב',      region: 'ברוקלין',        type: 'chabad', name: '770 איסטרן פארקוויי',           note: 'מרכז חב"ד העולמי · מניינים כל היום.', tags: ['חב"ד', 'מניין רציף'] },
  { id: 'ny-lakewood',  city: 'ניו יורק',       country: 'ארה"ב',      region: 'לייקווד',        type: 'shiur',  name: 'בית מדרש גבוה — לייקווד',         note: 'ישיבה הגדולה בצפון אמריקה.',         tags: ['ישיבה', 'שיעורים'] },
  { id: 'ny-kosher',    city: 'ניו יורק',       country: 'ארה"ב',      region: 'מנהטן',          type: 'kosher', name: '2nd Avenue Deli',                  note: 'מוסד כשר היסטורי.',                   tags: ['כשר'] },
  { id: 'ny-jcc',       city: 'ניו יורק',       country: 'ארה"ב',      region: 'אפר ווסט סייד',  type: 'jcc',    name: 'JCC Manhattan',                    note: 'מרכז קהילתי גדול · תרבות · חינוך.',  tags: ['JCC'] },

  { id: 'par-kosher',   city: 'פריז',           country: 'צרפת',       region: 'מארה',           type: 'kosher', name: 'אלברט כהן',                        note: 'מסעדה כשרה · מאכלים מרוקאיים.',      tags: ['כשר', 'ספרדי'] },
  { id: 'par-minyan',   city: 'פריז',           country: 'צרפת',       region: 'מארה',           type: 'minyan', name: 'בית כנסת פבה',                     note: 'נוסח ספרדי · מאה שנים של תפילה.',    tags: ['ספרדי'] },
  { id: 'par-mikveh',   city: 'פריז',           country: 'צרפת',       region: '19e',            type: 'mikveh', name: 'מקווה בית חיה מושקא',              note: 'פעיל יומית בכשרות מהודרת.',          tags: ['מקווה'] },

  { id: 'ldn-goldersgreen', city: 'לונדון',     country: 'בריטניה',    region: 'גולדרס גרין',    type: 'minyan', name: 'בית כנסת מנצ׳סטר',                 note: 'מניין כל רבע שעה בבקרים.',           tags: ['מניין'] },
  { id: 'ldn-stamfordhill', city: 'לונדון',     country: 'בריטניה',    region: 'סטמפורד היל',    type: 'shiur',  name: 'Yesodei Hatorah',                  note: 'המרכז החסידי של בריטניה.',            tags: ['חסידי'] },
  { id: 'ldn-kosher',   city: 'לונדון',         country: 'בריטניה',    region: 'גולדרס גרין',    type: 'kosher', name: 'Kosher Kingdom',                   note: 'סופר כשר גדול.',                      tags: ['כשר'] },

  { id: 'buenos-amia',  city: 'בואנוס איירס',   country: 'ארגנטינה',   region: 'אונצ׳ה',         type: 'jcc',    name: 'AMIA',                             note: 'מרכז קהילתי מוביל בדרום אמריקה.',    tags: ['JCC'] },
  { id: 'buenos-chabad', city: 'בואנוס איירס',  country: 'ארגנטינה',   region: 'בלגראנו',        type: 'chabad', name: 'Chabad Central Argentina',         note: 'פעילות ענפה לקהילה דוברת ספרדית.',  tags: ['חב"ד'] },

  { id: 'syd-bondi',    city: 'סידני',          country: 'אוסטרליה',   region: 'בונדי',          type: 'minyan', name: 'Central Synagogue Bondi',          note: 'המניין המסורתי של בונדי.',            tags: ['מניין'] },
  { id: 'mel-stkilda',  city: 'מלבורן',         country: 'אוסטרליה',   region: 'סנט קילדה',      type: 'chabad', name: 'Chabad of Melbourne',              note: 'מוסד קהילתי פעיל · בתי ספר.',        tags: ['חב"ד'] },

  { id: 'ca-toronto-bathurst', city: 'טורונטו', country: 'קנדה',       region: 'ת׳ורנהיל',       type: 'kosher', name: 'רחוב Bathurst · שורת מסעדות כשרות', note: '200+ מסעדות ומכולות כשרות.',          tags: ['כשר'] },
  { id: 'ca-montreal-outremont', city: 'מונטריאול', country: 'קנדה',   region: 'אָוּטרֶמוֹנט',   type: 'shiur',  name: 'ישיבת תומכי תמימים מונטריאול',     note: 'שיעורים יומיים · לומדים מרחוק.',      tags: ['ישיבה'] },

  { id: 'jnb-glenhazel', city: 'יוהנסבורג',     country: 'דרא"פ',      region: 'גלנהייזל',       type: 'jcc',    name: 'SA Jewish Board of Deputies',      note: 'נציגות קהילתית · מוקד מידע.',         tags: ['JCC'] },
  { id: 'jnb-sandton',  city: 'יוהנסבורג',      country: 'דרא"פ',      region: 'סנדטון',         type: 'minyan', name: 'Sandton Shul',                     note: 'מניין גדול יומי.',                    tags: ['מניין'] },

  { id: 'casa-beithel', city: 'קזבלנקה',        country: 'מרוקו',      region: 'מארוקו העתיקה',  type: 'minyan', name: 'בית כנסת בית אל',                   note: 'פיוטים וחזנות מסורת מרוקו.',          tags: ['מסורת מרוקו'] },

  { id: 'mum-chabad',   city: 'מומבאי',         country: 'הודו',       region: 'Colaba',         type: 'chabad', name: 'Chabad Mumbai',                    note: 'שירות מטיילים · ארוחות שבת.',         tags: ['חב"ד', 'מטיילים'] },
  { id: 'kochi-pardesi', city: 'קוצ׳ין',        country: 'הודו',       region: 'יהודי קוצ׳ין',   type: 'minyan', name: 'בית כנסת פרדסי',                   note: 'משנת 1568 · אתר מורשת.',              tags: ['מורשת'] },

  { id: 'mow-marina',   city: 'מוסקבה',         country: 'רוסיה',      region: 'מרינה רושצ׳ה',   type: 'chabad', name: 'המרכז היהודי מרינה רושצ׳ה',        note: 'הרב בֶּרל לאזאר · מרכז ענק.',         tags: ['חב"ד'] },

  { id: 'ber-oranienburger', city: 'ברלין',     country: 'גרמניה',     region: 'מיטה',           type: 'minyan', name: 'בית הכנסת אורניינבורגר שטראסה',   note: 'שוקם מהריסות המלחמה.',                tags: ['היסטורי'] },

  { id: 'jlm-kotel',    city: 'ירושלים',        country: 'ישראל',      region: 'העיר העתיקה',    type: 'minyan', name: 'הכותל המערבי',                      note: 'מניינים 24/7 · תפילה רציפה.',         tags: ['כותל'] },
  { id: 'jlm-machane',  city: 'ירושלים',        country: 'ישראל',      region: 'מרכז',           type: 'kosher', name: 'שוק מחנה יהודה',                    note: 'עשרות מסעדות כשרות.',                 tags: ['כשר'] },
  { id: 'tlv-dizengoff', city: 'תל אביב',       country: 'ישראל',      region: 'לב העיר',        type: 'chabad', name: 'חב"ד תל אביב',                      note: 'פעילות לתיירים · תפילין ברחוב.',      tags: ['חב"ד'] },

  { id: 'rio-copacabana', city: 'ריו דה ז׳ניירו', country: 'ברזיל',    region: 'Copacabana',      type: 'chabad', name: 'Chabad Rio',                      note: 'מרכז תיירים · חגים גדולים.',           tags: ['חב"ד'] },

  { id: 'rome-ghetto',  city: 'רומא',           country: 'איטליה',     region: 'גטו ונציה',      type: 'minyan', name: 'בית הכנסת הגדול של רומא',          note: 'נוסח איטלקי ייחודי · קהילה עתיקה.',   tags: ['היסטורי'] }
];

const VALID_TYPES = new Set(['minyan', 'mikveh', 'kosher', 'chabad', 'shiur', 'jcc', 'all']);

function norm(s) {
  return String(s || '').trim().toLowerCase();
}

function matchesCity(item, q) {
  if (!q) return true;
  const qq = norm(q);
  return [item.city, item.country, item.region]
    .filter(Boolean)
    .some(v => norm(v).includes(qq));
}

async function loadApproved() {
  try {
    const store = getStore(BLOB_STORE);
    const list = await store.list();
    const entries = await Promise.all(
      (list?.blobs || []).map(b => store.get(b.key, { type: 'json' }).catch(() => null))
    );
    return entries.filter(Boolean);
  } catch {
    return [];
  }
}

async function fetchExternal() {
  // Placeholder for Chabad.org / GoDaven / JewishCommunity.com integrations.
  // Intentionally empty until CSP and API terms are finalised. The catalog
  // works perfectly as a same-origin source in the meantime.
  return [];
}

export default async (req) => {
  if (req.method !== 'GET') {
    return new Response('Method not allowed', { status: 405 });
  }

  const url = new URL(req.url);
  const city = url.searchParams.get('city') || '';
  const typeRaw = url.searchParams.get('type') || 'all';
  const type = VALID_TYPES.has(typeRaw) ? typeRaw : 'all';
  const limit = Math.min(parseInt(url.searchParams.get('limit') || '40', 10) || 40, 120);

  const [approved, external] = await Promise.all([loadApproved(), fetchExternal()]);
  const merged = [...SEED, ...approved, ...external];

  const filtered = merged.filter(item => {
    if (!item || !item.name) return false;
    if (type !== 'all' && item.type !== type) return false;
    return matchesCity(item, city);
  }).slice(0, limit);

  return Response.json(
    {
      ok: true,
      query: { city, type },
      count: filtered.length,
      source: 'seed',
      items: filtered
    },
    {
      headers: {
        'Cache-Control': 'public, max-age=300, stale-while-revalidate=3600'
      }
    }
  );
};

export const config = { path: '/.netlify/functions/kz-communities' };
