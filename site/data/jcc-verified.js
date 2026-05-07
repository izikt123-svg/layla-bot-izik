/* ============================================================
   KZ ISRAELI COMMUNITY CENTERS — verified Israeli/Jewish JCCs,
   IAC chapters, "Bait Yisraeli" hubs, etc.
   These are *community centers* (cat:'jcc'), distinct from Chabad.
   Often the lev poem of Israeli expat life in each city.

   Source: hand-curated by Itzik Tahory, 2026-05-06.
   ============================================================ */
window.KZ_ISRAELI_COMMUNITIES = [
  // ───────── Europe ─────────
  { id:'jcc-limassol-bait', cat:'jcc', status:'ready', verified:'full', continent:'asia', cc:'CY',
    country:'קפריסין', city:'Limassol',
    name:'הבית הישראלי בלימסול', place_type:'Israeli Cultural Center',
    addr:'Porfyriou Dikaiou 5, Limassol',
    phone:'+357-25-363770',
    notes:'משלב פעילות עם Chabad לימסול באותו מבנה',
    verified_at:'2026-05-06', lat:34.6786, lng:33.0419, fame:7, comm:'ישראלי' },

  { id:'jcc-berlin-fraenkelufer', cat:'jcc', status:'ready', verified:'full', continent:'europe', cc:'DE',
    country:'גרמניה', city:'Berlin',
    name:'בית ישראלי ברלין — Fraenkelufer', place_type:'Israeli Center / Historic Synagogue',
    addr:'Fraenkelufer 10, Berlin (Kreuzberg)',
    phone:'+49-30-21238833',
    notes:'בית כנסת היסטורי + פעילות ישראלית פעילה',
    verified_at:'2026-05-06', lat:52.5042, lng:13.4138, fame:8, comm:'ישראלי' },

  // ───────── North America ─────────
  { id:'jcc-nyc-manhattan', cat:'jcc', status:'ready', verified:'full', continent:'north-america', cc:'US',
    country:'ארה"ב', city:'New York (Manhattan)',
    name:'JCC Manhattan — Israeli Department', place_type:'Jewish Community Center',
    addr:'334 Amsterdam Ave, New York, NY 10023',
    phone:'+1-646-505-4444', website:'https://www.jccmanhattan.org',
    verified_at:'2026-05-06', lat:40.7861, lng:-73.9777, fame:9, comm:'ישראלי' },

  { id:'jcc-miami-sunny-isles', cat:'jcc', status:'ready', verified:'full', continent:'north-america', cc:'US',
    country:'ארה"ב', city:'Miami (Sunny Isles Beach)',
    name:'Sunny Isles Beach Community Center', place_type:'Israeli Community Center',
    addr:'18115 Biscayne Blvd, Sunny Isles Beach, FL',
    phone:'+1-305-932-4200',
    notes:'ריכוז ישראלים גדול בדרום פלורידה',
    verified_at:'2026-05-06', lat:25.9495, lng:-80.1290, fame:9, comm:'ישראלי' },

  { id:'jcc-la-shepher', cat:'jcc', status:'ready', verified:'full', continent:'north-america', cc:'US',
    country:'ארה"ב', city:'Los Angeles (West Hills)',
    name:'Shepher Community Center', place_type:'Jewish Community Center',
    addr:'22622 Vanowen St, West Hills, CA',
    phone:'+1-818-710-3995',
    verified_at:'2026-05-06', lat:34.1953, lng:-118.5912, fame:7, comm:'ישראלי' },

  { id:'jcc-paloalto-ofjcc', cat:'jcc', status:'ready', verified:'full', continent:'north-america', cc:'US',
    country:'ארה"ב', city:'Palo Alto',
    name:'Oshman Family JCC (OFJCC) — Silicon Valley', place_type:'Jewish Community Center',
    addr:'3921 Fabian Way, Palo Alto, CA 94303',
    phone:'+1-650-223-8700', website:'https://www.paloaltojcc.org',
    notes:'לב הקהילה הישראלית בסיליקון ואלי',
    verified_at:'2026-05-06', lat:37.4148, lng:-122.1208, fame:9, comm:'ישראלי' },

  { id:'jcc-toronto-schwartz', cat:'jcc', status:'ready', verified:'full', continent:'north-america', cc:'CA',
    country:'קנדה', city:'Toronto',
    name:'Schwartz/Reisman Centre', place_type:'Jewish Community Center',
    addr:'9600 Bathurst St, Toronto, ON',
    phone:'+1-905-303-1821',
    verified_at:'2026-05-06', lat:43.8294, lng:-79.4548, fame:8, comm:'ישראלי' }
];

/* Patch existing JW3 London (id: jcc-london) with the verified phone,
   merge new Israeli communities into the main places array, and ensure
   every used country exists in KZ_COUNTRY_META. */
(function mergeIntoMain(){
  if (!Array.isArray(window.KZ_JEWISH_PLACES)) window.KZ_JEWISH_PLACES = [];

  // Patch JW3 London if it already exists
  const jw3 = window.KZ_JEWISH_PLACES.find(p => p.id === 'jcc-london');
  if (jw3){
    jw3.name      = 'JW3 London — Israeli Programs';
    jw3.phone     = '+44-20-7433-8988';
    jw3.website   = 'https://www.jw3.org.uk';
    jw3.status    = 'ready';
    jw3.verified  = 'full';
    jw3.continent = 'europe';
    jw3.place_type = 'Jewish Community Center';
    jw3.comm      = 'ישראלי';
    jw3.verified_at = '2026-05-06';
  }

  const existingIds = new Set(window.KZ_JEWISH_PLACES.map(p => p.id));
  window.KZ_ISRAELI_COMMUNITIES.forEach(p => {
    if (!existingIds.has(p.id)) window.KZ_JEWISH_PLACES.push(p);
  });
})();
