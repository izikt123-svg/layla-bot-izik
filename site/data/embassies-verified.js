/* ============================================================
   KZ ISRAELI EMBASSIES — verified addresses & phone numbers
   Source: Israel Ministry of Foreign Affairs (MFA), cross-checked.
   Curated by Itzik Tahory, 2026-05-06.

   Category: 'embassy' (new). Each embassy is also indexed by
   country code so the Emergency Button can show the right one.
   ============================================================ */
window.KZ_ISRAEL_EMBASSIES = [
  // ── North America ──
  { id:'emb-us-washington', cat:'embassy', status:'ready', verified:'full',
    continent:'north-america', cc:'US', country:'ארה"ב', city:'Washington, DC',
    name:'שגרירות ישראל בארה"ב — וושינגטון',
    place_type:'Embassy of Israel',
    addr:'3514 International Dr NW, Washington, DC 20008',
    phone:'+1-202-364-5500',
    website:'https://embassies.gov.il/washington',
    verified_at:'2026-05-06', lat:38.9367, lng:-77.0686, fame:10, comm:'שגרירות' },

  // ── Europe ──
  { id:'emb-gb-london', cat:'embassy', status:'ready', verified:'full',
    continent:'europe', cc:'GB', country:'בריטניה', city:'London',
    name:'שגרירות ישראל בלונדון',
    place_type:'Embassy of Israel',
    addr:'2 Palace Green, London W8 4QB',
    phone:'+44-20-7957-9500',
    website:'https://embassies.gov.il/london',
    verified_at:'2026-05-06', lat:51.5040, lng:-0.1944, fame:10, comm:'שגרירות' },

  { id:'emb-de-berlin', cat:'embassy', status:'ready', verified:'full',
    continent:'europe', cc:'DE', country:'גרמניה', city:'Berlin',
    name:'שגרירות ישראל בברלין',
    place_type:'Embassy of Israel',
    addr:'Auguste-Viktoria-Straße 74, 14193 Berlin',
    phone:'+49-30-89045500',
    website:'https://embassies.gov.il/berlin',
    verified_at:'2026-05-06', lat:52.4795, lng:13.2668, fame:10, comm:'שגרירות' },

  { id:'emb-fr-paris', cat:'embassy', status:'ready', verified:'full',
    continent:'europe', cc:'FR', country:'צרפת', city:'Paris',
    name:'שגרירות ישראל בפריז',
    place_type:'Embassy of Israel',
    addr:'3 Rue Rabelais, 75008 Paris',
    phone:'+33-1-40-76-55-00',
    website:'https://embassies.gov.il/paris',
    verified_at:'2026-05-06', lat:48.8714, lng:2.3128, fame:10, comm:'שגרירות' },

  { id:'emb-it-rome', cat:'embassy', status:'ready', verified:'full',
    continent:'europe', cc:'IT', country:'איטליה', city:'Rome',
    name:'שגרירות ישראל ברומא',
    place_type:'Embassy of Israel',
    addr:'Via Michele Mercati 14, 00197 Roma',
    phone:'+39-06-36198500',
    website:'https://embassies.gov.il/rome',
    verified_at:'2026-05-06', lat:41.9233, lng:12.4751, fame:9, comm:'שגרירות' },

  { id:'emb-es-madrid', cat:'embassy', status:'ready', verified:'full',
    continent:'europe', cc:'ES', country:'ספרד', city:'Madrid',
    name:'שגרירות ישראל במדריד',
    place_type:'Embassy of Israel',
    addr:'C. de Velázquez 150, 28002 Madrid',
    phone:'+34-91-782-9500',
    website:'https://embassies.gov.il/madrid',
    verified_at:'2026-05-06', lat:40.4392, lng:-3.6822, fame:9, comm:'שגרירות' },

  // ── Asia / Oceania ──
  { id:'emb-in-newdelhi', cat:'embassy', status:'ready', verified:'full',
    continent:'asia', cc:'IN', country:'הודו', city:'New Delhi',
    name:'שגרירות ישראל בניו דלהי',
    place_type:'Embassy of Israel',
    addr:'3 Dr APJ Abdul Kalam Rd, New Delhi 110011',
    phone:'+91-11-3041-4500',
    website:'https://embassies.gov.il/delhi',
    verified_at:'2026-05-06', lat:28.6004, lng:77.1990, fame:9, comm:'שגרירות' },

  { id:'emb-jp-tokyo', cat:'embassy', status:'ready', verified:'full',
    continent:'asia', cc:'JP', country:'יפן', city:'Tokyo',
    name:'שגרירות ישראל בטוקיו',
    place_type:'Embassy of Israel',
    addr:'3 Nibancho, Chiyoda City, Tokyo 102-0084',
    phone:'+81-3-3264-0911',
    website:'https://embassies.gov.il/tokyo',
    verified_at:'2026-05-06', lat:35.6850, lng:139.7370, fame:9, comm:'שגרירות' },

  { id:'emb-au-canberra', cat:'embassy', status:'ready', verified:'full',
    continent:'oceania', cc:'AU', country:'אוסטרליה', city:'Canberra',
    name:'שגרירות ישראל בקנברה',
    place_type:'Embassy of Israel',
    addr:'6 Turrana St, Yarralumla ACT 2600',
    phone:'+61-2-6215-4500',
    website:'https://embassies.gov.il/canberra',
    verified_at:'2026-05-06', lat:-35.2972, lng:149.1075, fame:9, comm:'שגרירות' },

  // ── South America ──
  { id:'emb-ar-bsas', cat:'embassy', status:'ready', verified:'full',
    continent:'south-america', cc:'AR', country:'ארגנטינה', city:'Buenos Aires',
    name:'שגרירות ישראל בבואנוס איירס',
    place_type:'Embassy of Israel',
    addr:'Av. de Mayo 701, C1070 CABA',
    phone:'+54-11-3724-4500',
    website:'https://embassies.gov.il/buenos-aires',
    verified_at:'2026-05-06', lat:-34.6093, lng:-58.3801, fame:10, comm:'שגרירות' }
];

/* Lookup map: cc → embassy (for the Emergency Button) */
window.KZ_EMBASSY_BY_CC = {};
window.KZ_ISRAEL_EMBASSIES.forEach(e => { window.KZ_EMBASSY_BY_CC[e.cc] = e; });

/* Merge into the main places array (idempotent) */
(function mergeIntoMain(){
  if (!Array.isArray(window.KZ_JEWISH_PLACES)) window.KZ_JEWISH_PLACES = [];
  const existingIds = new Set(window.KZ_JEWISH_PLACES.map(p => p.id));
  window.KZ_ISRAEL_EMBASSIES.forEach(e => {
    if (!existingIds.has(e.id)) window.KZ_JEWISH_PLACES.push(e);
  });

  // Register the new category if the global registry exists
  if (Array.isArray(window.KZ_PLACE_CATEGORIES)
      && !window.KZ_PLACE_CATEGORIES.some(c => c.key === 'embassy')){
    window.KZ_PLACE_CATEGORIES.push({
      key:'embassy', he:'שגרירות', en:'Embassy', icon:'🇮🇱', color:'#0038b8'
    });
  }
})();
