/* ============================================================
   Netlify Function: /api/og-image
   Generates an SVG social-share card on the fly.
   Why SVG: zero deps, fast, works as Open Graph image (most
   crawlers accept SVG; we also serve image/png via the CDN
   layer below if you prefer — see notes).

   Query:
     ?title=...&subtitle=...&category=רפואה&theme=gold
   ============================================================ */
const HEADERS = {
  'Content-Type': 'image/svg+xml; charset=utf-8',
  'Cache-Control': 'public, max-age=86400, s-maxage=604800, immutable',
  'Access-Control-Allow-Origin': '*'
};

const CAT_EMOJI = {
  'רפואה': '🕯', 'פרנסה': '💰', 'זיווג': '💍',
  'שלום בית': '🏡', 'ילדים': '👶', 'הצלחה': '✨',
  'תהילים': '📖', 'יארצייט': '🕯', 'הודיה': '🙏'
};

// Localized brand strings keyed by lang
const I18N = {
  he: { brand: 'מרכז התפילה', sub: 'my-hom.net · רשת של אור, תקווה ואמונה', cta: 'הצטרף לתפילה →' },
  en: { brand: 'Merkaz HaTfila',  sub: 'my-hom.net · A network of light, hope and faith', cta: 'Join the prayer →' },
  fr: { brand: 'Centre de Prière', sub: 'my-hom.net · Un réseau de lumière, d\'espoir et de foi', cta: 'Rejoindre la prière →' },
  es: { brand: 'Centro de Oración', sub: 'my-hom.net · Una red de luz, esperanza y fe', cta: 'Unirse a la oración →' },
  ru: { brand: 'Центр молитвы', sub: 'my-hom.net · Сеть света, надежды и веры', cta: 'Присоединиться к молитве →' },
  ar: { brand: 'مركز الصلاة', sub: 'my-hom.net · شبكة من النور والأمل والإيمان', cta: 'انضم إلى الصلاة →' },
  pt: { brand: 'Centro de Oração', sub: 'my-hom.net · Uma rede de luz, esperança e fé', cta: 'Junte-se à oração →' },
  de: { brand: 'Gebetszentrum', sub: 'my-hom.net · Ein Netz aus Licht, Hoffnung und Glauben', cta: 'Beteilige dich am Gebet →' }
};
const RTL = new Set(['he','ar']);

function esc(s){
  return String(s ?? '').replace(/[&<>"']/g, m => ({
    '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'
  }[m]));
}

// Wrap text into multiple <tspan> lines, preferring breaks at spaces.
function wrap(text, maxChars){
  text = (text || '').trim();
  if (!text) return [];
  const words = text.split(/\s+/);
  const lines = [];
  let cur = '';
  for (const w of words){
    if ((cur + ' ' + w).trim().length > maxChars){
      if (cur) lines.push(cur);
      cur = w;
    } else {
      cur = (cur ? cur + ' ' : '') + w;
    }
    if (lines.length >= 3) break;
  }
  if (cur && lines.length < 4) lines.push(cur);
  return lines.slice(0, 4);
}

exports.handler = async (event) => {
  const q = event.queryStringParameters || {};
  const lang = String(q.lang || 'he').slice(0, 5).toLowerCase();
  const t    = I18N[lang] || I18N.he;
  const dir  = RTL.has(lang) ? 'rtl' : 'ltr';
  const anchor = dir === 'rtl' ? 'end' : 'start';
  const startX = 80;
  const endX   = 1120;
  const title    = (q.title    || (lang === 'he' ? 'בקשת תפילה' : 'Prayer request')).slice(0, 120);
  const subtitle = (q.subtitle || t.sub).slice(0, 200);
  const cat      = (q.category || '').slice(0, 30);
  const emoji    = CAT_EMOJI[cat] || '🕯';
  const theme    = (q.theme || 'gold');

  const palette = theme === 'night'
    ? { bg1:'#0a1226', bg2:'#1a2952', accent:'#7aaeff', ink:'#eaf0ff' }
    : { bg1:'#0B1F3A', bg2:'#14315b', accent:'#f1d597', ink:'#f6e6c2' };

  const titleLines    = wrap(title, 26);
  const subtitleLines = wrap(subtitle, 50).slice(0, 2);

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 630" role="img" aria-label="${esc(title)}">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%"  stop-color="${palette.bg1}"/>
      <stop offset="100%" stop-color="${palette.bg2}"/>
    </linearGradient>
    <radialGradient id="halo" cx="80%" cy="20%" r="70%">
      <stop offset="0%"  stop-color="${palette.accent}" stop-opacity=".30"/>
      <stop offset="80%" stop-color="${palette.accent}" stop-opacity="0"/>
    </radialGradient>
    <linearGradient id="gold" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%"  stop-color="${palette.accent}"/>
      <stop offset="100%" stop-color="#d4b07a"/>
    </linearGradient>
  </defs>
  <rect width="1200" height="630" fill="url(#bg)"/>
  <rect width="1200" height="630" fill="url(#halo)"/>

  <!-- Magen David ornament -->
  <g transform="translate(990,150)" opacity=".25">
    <polygon points="0,-90 78,45 -78,45" fill="none" stroke="${palette.accent}" stroke-width="3"/>
    <polygon points="0,90 78,-45 -78,-45" fill="none" stroke="${palette.accent}" stroke-width="3"/>
  </g>

  <!-- Brand bar -->
  <g transform="translate(${dir === 'rtl' ? endX : startX},80)">
    <text x="0" y="0"  text-anchor="${anchor}" fill="${palette.accent}" font-family="Frank Ruhl Libre, serif" font-size="24" font-weight="700" direction="${dir}">${esc(t.brand)}</text>
    <text x="0" y="32" text-anchor="${anchor}" fill="${palette.ink}" opacity=".55" font-family="Heebo, sans-serif" font-size="18" direction="${dir}">${esc(t.sub)}</text>
  </g>

  ${cat ? `
  <!-- Category pill -->
  <g transform="translate(80,160)">
    <rect x="0" y="0" rx="22" ry="22" width="${cat.length * 22 + 70}" height="44" fill="${palette.accent}" opacity=".18" stroke="${palette.accent}" stroke-opacity=".55" stroke-width="1.5"/>
    <text x="20" y="29" font-family="Heebo, sans-serif" font-size="22" fill="${palette.accent}">${emoji} ${esc(cat)}</text>
  </g>` : ''}

  <!-- Title -->
  <g transform="translate(80,${cat ? 260 : 220})" font-family="Frank Ruhl Libre, serif" fill="${palette.ink}">
    ${titleLines.map((line, i) => `<text x="0" y="${i * 78}" font-size="68" font-weight="700">${esc(line)}</text>`).join('')}
  </g>

  <!-- Subtitle -->
  <g transform="translate(80,${(cat ? 260 : 220) + titleLines.length * 78 + 30})" font-family="Heebo, sans-serif" fill="${palette.ink}" opacity=".75">
    ${subtitleLines.map((line, i) => `<text x="0" y="${i * 38}" font-size="28">${esc(line)}</text>`).join('')}
  </g>

  <!-- Bottom CTA -->
  <g transform="translate(80,560)">
    <rect x="0" y="0" rx="14" ry="14" width="280" height="50" fill="url(#gold)"/>
    <text x="140" y="33" text-anchor="middle" font-family="Heebo, sans-serif" font-size="22" font-weight="700" fill="${palette.bg1}" direction="${dir}">${esc(t.cta)}</text>
  </g>

  <!-- Domain badge -->
  <text x="1120" y="590" text-anchor="end" font-family="Heebo, sans-serif" font-size="20" fill="${palette.accent}" opacity=".6">my-hom.net</text>
</svg>`;

  return { statusCode: 200, headers: HEADERS, body: svg };
};
