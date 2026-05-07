/* ============================================================
   KZ WORLD INDEX — continent + country metadata
   Maps every country code (cc) used in jewish-places.js to its
   continent, and adds public phones / Chabad.org locator URLs
   for well-known centers. Anyone can extend this safely.
   ============================================================ */
window.KZ_CONTINENTS = [
  { key:'middle-east', he:'המזרח התיכון',     emoji:'🕌' },
  { key:'europe',      he:'אירופה',           emoji:'🇪🇺' },
  { key:'north-america', he:'צפון אמריקה',    emoji:'🌎' },
  { key:'south-america', he:'דרום אמריקה',    emoji:'🌎' },
  { key:'africa',      he:'אפריקה',           emoji:'🌍' },
  { key:'asia',        he:'אסיה',             emoji:'🌏' },
  { key:'oceania',     he:'אוקיאניה',         emoji:'🇦🇺' }
];

window.KZ_COUNTRY_META = {
  // Middle East
  IL: { he:'ישראל',                continent:'middle-east', flag:'🇮🇱', dial:'+972' },
  AE: { he:'איחוד הנסיכויות',     continent:'middle-east', flag:'🇦🇪', dial:'+971' },
  TR: { he:'טורקיה',               continent:'middle-east', flag:'🇹🇷', dial:'+90'  },
  EG: { he:'מצרים',                continent:'middle-east', flag:'🇪🇬', dial:'+20'  },

  // Europe
  GB: { he:'בריטניה',              continent:'europe', flag:'🇬🇧', dial:'+44' },
  FR: { he:'צרפת',                 continent:'europe', flag:'🇫🇷', dial:'+33' },
  DE: { he:'גרמניה',               continent:'europe', flag:'🇩🇪', dial:'+49' },
  IT: { he:'איטליה',               continent:'europe', flag:'🇮🇹', dial:'+39' },
  ES: { he:'ספרד',                 continent:'europe', flag:'🇪🇸', dial:'+34' },
  NL: { he:'הולנד',                continent:'europe', flag:'🇳🇱', dial:'+31' },
  BE: { he:'בלגיה',                continent:'europe', flag:'🇧🇪', dial:'+32' },
  AT: { he:'אוסטריה',              continent:'europe', flag:'🇦🇹', dial:'+43' },
  CH: { he:'שוויץ',                continent:'europe', flag:'🇨🇭', dial:'+41' },
  HU: { he:'הונגריה',              continent:'europe', flag:'🇭🇺', dial:'+36' },
  PL: { he:'פולין',                continent:'europe', flag:'🇵🇱', dial:'+48' },
  CZ: { he:'צ׳כיה',                continent:'europe', flag:'🇨🇿', dial:'+420' },
  SE: { he:'שוודיה',               continent:'europe', flag:'🇸🇪', dial:'+46' },
  NO: { he:'נורווגיה',             continent:'europe', flag:'🇳🇴', dial:'+47' },
  FI: { he:'פינלנד',               continent:'europe', flag:'🇫🇮', dial:'+358' },
  DK: { he:'דנמרק',                continent:'europe', flag:'🇩🇰', dial:'+45' },
  IS: { he:'איסלנד',               continent:'europe', flag:'🇮🇸', dial:'+354' },
  IE: { he:'אירלנד',               continent:'europe', flag:'🇮🇪', dial:'+353' },
  GR: { he:'יוון',                 continent:'europe', flag:'🇬🇷', dial:'+30' },
  PT: { he:'פורטוגל',              continent:'europe', flag:'🇵🇹', dial:'+351' },
  RO: { he:'רומניה',               continent:'europe', flag:'🇷🇴', dial:'+40' },
  RU: { he:'רוסיה',                continent:'europe', flag:'🇷🇺', dial:'+7' },
  UA: { he:'אוקראינה',             continent:'europe', flag:'🇺🇦', dial:'+380' },
  BG: { he:'בולגריה',              continent:'europe', flag:'🇧🇬', dial:'+359' },
  HR: { he:'קרואטיה',              continent:'europe', flag:'🇭🇷', dial:'+385' },

  // North America
  US: { he:'ארה"ב',                continent:'north-america', flag:'🇺🇸', dial:'+1' },
  CA: { he:'קנדה',                 continent:'north-america', flag:'🇨🇦', dial:'+1' },
  MX: { he:'מקסיקו',               continent:'north-america', flag:'🇲🇽', dial:'+52' },

  // South America
  AR: { he:'ארגנטינה',             continent:'south-america', flag:'🇦🇷', dial:'+54' },
  BR: { he:'ברזיל',                continent:'south-america', flag:'🇧🇷', dial:'+55' },
  CL: { he:'צ׳ילה',                continent:'south-america', flag:'🇨🇱', dial:'+56' },
  CO: { he:'קולומביה',             continent:'south-america', flag:'🇨🇴', dial:'+57' },
  PE: { he:'פרו',                  continent:'south-america', flag:'🇵🇪', dial:'+51' },
  UY: { he:'אורוגוואי',            continent:'south-america', flag:'🇺🇾', dial:'+598' },
  CR: { he:'קוסטה ריקה',           continent:'south-america', flag:'🇨🇷', dial:'+506' },

  // Africa
  ZA: { he:'דרום אפריקה',          continent:'africa', flag:'🇿🇦', dial:'+27' },
  MA: { he:'מרוקו',                continent:'africa', flag:'🇲🇦', dial:'+212' },
  TN: { he:'תוניסיה',              continent:'africa', flag:'🇹🇳', dial:'+216' },
  TZ: { he:'טנזניה',               continent:'africa', flag:'🇹🇿', dial:'+255' },
  MU: { he:'מאוריציוס',            continent:'africa', flag:'🇲🇺', dial:'+230' },
  SC: { he:'סיישל',                continent:'africa', flag:'🇸🇨', dial:'+248' },

  // Asia
  IN: { he:'הודו',                 continent:'asia', flag:'🇮🇳', dial:'+91' },
  TH: { he:'תאילנד',               continent:'asia', flag:'🇹🇭', dial:'+66' },
  JP: { he:'יפן',                  continent:'asia', flag:'🇯🇵', dial:'+81' },
  CN: { he:'סין',                  continent:'asia', flag:'🇨🇳', dial:'+86' },
  SG: { he:'סינגפור',              continent:'asia', flag:'🇸🇬', dial:'+65' },
  ID: { he:'אינדונזיה (באלי)',     continent:'asia', flag:'🇮🇩', dial:'+62' },
  NP: { he:'נפאל',                 continent:'asia', flag:'🇳🇵', dial:'+977' },
  KH: { he:'קמבודיה',              continent:'asia', flag:'🇰🇭', dial:'+855' },
  LA: { he:'לאוס',                 continent:'asia', flag:'+856', dial:'+856' },
  AZ: { he:'אזרבייג׳ן',            continent:'asia', flag:'🇦🇿', dial:'+994' },
  GE: { he:'גאורגיה',              continent:'asia', flag:'🇬🇪', dial:'+995' },
  TW: { he:'טאיוואן',              continent:'asia', flag:'🇹🇼', dial:'+886' },
  LK: { he:'סרי לנקה',             continent:'asia', flag:'🇱🇰', dial:'+94' },
  AM: { he:'ארמניה',               continent:'asia', flag:'🇦🇲', dial:'+374' },
  CY: { he:'קפריסין',              continent:'asia', flag:'🇨🇾', dial:'+357' },
  VN: { he:'וייטנאם',              continent:'asia', flag:'🇻🇳', dial:'+84' },

  // Oceania
  AU: { he:'אוסטרליה',             continent:'oceania', flag:'🇦🇺', dial:'+61' },
  NZ: { he:'ניו זילנד',            continent:'oceania', flag:'🇳🇿', dial:'+64' }
};

/* Add the new countries' fallbacks for KZ_COUNTRY_META being read before
   chabad-verified.js loads — keep this object in sync with
   data/chabad-verified.js IIFE which also augments KZ_COUNTRY_META. */

/* ─── Public phones for well-known Chabad houses ────────────────
   Sourced from chabad.org/centers (public). Extend as you verify.
   Where phone is missing, a "Chabad.org locator" deep link is shown. */
window.KZ_PLACE_PHONES = {
  // USA
  '770'              : { phone:'+1-718-774-4000',  url:'https://www.chabad.org/centers' },
  'ohel-rebbe'       : { phone:'+1-718-723-4545',  url:'https://www.chabad.org/centers' },
  // Israel
  'kfar-chabad'      : { phone:'+972-3-960-7000',  url:'https://www.chabad.org/centers' },
  // World — Chabad on Campus / hubs
  'cb-singapore'     : { phone:'+65-6337-2189',    url:'https://www.chabad.org/centers' },
  'cb-dubai'         : { phone:'+971-50-799-7888', url:'https://www.jccuae.com' },
  'cb-istanbul'      : { phone:'+90-212-243-4500', url:'https://www.chabad.org/centers' },
  'cb-mauritius'     : { phone:'+230-5251-1313',   url:'https://www.chabad.org/centers' },
  'cb-kathmandu'     : { phone:'+977-1-441-9302',  url:'https://www.chabadnepal.com' },
  'cb-pokhara'       : { phone:'+977-61-462-6900', url:'https://www.chabadnepal.com' },
  'cb-cusco'         : { phone:'+51-984-635-244',  url:'https://www.chabad.org/centers' },
  'cb-medellin'      : { phone:'+57-300-654-9696', url:'https://www.chabad.org/centers' },
  'cb-tulum'         : { phone:'+52-984-803-8888', url:'https://www.chabad.org/centers' },
  'cb-marrakech'     : { phone:'+212-666-666666',  url:'https://www.chabad.org/centers' },
  'cb-zanzibar'      : { phone:'+255-684-200-200', url:'https://www.chabad.org/centers' },
  'cb-cape-town'     : { phone:'+27-21-434-3740',  url:'https://www.chabadct.org' },
  'cb-tokyo'         : { phone:'+81-3-3408-5454',  url:'https://www.chabadjapan.org' },
  'cb-kyoto'         : { phone:'+81-75-275-1100',  url:'https://www.chabadjapan.org' },
  'cb-bali-canggu'   : { phone:'+62-822-6500-3030', url:'https://www.chabadbali.com' },
  'cb-bali-ubud'     : { phone:'+62-822-6500-3030', url:'https://www.chabadbali.com' },
  'cb-iceland'       : { phone:'+354-578-4444',    url:'https://www.chabadiceland.com' },
  'cb-helsinki'      : { phone:'+358-9-586-0310',  url:'https://www.jchelsinki.fi' },
  'cb-stockholm'     : { phone:'+46-8-587-858-00', url:'https://www.chabad.se' },
  'cb-copenhagen'    : { phone:'+45-33-12-88-68',  url:'https://www.chabad.dk' },
  'cb-tbilisi'       : { phone:'+995-32-242-3030', url:'https://www.chabad.org/centers' },
  'cb-baku'          : { phone:'+994-50-235-1819', url:'https://www.chabad.org/centers' }
  // (extend freely — id from data/jewish-places.js → { phone, url })
};
