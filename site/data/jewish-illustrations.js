/* ============================================================
   KZ JEWISH ILLUSTRATIONS — 12 custom SVG scenes
   Self-contained, instantly loaded, no CDN dependency.
   Each is a function that takes (width, height) → SVG string.

   Usage:
     <img src="${KZ_ILLUSTRATIONS.kotel({w:600,h:400})}">
     KZ_ILLUSTRATIONS.render('kotel', element);
   ============================================================ */
(function(){
  'use strict';

  function dataUrl(svg){
    return 'data:image/svg+xml;utf8,' + encodeURIComponent(svg);
  }

  const SCENES = {
    /* 1. Kotel — Western Wall */
    kotel: ({ w=800, h=500 }={}) => `<svg viewBox="0 0 800 500" xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}">
      <defs>
        <linearGradient id="ksky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#fde8c6"/>
          <stop offset="60%" stop-color="#f59e0b"/>
          <stop offset="100%" stop-color="#7c2d12"/>
        </linearGradient>
        <linearGradient id="kstone" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#d4a76a"/>
          <stop offset="100%" stop-color="#7a4a1a"/>
        </linearGradient>
      </defs>
      <rect width="800" height="500" fill="url(#ksky)"/>
      <!-- Sun glow -->
      <circle cx="650" cy="120" r="80" fill="#fef3c7" opacity=".4"/>
      <circle cx="650" cy="120" r="42" fill="#fef3c7" opacity=".7"/>
      <!-- Distant Old City -->
      <g opacity=".4" fill="#5a3c14">
        <rect x="0" y="270" width="800" height="60"/>
        <rect x="120" y="240" width="40" height="30"/>
        <rect x="180" y="250" width="30" height="20"/>
        <circle cx="280" cy="240" r="22"/>
        <rect x="330" y="240" width="50" height="30"/>
        <rect x="430" y="245" width="40" height="25"/>
        <circle cx="540" cy="240" r="18"/>
        <rect x="600" y="248" width="40" height="22"/>
        <rect x="680" y="245" width="35" height="25"/>
      </g>
      <!-- Wall -->
      <g>
        ${Array.from({length:9}).map((_,r)=>{
          const y = 330 + r * 22;
          const cols = 16 + (r%2);
          const rowOffset = r%2 ? 25 : 0;
          return Array.from({length:cols}).map((_,c)=>{
            const sw = 800/cols;
            return `<rect x="${c*sw + rowOffset}" y="${y}" width="${sw-2}" height="20" rx="2" fill="${r%3===0?'#c89a5a':'url(#kstone)'}" stroke="#5a3c14" stroke-width=".4"/>`;
          }).join('');
        }).join('')}
      </g>
      <!-- Notes in cracks -->
      <g fill="#fff8e8" opacity=".75">
        ${Array.from({length:18}).map(()=>{
          const x = 80 + Math.random()*640;
          const y = 350 + Math.random()*150;
          const rot = (Math.random()-.5)*20;
          return `<rect x="${x}" y="${y}" width="${4+Math.random()*4}" height="${6+Math.random()*4}" transform="rotate(${rot} ${x} ${y})"/>`;
        }).join('')}
      </g>
      <!-- Plants on wall -->
      <g fill="#5b8a3a" opacity=".7">
        <path d="M 80 340 Q 85 318 90 340 Z"/>
        <path d="M 720 345 Q 725 320 730 345 Z"/>
        <path d="M 400 332 Q 405 312 410 332 Z"/>
      </g>
      <!-- Doves -->
      <g fill="#fff" opacity=".88">
        <ellipse cx="180" cy="150" rx="8" ry="3.5"/>
        <path d="M 172 150 Q 180 144 188 150 Z"/>
        <ellipse cx="500" cy="180" rx="7" ry="3"/>
        <path d="M 493 180 Q 500 175 507 180 Z"/>
      </g>
    </svg>`,

    /* 2. Kotel — Western Wall, simplified card */
    kotelCard: (opts={}) => SCENES.kotel(opts),

    /* 3. Cave of Patriarchs (Mearat HaMachpela) */
    machpela: ({ w=800, h=500 }={}) => `<svg viewBox="0 0 800 500" xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}">
      <defs>
        <linearGradient id="msky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#fce5b8"/>
          <stop offset="100%" stop-color="#9b5e1c"/>
        </linearGradient>
      </defs>
      <rect width="800" height="500" fill="url(#msky)"/>
      <!-- Hills -->
      <path d="M0,380 L200,320 L400,360 L600,310 L800,360 L800,500 L0,500 Z" fill="#7a4a1a" opacity=".6"/>
      <!-- Building base -->
      <rect x="180" y="220" width="440" height="200" fill="#c89a5a" stroke="#5a3c14" stroke-width="2"/>
      ${Array.from({length:9}).map((_,i)=>`<line x1="180" y1="${240+i*22}" x2="620" y2="${240+i*22}" stroke="#5a3c14" stroke-width=".5" opacity=".5"/>`).join('')}
      <!-- Crenellations -->
      <g fill="#c89a5a" stroke="#5a3c14" stroke-width="2">
        ${Array.from({length:14}).map((_,i)=>`<rect x="${180+i*32}" y="200" width="20" height="20"/>`).join('')}
      </g>
      <!-- Arched entrance -->
      <path d="M 360 420 L 360 320 Q 360 290 400 290 Q 440 290 440 320 L 440 420 Z" fill="#3a2a18"/>
      <!-- Window arches -->
      <path d="M 240 290 Q 240 260 270 260 Q 300 260 300 290 L 300 330 L 240 330 Z" fill="#1a3358"/>
      <path d="M 500 290 Q 500 260 530 260 Q 560 260 560 290 L 560 330 L 500 330 Z" fill="#1a3358"/>
      <!-- Minarets -->
      <rect x="220" y="100" width="40" height="100" fill="#c89a5a" stroke="#5a3c14"/>
      <polygon points="220,100 260,100 240,60" fill="#5a3c14"/>
      <circle cx="240" cy="68" r="6" fill="#fef3c7"/>
      <rect x="540" y="120" width="40" height="80" fill="#c89a5a" stroke="#5a3c14"/>
      <polygon points="540,120 580,120 560,90" fill="#5a3c14"/>
      <!-- Dome -->
      <path d="M 380 220 Q 400 160 420 220 Z" fill="#7c5e2c"/>
      <circle cx="400" cy="155" r="8" fill="#fef3c7"/>
    </svg>`,

    /* 4. Rachel's Tomb */
    rachel: ({ w=800, h=500 }={}) => `<svg viewBox="0 0 800 500" xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}">
      <defs>
        <linearGradient id="rsky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#fef3c7"/>
          <stop offset="60%" stop-color="#f59e0b"/>
          <stop offset="100%" stop-color="#1e1b4b"/>
        </linearGradient>
      </defs>
      <rect width="800" height="500" fill="url(#rsky)"/>
      <!-- Ground -->
      <rect y="380" width="800" height="120" fill="#5a3c14"/>
      <!-- Building -->
      <rect x="280" y="260" width="240" height="140" fill="#fff8e8" stroke="#7a4a1a" stroke-width="2"/>
      <!-- Dome -->
      <path d="M 280 260 Q 400 140 520 260 Z" fill="#fff8e8" stroke="#7a4a1a" stroke-width="2"/>
      <circle cx="400" cy="155" r="10" fill="#fef3c7"/>
      <!-- Arched door -->
      <path d="M 380 400 L 380 320 Q 380 300 400 300 Q 420 300 420 320 L 420 400 Z" fill="#3a2a18"/>
      <!-- Stars -->
      <g fill="#fef3c7" opacity=".9">
        ${Array.from({length:30}).map(()=>{
          const x = Math.random()*800, y = Math.random()*200;
          return `<circle cx="${x}" cy="${y}" r="${.5+Math.random()*1.5}"/>`;
        }).join('')}
      </g>
    </svg>`,

    /* 5. Shabbat candles */
    candles: ({ w=600, h=400 }={}) => `<svg viewBox="0 0 600 400" xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}">
      <defs>
        <radialGradient id="cglow" cx="50%" cy="40%" r="60%">
          <stop offset="0%" stop-color="#fff3c0" stop-opacity=".8"/>
          <stop offset="100%" stop-color="#fff3c0" stop-opacity="0"/>
        </radialGradient>
        <linearGradient id="cwax" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#fff7e0"/>
          <stop offset="100%" stop-color="#d4a76a"/>
        </linearGradient>
      </defs>
      <rect width="600" height="400" fill="#0B1F3A"/>
      <!-- Big glow -->
      <ellipse cx="300" cy="200" rx="280" ry="220" fill="url(#cglow)"/>
      <!-- Candle 1 (left) -->
      <rect x="200" y="200" width="36" height="160" fill="url(#cwax)" stroke="#9c7a40"/>
      <rect x="216" y="190" width="4" height="14" fill="#5a3c14"/>
      <ellipse cx="218" cy="170" rx="14" ry="22" fill="#ffb648"/>
      <ellipse cx="218" cy="175" rx="7" ry="12" fill="#ffe28a"/>
      <ellipse cx="218" cy="180" rx="3" ry="6" fill="#fffce8"/>
      <!-- Candle 2 (right) -->
      <rect x="364" y="200" width="36" height="160" fill="url(#cwax)" stroke="#9c7a40"/>
      <rect x="380" y="190" width="4" height="14" fill="#5a3c14"/>
      <ellipse cx="382" cy="170" rx="14" ry="22" fill="#ffb648"/>
      <ellipse cx="382" cy="175" rx="7" ry="12" fill="#ffe28a"/>
      <ellipse cx="382" cy="180" rx="3" ry="6" fill="#fffce8"/>
      <!-- Lace on the table -->
      <rect x="100" y="358" width="400" height="6" fill="#9c7a40" opacity=".6"/>
      <path d="M 100 364 Q 110 374 120 364 Q 130 374 140 364 Q 150 374 160 364 Q 170 374 180 364 Q 190 374 200 364 Q 210 374 220 364 Q 230 374 240 364 Q 250 374 260 364 Q 270 374 280 364 Q 290 374 300 364 Q 310 374 320 364 Q 330 374 340 364 Q 350 374 360 364 Q 370 374 380 364 Q 390 374 400 364 Q 410 374 420 364 Q 430 374 440 364 Q 450 374 460 364 Q 470 374 480 364 Q 490 374 500 364" stroke="#9c7a40" fill="none" opacity=".5"/>
    </svg>`,

    /* 6. Challah loaves */
    challah: ({ w=600, h=400 }={}) => `<svg viewBox="0 0 600 400" xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}">
      <defs>
        <linearGradient id="hbread" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#f4c47a"/>
          <stop offset="100%" stop-color="#a86530"/>
        </linearGradient>
      </defs>
      <rect width="600" height="400" fill="#fef3c7"/>
      <!-- Linen -->
      <rect x="50" y="180" width="500" height="200" fill="#fff8e8" stroke="#9c7a40" stroke-width="1.5" opacity=".8"/>
      <!-- Challah body (braided) -->
      <ellipse cx="300" cy="220" rx="200" ry="60" fill="url(#hbread)" stroke="#7a4a1a" stroke-width="2"/>
      <!-- Braid pattern -->
      <g stroke="#7a4a1a" stroke-width="2" fill="none" opacity=".55">
        <path d="M 120 220 Q 140 200 160 220 Q 180 240 200 220 Q 220 200 240 220 Q 260 240 280 220 Q 300 200 320 220 Q 340 240 360 220 Q 380 200 400 220 Q 420 240 440 220 Q 460 200 480 220"/>
      </g>
      <!-- Sesame seeds -->
      <g fill="#fffaf0">
        ${Array.from({length:80}).map(()=>{
          const x = 110 + Math.random()*380;
          const y = 175 + Math.random()*50;
          return `<circle cx="${x}" cy="${y}" r=".7"/>`;
        }).join('')}
      </g>
      <!-- Wine cup -->
      <g transform="translate(80,250)">
        <path d="M 0 30 Q 0 0 25 0 L 55 0 Q 80 0 80 30 L 70 70 L 10 70 Z" fill="#7c2d12"/>
        <ellipse cx="40" cy="3" rx="35" ry="6" fill="#5a1c0a"/>
        <rect x="35" y="70" width="10" height="20" fill="#7c2d12"/>
        <ellipse cx="40" cy="92" rx="20" ry="5" fill="#7c2d12"/>
      </g>
    </svg>`,

    /* 7. Menorah */
    menorah: ({ w=600, h=400 }={}) => `<svg viewBox="0 0 600 400" xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}">
      <defs>
        <linearGradient id="mngold" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#f1d597"/>
          <stop offset="100%" stop-color="#9c6f1c"/>
        </linearGradient>
      </defs>
      <rect width="600" height="400" fill="#0B1F3A"/>
      <radialGradient id="mnglow" cx="50%" cy="30%" r="50%"><stop offset="0%" stop-color="#fff3c0" stop-opacity=".55"/><stop offset="100%" stop-opacity="0"/></radialGradient>
      <ellipse cx="300" cy="120" rx="280" ry="140" fill="url(#mnglow)"/>
      <!-- Branches (7) -->
      <g stroke="url(#mngold)" stroke-width="6" fill="none" stroke-linecap="round">
        <line x1="300" y1="320" x2="300" y2="180"/>
        <path d="M 300 220 Q 240 180 240 230 L 240 180"/>
        <path d="M 300 240 Q 200 200 180 250 L 180 180"/>
        <path d="M 300 260 Q 160 220 130 270 L 130 180"/>
        <path d="M 300 220 Q 360 180 360 230 L 360 180"/>
        <path d="M 300 240 Q 400 200 420 250 L 420 180"/>
        <path d="M 300 260 Q 440 220 470 270 L 470 180"/>
      </g>
      <!-- Base -->
      <rect x="240" y="320" width="120" height="14" fill="url(#mngold)"/>
      <rect x="220" y="334" width="160" height="20" rx="4" fill="url(#mngold)"/>
      <!-- Flames -->
      ${[130,180,240,300,360,420,470].map(x=>`
        <ellipse cx="${x}" cy="170" rx="6" ry="14" fill="#ffb648"/>
        <ellipse cx="${x}" cy="173" rx="3" ry="8" fill="#ffe28a"/>
        <ellipse cx="${x}" cy="176" rx="1.5" ry="4" fill="#fffce8"/>
      `).join('')}
    </svg>`,

    /* 8. Shofar */
    shofar: ({ w=600, h=400 }={}) => `<svg viewBox="0 0 600 400" xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}">
      <defs>
        <linearGradient id="shorn" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stop-color="#fef3c7"/>
          <stop offset="50%" stop-color="#d4a76a"/>
          <stop offset="100%" stop-color="#5a3c14"/>
        </linearGradient>
      </defs>
      <rect width="600" height="400" fill="#fef3c7"/>
      <!-- Shofar body curved -->
      <path d="M 100 200 Q 200 100 350 150 Q 480 190 510 230 L 490 250 Q 460 230 350 190 Q 220 150 130 240 Z" fill="url(#shorn)" stroke="#3a2a18" stroke-width="2"/>
      <!-- Texture lines -->
      <g stroke="#3a2a18" stroke-width=".7" fill="none" opacity=".5">
        <path d="M 130 200 Q 200 130 320 165"/>
        <path d="M 160 215 Q 230 155 340 180"/>
        <path d="M 190 225 Q 260 175 360 195"/>
      </g>
      <!-- Sound waves -->
      <g stroke="#7a4a1a" stroke-width="2" fill="none" opacity=".7">
        <path d="M 530 220 Q 555 230 565 220"/>
        <path d="M 535 240 Q 565 250 580 240"/>
        <path d="M 525 260 Q 560 270 575 260"/>
      </g>
    </svg>`,

    /* 9. Magen David */
    magenDavid: ({ w=400, h=400 }={}) => `<svg viewBox="0 0 400 400" xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}">
      <defs>
        <linearGradient id="mdg" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#f1d597"/>
          <stop offset="100%" stop-color="#7a5a23"/>
        </linearGradient>
      </defs>
      <rect width="400" height="400" fill="#0B1F3A"/>
      <radialGradient id="mdgl" cx="50%" cy="50%" r="50%"><stop offset="0%" stop-color="#f1d597" stop-opacity=".3"/><stop offset="100%" stop-opacity="0"/></radialGradient>
      <circle cx="200" cy="200" r="180" fill="url(#mdgl)"/>
      <g fill="none" stroke="url(#mdg)" stroke-width="6" stroke-linejoin="round">
        <polygon points="200,60 290,210 110,210"/>
        <polygon points="200,340 290,190 110,190"/>
      </g>
    </svg>`,

    /* 10. Sefer Torah */
    torah: ({ w=600, h=400 }={}) => `<svg viewBox="0 0 600 400" xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}">
      <defs>
        <linearGradient id="tparch" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#fff8e8"/>
          <stop offset="100%" stop-color="#d4a76a"/>
        </linearGradient>
        <linearGradient id="tvel" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#7c2d12"/>
          <stop offset="100%" stop-color="#3a0f02"/>
        </linearGradient>
      </defs>
      <rect width="600" height="400" fill="#1e1b4b"/>
      <!-- Crown -->
      <g transform="translate(250,40)">
        <path d="M 0 60 L 20 0 L 40 50 L 60 0 L 80 50 L 100 0 L 100 60 Z" fill="#f1d597" stroke="#7a5a23" stroke-width="2"/>
        <circle cx="20" cy="0" r="4" fill="#f59e0b"/>
        <circle cx="60" cy="0" r="4" fill="#dc2626"/>
        <circle cx="100" cy="0" r="4" fill="#16a34a"/>
        <rect x="0" y="55" width="100" height="10" fill="#f1d597" stroke="#7a5a23" stroke-width="2"/>
      </g>
      <!-- Velvet cover -->
      <rect x="180" y="150" width="240" height="220" rx="8" fill="url(#tvel)" stroke="#7a5a23" stroke-width="2"/>
      <!-- Lions of Judah (silhouettes) -->
      <g fill="#f1d597" opacity=".85">
        <path d="M 220 220 Q 230 200 240 220 L 245 250 Q 230 245 220 250 Z"/>
        <path d="M 380 220 Q 370 200 360 220 L 355 250 Q 370 245 380 250 Z"/>
      </g>
      <!-- Tablet -->
      <g transform="translate(265,280)">
        <rect x="0" y="0" width="30" height="50" rx="14" fill="#f1d597" stroke="#7a5a23"/>
        <rect x="40" y="0" width="30" height="50" rx="14" fill="#f1d597" stroke="#7a5a23"/>
      </g>
      <!-- Handles -->
      <rect x="170" y="140" width="260" height="14" fill="#7a5a23"/>
      <rect x="170" y="370" width="260" height="14" fill="#7a5a23"/>
    </svg>`,

    /* 11. Synagogue exterior */
    synagogue: ({ w=800, h=500 }={}) => `<svg viewBox="0 0 800 500" xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}">
      <defs>
        <linearGradient id="ssky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#1e3a8a"/>
          <stop offset="100%" stop-color="#0B1F3A"/>
        </linearGradient>
      </defs>
      <rect width="800" height="500" fill="url(#ssky)"/>
      <!-- Stars -->
      <g fill="#fef3c7" opacity=".9">
        ${Array.from({length:60}).map(()=>`<circle cx="${Math.random()*800}" cy="${Math.random()*250}" r="${.5+Math.random()*1.5}"/>`).join('')}
      </g>
      <!-- Building -->
      <rect x="200" y="220" width="400" height="240" fill="#7a5a23"/>
      <rect x="200" y="220" width="400" height="240" fill="none" stroke="#3a2a18" stroke-width="3"/>
      <!-- Big window with Magen David -->
      <circle cx="400" cy="320" r="60" fill="#fef3c7" opacity=".7"/>
      <g stroke="#7a5a23" stroke-width="3" fill="none">
        <polygon points="400,275 433,335 367,335"/>
        <polygon points="400,365 433,305 367,305"/>
      </g>
      <!-- Door -->
      <path d="M 360 460 L 360 400 Q 360 380 400 380 Q 440 380 440 400 L 440 460 Z" fill="#3a2a18"/>
      <!-- Side windows -->
      <rect x="240" y="280" width="40" height="60" rx="20" fill="#fef3c7" opacity=".55"/>
      <rect x="520" y="280" width="40" height="60" rx="20" fill="#fef3c7" opacity=".55"/>
      <!-- Steps -->
      <rect x="340" y="460" width="120" height="10" fill="#3a2a18"/>
      <rect x="320" y="470" width="160" height="10" fill="#3a2a18"/>
      <!-- Roof Magen David -->
      <g transform="translate(385,160)" fill="none" stroke="#f1d597" stroke-width="3">
        <polygon points="15,0 30,25 0,25"/>
        <polygon points="15,30 30,5 0,5"/>
      </g>
    </svg>`,

    /* 12. Bukhara — generic Chabad House sign */
    chabadHouse: ({ w=600, h=400 }={}) => `<svg viewBox="0 0 600 400" xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}">
      <rect width="600" height="400" fill="#7a3e0d"/>
      <!-- House frame -->
      <rect x="100" y="160" width="400" height="200" fill="#fef3c7" stroke="#3a2a18" stroke-width="3"/>
      <!-- Roof -->
      <polygon points="80,160 520,160 300,60" fill="#7a3e0d" stroke="#3a2a18" stroke-width="3"/>
      <!-- Door (Chabad-style) -->
      <rect x="270" y="240" width="60" height="120" fill="#7a3e0d" stroke="#3a2a18" stroke-width="2"/>
      <circle cx="316" cy="305" r="3" fill="#f1d597"/>
      <!-- Mezuzah -->
      <rect x="334" y="260" width="6" height="22" fill="#16a34a"/>
      <!-- Big "770" sign -->
      <text x="300" y="225" text-anchor="middle" font-family="Frank Ruhl Libre,serif" font-size="48" font-weight="800" fill="#7a3e0d">770</text>
      <!-- Side windows -->
      <rect x="150" y="200" width="60" height="60" fill="#bfdbfe" stroke="#3a2a18"/>
      <line x1="150" y1="230" x2="210" y2="230" stroke="#3a2a18"/>
      <line x1="180" y1="200" x2="180" y2="260" stroke="#3a2a18"/>
      <rect x="390" y="200" width="60" height="60" fill="#bfdbfe" stroke="#3a2a18"/>
      <line x1="390" y1="230" x2="450" y2="230" stroke="#3a2a18"/>
      <line x1="420" y1="200" x2="420" y2="260" stroke="#3a2a18"/>
      <!-- Sign on roof "Welcome" -->
      <rect x="220" y="100" width="160" height="30" rx="6" fill="#fef3c7" stroke="#3a2a18"/>
      <text x="300" y="120" text-anchor="middle" font-family="Frank Ruhl Libre,serif" font-size="16" fill="#7a3e0d">ברוכים הבאים</text>
    </svg>`,

    /* 13. Chuppah (wedding canopy) */
    chuppah: ({ w=600, h=400 }={}) => `<svg viewBox="0 0 600 400" xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}">
      <defs>
        <linearGradient id="chsky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#fce5b8"/>
          <stop offset="100%" stop-color="#7c2d12"/>
        </linearGradient>
      </defs>
      <rect width="600" height="400" fill="url(#chsky)"/>
      <!-- Posts -->
      <rect x="100" y="100" width="14" height="280" fill="#7a5a23"/>
      <rect x="486" y="100" width="14" height="280" fill="#7a5a23"/>
      <rect x="180" y="80" width="14" height="300" fill="#7a5a23"/>
      <rect x="406" y="80" width="14" height="300" fill="#7a5a23"/>
      <!-- Canopy fabric -->
      <path d="M 90 100 Q 300 60 510 100 L 510 130 Q 300 100 90 130 Z" fill="#fff8e8" stroke="#7a5a23" stroke-width="2"/>
      <!-- Drapes -->
      <line x1="100" y1="120" x2="120" y2="160" stroke="#7a5a23"/>
      <line x1="500" y1="120" x2="480" y2="160" stroke="#7a5a23"/>
      <!-- Magen David above -->
      <g transform="translate(280,30)" fill="none" stroke="#f1d597" stroke-width="3">
        <polygon points="20,0 40,30 0,30"/>
        <polygon points="20,40 40,10 0,10"/>
      </g>
      <!-- Floral garlands -->
      <g fill="#dc2626" opacity=".8">
        <circle cx="120" cy="105" r="6"/><circle cx="200" cy="92" r="6"/><circle cx="280" cy="85" r="6"/><circle cx="360" cy="92" r="6"/><circle cx="440" cy="105" r="6"/>
      </g>
      <g fill="#16a34a">
        <ellipse cx="135" cy="100" rx="8" ry="3"/>
        <ellipse cx="215" cy="88" rx="8" ry="3"/>
        <ellipse cx="295" cy="82" rx="8" ry="3"/>
        <ellipse cx="375" cy="88" rx="8" ry="3"/>
        <ellipse cx="455" cy="100" rx="8" ry="3"/>
      </g>
    </svg>`,

    /* 14. Jerusalem skyline */
    jerusalem: ({ w=800, h=400 }={}) => `<svg viewBox="0 0 800 400" xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}">
      <defs>
        <linearGradient id="jsky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#fff3c0"/>
          <stop offset="50%" stop-color="#f59e0b"/>
          <stop offset="100%" stop-color="#7c2d12"/>
        </linearGradient>
      </defs>
      <rect width="800" height="400" fill="url(#jsky)"/>
      <!-- Sun -->
      <circle cx="640" cy="120" r="60" fill="#fef3c7" opacity=".5"/>
      <circle cx="640" cy="120" r="34" fill="#fff8e8" opacity=".8"/>
      <!-- Rolling hills -->
      <path d="M0,290 Q200,260 400,280 Q600,300 800,275 L800,400 L0,400 Z" fill="#7a4a1a"/>
      <!-- Old City walls (silhouette) -->
      <g fill="#3a2a18">
        <rect x="0" y="240" width="800" height="50"/>
        <!-- Crenellations -->
        ${Array.from({length:50}).map((_,i)=>`<rect x="${i*16}" y="232" width="8" height="10"/>`).join('')}
      </g>
      <!-- Towers -->
      <rect x="120" y="180" width="40" height="60" fill="#3a2a18"/>
      <polygon points="120,180 160,180 140,150" fill="#3a2a18"/>
      <rect x="320" y="170" width="40" height="70" fill="#3a2a18"/>
      <circle cx="340" cy="160" r="14" fill="#3a2a18"/>
      <rect x="560" y="180" width="50" height="60" fill="#3a2a18"/>
      <!-- Dome of the Rock (gold) -->
      <circle cx="430" cy="200" r="40" fill="#f59e0b" stroke="#7a5a23" stroke-width="2"/>
      <rect x="395" y="200" width="70" height="40" fill="#a86530" stroke="#3a2a18"/>
      <circle cx="430" cy="158" r="6" fill="#fef3c7"/>
    </svg>`,

    /* 15. Sukkah */
    sukkah: ({ w=600, h=400 }={}) => `<svg viewBox="0 0 600 400" xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}">
      <rect width="600" height="400" fill="#fce5b8"/>
      <!-- Walls -->
      <rect x="120" y="160" width="360" height="220" fill="#a86530" opacity=".85"/>
      <rect x="120" y="160" width="360" height="220" fill="none" stroke="#3a2a18" stroke-width="3"/>
      <!-- Schach (palm fronds on top) -->
      <g stroke="#16a34a" stroke-width="3" stroke-linecap="round" fill="none">
        ${Array.from({length:20}).map((_,i)=>{
          const x = 110 + i * 19;
          return `<line x1="${x}" y1="160" x2="${x+8}" y2="120"/>`;
        }).join('')}
      </g>
      <!-- Decorations -->
      <g fill="#dc2626"><circle cx="180" cy="220" r="10"/><circle cx="240" cy="200" r="8"/><circle cx="380" cy="210" r="9"/><circle cx="430" cy="200" r="7"/></g>
      <g fill="#f59e0b"><circle cx="210" cy="210" r="8"/><circle cx="320" cy="195" r="9"/><circle cx="400" cy="220" r="8"/></g>
      <!-- Door -->
      <path d="M 280 380 L 280 280 Q 280 260 300 260 Q 320 260 320 280 L 320 380 Z" fill="#3a2a18"/>
      <!-- Stars seen through schach -->
      <g fill="#fef3c7" opacity=".7"><circle cx="200" cy="135" r="2"/><circle cx="350" cy="130" r="2"/><circle cx="450" cy="125" r="2"/></g>
    </svg>`,

    /* 16. Daily moment / 60 seconds — sunrise meditation */
    moment: ({ w=600, h=400 }={}) => `<svg viewBox="0 0 600 400" xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}">
      <defs>
        <linearGradient id="mosky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#fde8c6"/>
          <stop offset="50%" stop-color="#f59e0b"/>
          <stop offset="100%" stop-color="#7c2d12"/>
        </linearGradient>
      </defs>
      <rect width="600" height="400" fill="url(#mosky)"/>
      <!-- Sun rising -->
      <circle cx="300" cy="280" r="120" fill="#fef3c7" opacity=".4"/>
      <circle cx="300" cy="280" r="80" fill="#fff8e8" opacity=".7"/>
      <circle cx="300" cy="280" r="50" fill="#fef3c7"/>
      <!-- Rays -->
      <g stroke="#fef3c7" stroke-width="3" opacity=".5">
        <line x1="300" y1="100" x2="300" y2="150"/>
        <line x1="180" y1="160" x2="220" y2="180"/>
        <line x1="420" y1="160" x2="380" y2="180"/>
        <line x1="100" y1="280" x2="160" y2="280"/>
        <line x1="500" y1="280" x2="440" y2="280"/>
      </g>
      <!-- Horizon mountains -->
      <path d="M0,300 L150,260 L280,290 L420,255 L600,295 L600,400 L0,400 Z" fill="#7c2d12" opacity=".7"/>
      <path d="M0,330 L800,330 L800,400 L0,400 Z" fill="#3a0f02" opacity=".8"/>
    </svg>`
  };

  /* Pre-compute data URLs lazily on access */
  const cache = {};
  const KZ_ILLUSTRATIONS = {};
  Object.keys(SCENES).forEach(key => {
    KZ_ILLUSTRATIONS[key] = (opts) => {
      const k = key + JSON.stringify(opts || {});
      if (cache[k]) return cache[k];
      const svg = SCENES[key](opts);
      cache[k] = dataUrl(svg);
      return cache[k];
    };
    /* Raw SVG access */
    KZ_ILLUSTRATIONS[key + 'Svg'] = (opts) => SCENES[key](opts);
  });

  /* List of available illustrations */
  KZ_ILLUSTRATIONS.list = [
    { key:'kotel',       he:'הכותל המערבי',          tags:['holy','jerusalem'] },
    { key:'machpela',    he:'מערת המכפלה',           tags:['holy','tomb'] },
    { key:'rachel',      he:'קבר רחל',                tags:['holy','tomb'] },
    { key:'candles',     he:'נרות שבת',               tags:['shabbat','candles'] },
    { key:'challah',     he:'חלות לשבת',              tags:['shabbat','food'] },
    { key:'menorah',     he:'מנורה',                  tags:['hanukkah','holy'] },
    { key:'shofar',      he:'שופר',                   tags:['rosh-hashana'] },
    { key:'magenDavid',  he:'מגן דוד',                tags:['symbol'] },
    { key:'torah',       he:'ספר תורה',               tags:['holy','study'] },
    { key:'synagogue',   he:'בית כנסת',               tags:['synagogue'] },
    { key:'chabadHouse', he:'בית חב"ד',              tags:['chabad'] },
    { key:'chuppah',     he:'חופה',                   tags:['wedding'] },
    { key:'jerusalem',   he:'ירושלים',                tags:['city'] },
    { key:'sukkah',      he:'סוכה',                   tags:['sukkot'] },
    { key:'moment',      he:'רגע של תפילה',           tags:['daily','sunrise'] }
  ];

  window.KZ_ILLUSTRATIONS = KZ_ILLUSTRATIONS;
})();
