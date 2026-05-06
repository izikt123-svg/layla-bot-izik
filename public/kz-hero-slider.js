/* ============================================================
   KZ HERO SLIDER — Holy places of Eretz Israel
   8 slides, auto-rotating with manual controls
   ============================================================ */
(function(){
  'use strict';

  const HOLY = [
    {
      id:'kotel',
      tag:'⭐ קודש הקודשים',
      name:'הַכֹּתֶל הַמַּעֲרָבִי',
      gold:'הכותל המערבי',
      place:'ירושלים העתיקה · הרובע היהודי',
      quote:'"וַעֲשׂוּ לִי מִקְדָּשׁ וְשָׁכַנְתִּי בְּתוֹכָם"',
      lat:31.7767, lng:35.2345,
      wiki: 'Western_Wall',
      photo:'https://source.unsplash.com/featured/1600x900/?western-wall,jerusalem',
      sky: ['#FFE0A8','#F4B860','#C2701C','#0B1F3A'],
      svg: `<g>
        <!-- sky gradient handled outside -->
        <!-- Wall stones -->
        <g fill="#a18454" stroke="#5e4720" stroke-width="0.5">
          ${Array.from({length:7}).map((_,r)=>{
            const y = 380 + r*22;
            const cols = 12 + (r%2);
            return Array.from({length:cols}).map((_,c)=>{
              const w = 600/cols;
              return `<rect x="${c*w + (r%2?w/2:0)}" y="${y}" width="${w-2}" height="20" rx="2" fill="${r%3===0?'#b89066':'#a18454'}"/>`;
            }).join('');
          }).join('')}
        </g>
        <!-- Hidden notes (folded) -->
        <g fill="#fff8e8" opacity=".7">
          <rect x="120" y="392" width="6" height="9" transform="rotate(8 120 392)"/>
          <rect x="220" y="412" width="5" height="8" transform="rotate(-5 220 412)"/>
          <rect x="380" y="402" width="6" height="10" transform="rotate(12 380 402)"/>
          <rect x="500" y="422" width="5" height="8" transform="rotate(-3 500 422)"/>
        </g>
        <!-- Plants -->
        <g fill="#5b8a3a" opacity=".7">
          <path d="M 60 380 Q 65 360 70 380 Z"/>
          <path d="M 540 385 Q 545 365 550 385 Z"/>
        </g>
        <!-- Doves -->
        <g fill="#fff" opacity=".85">
          <ellipse cx="100" cy="120" rx="6" ry="3"/>
          <path d="M 94 120 Q 100 116 106 120 Z" fill="#fff"/>
          <ellipse cx="450" cy="160" rx="5" ry="2.5"/>
          <path d="M 445 160 Q 450 157 455 160 Z" fill="#fff"/>
        </g>
        <!-- Light beams -->
        <g opacity=".4">
          <path d="M 200 50 L 180 380 L 220 380 Z" fill="#fff8e0"/>
          <path d="M 350 80 L 330 380 L 370 380 Z" fill="#ffe5a8" opacity=".7"/>
        </g>
      </g>`
    },
    {
      id:'machpela',
      tag:'⭐ מערת המכפלה',
      name:'מְעָרַת הַמַּכְפֵּלָה',
      gold:'אבות ואמהות',
      place:'חברון · עיר האבות',
      quote:'"שָׂדֶה אֲשֶׁר קָנָה אַבְרָהָם מֵאֵת בְּנֵי חֵת"',
      lat:31.5246, lng:35.1107,
      wiki: 'Cave_of_the_Patriarchs',
      photo:'https://source.unsplash.com/featured/1600x900/?hebron,sacred,jewish',
      sky:['#fce5b8','#e8a85d','#9b5e1c','#1a3358'],
      svg:`<g>
        <!-- Building -->
        <rect x="100" y="180" width="400" height="220" fill="#a88560"/>
        <rect x="100" y="180" width="400" height="220" fill="none" stroke="#5e4720" stroke-width="2"/>
        <!-- Stone courses -->
        ${Array.from({length:9}).map((_,i)=>`<line x1="100" y1="${200+i*22}" x2="500" y2="${200+i*22}" stroke="#5e4720" stroke-width="0.5" opacity=".5"/>`).join('')}
        <!-- Crenellations -->
        <g fill="#a88560" stroke="#5e4720" stroke-width="2">
          ${Array.from({length:13}).map((_,i)=>`<rect x="${100+i*32}" y="160" width="20" height="20"/>`).join('')}
        </g>
        <!-- Arched entrance -->
        <path d="M 270 400 L 270 320 Q 270 290 300 290 Q 330 290 330 320 L 330 400 Z" fill="#3a2a18"/>
        <!-- Window arches -->
        <path d="M 160 280 Q 160 250 180 250 Q 200 250 200 280 L 200 320 L 160 320 Z" fill="#1a3358"/>
        <path d="M 400 280 Q 400 250 420 250 Q 440 250 440 280 L 440 320 L 400 320 Z" fill="#1a3358"/>
        <!-- Minaret tower -->
        <rect x="140" y="80" width="40" height="100" fill="#a88560" stroke="#5e4720" stroke-width="1.5"/>
        <polygon points="140,80 180,80 160,40" fill="#5e4720"/>
        <circle cx="160" cy="50" r="5" fill="#f1d597"/>
        <!-- Dome -->
        <path d="M 280 180 Q 300 130 320 180 Z" fill="#7c5e2c"/>
        <circle cx="300" cy="125" r="6" fill="#f1d597"/>
        <!-- Stairs -->
        <g fill="#7c5e2c" opacity=".7">
          <rect x="80" y="400" width="440" height="8"/>
          <rect x="60" y="408" width="480" height="8"/>
          <rect x="40" y="416" width="520" height="8"/>
        </g>
      </g>`
    },
    {
      id:'meron',
      tag:'⭐ ל"ג בעומר',
      name:'קֶבֶר רַשְׁבִּ"י',
      gold:'מירון',
      place:'הר מירון · גליל עליון',
      quote:'"בַּר יוֹחַאי, נִמְשַׁחְתָּ אַשְׁרֶיךָ"',
      lat:32.9794, lng:35.4406,
      wiki: 'Mount_Meron',
      photo:'https://source.unsplash.com/featured/1600x900/?galilee,israel,mountain',
      sky:['#f2c97c','#d8853d','#5e2c0c','#0a1828'],
      svg:`<g>
        <!-- Mountain silhouettes -->
        <path d="M 0 320 L 100 220 L 200 280 L 300 180 L 400 260 L 500 200 L 600 250 L 600 460 L 0 460 Z" fill="#3a2a18" opacity=".7"/>
        <path d="M 0 360 L 80 290 L 180 340 L 280 270 L 380 320 L 480 280 L 600 320 L 600 460 L 0 460 Z" fill="#5e4720" opacity=".8"/>
        <!-- Building (Tomb structure) -->
        <rect x="220" y="320" width="160" height="100" fill="#cdb47e"/>
        <rect x="220" y="320" width="160" height="100" fill="none" stroke="#7a5a23" stroke-width="2"/>
        <!-- Dome -->
        <path d="M 220 320 Q 300 240 380 320 Z" fill="#e8c98a"/>
        <path d="M 220 320 Q 300 240 380 320" fill="none" stroke="#7a5a23" stroke-width="2"/>
        <circle cx="300" cy="245" r="5" fill="#f1d597"/>
        <!-- Door -->
        <path d="M 280 420 L 280 360 Q 280 340 300 340 Q 320 340 320 360 L 320 420 Z" fill="#3a2a18"/>
        <!-- Bonfires (Lag Ba'omer) -->
        <g>
          <ellipse cx="120" cy="430" rx="20" ry="6" fill="#000" opacity=".4"/>
          <path d="M 110 420 Q 120 400 130 420 Q 125 415 120 408 Q 115 415 110 420 Z" fill="#ff7a18"/>
          <path d="M 115 420 Q 120 408 125 420 Q 122 415 120 410 Q 118 415 115 420 Z" fill="#ffd66e"/>
        </g>
        <g>
          <ellipse cx="480" cy="425" rx="22" ry="6" fill="#000" opacity=".4"/>
          <path d="M 468 415 Q 480 392 492 415 Q 486 408 480 400 Q 474 408 468 415 Z" fill="#ff7a18"/>
          <path d="M 474 415 Q 480 402 486 415 Q 483 410 480 405 Q 477 410 474 415 Z" fill="#ffd66e"/>
        </g>
        <!-- Sparks -->
        <g fill="#ffd66e">
          <circle cx="120" cy="380" r="1.5"/>
          <circle cx="135" cy="370" r="1"/>
          <circle cx="105" cy="385" r="1"/>
          <circle cx="480" cy="375" r="1.5"/>
          <circle cx="465" cy="360" r="1"/>
          <circle cx="495" cy="380" r="1"/>
        </g>
        <!-- Stars -->
        <g fill="#fff" opacity=".7">
          <circle cx="80" cy="80" r="1.5"/>
          <circle cx="160" cy="50" r="1"/>
          <circle cx="540" cy="70" r="1.5"/>
          <circle cx="450" cy="40" r="1"/>
          <circle cx="380" cy="100" r="1"/>
        </g>
      </g>`
    },
    {
      id:'rachel',
      tag:'⭐ אם הבנים',
      name:'קֶבֶר רָחֵל אִמֵּנוּ',
      gold:'בית לחם',
      place:'דרך אפרתה · בית לחם',
      quote:'"כִּי אֵינֶנּוּ"',
      lat:31.7196, lng:35.2024,
      wiki: 'Rachel%27s_Tomb',
      photo:'https://commons.wikimedia.org/wiki/Special:FilePath/Kever_rahel.jpg?width=1600',
      sky:['#f8e4b0','#dba868','#854d20','#0d1d35'],
      svg:`<g>
        <!-- Hills -->
        <path d="M 0 360 Q 200 320 400 360 Q 500 380 600 350 L 600 460 L 0 460 Z" fill="#7c5e2c" opacity=".7"/>
        <!-- Building -->
        <rect x="180" y="240" width="240" height="180" fill="#e8d4a0"/>
        <rect x="180" y="240" width="240" height="180" fill="none" stroke="#7a5a23" stroke-width="2"/>
        <!-- Dome -->
        <path d="M 180 240 Q 300 130 420 240 Z" fill="#f5e3b0"/>
        <path d="M 180 240 Q 300 130 420 240" fill="none" stroke="#7a5a23" stroke-width="2"/>
        <!-- Crown of dome -->
        <line x1="300" y1="135" x2="300" y2="115" stroke="#7a5a23" stroke-width="2"/>
        <circle cx="300" cy="110" r="6" fill="#f1d597"/>
        <!-- Door arch -->
        <path d="M 270 420 L 270 340 Q 270 310 300 310 Q 330 310 330 340 L 330 420 Z" fill="#3a2a18"/>
        <!-- Windows -->
        <rect x="210" y="280" width="30" height="40" rx="15" fill="#1a3358"/>
        <rect x="360" y="280" width="30" height="40" rx="15" fill="#1a3358"/>
        <!-- Olive tree -->
        <ellipse cx="80" cy="380" rx="40" ry="50" fill="#5b8a3a" opacity=".85"/>
        <ellipse cx="80" cy="370" rx="35" ry="40" fill="#7ba85a" opacity=".9"/>
        <line x1="80" y1="400" x2="80" y2="450" stroke="#3a2a18" stroke-width="6"/>
        <!-- Cypress -->
        <ellipse cx="520" cy="380" rx="14" ry="60" fill="#3d5a25"/>
      </g>`
    },
    {
      id:'shilo',
      tag:'⭐ משכן ראשון',
      name:'תֵּל שִׁילֹה',
      gold:'משכן',
      place:'שילה הקדומה · בנימין',
      quote:'"וַתָּקָם רָחֵל לִקְרַאת אַחֵיהָ"',
      lat:32.0561, lng:35.2939,
      wiki: 'Tel_Shiloh',
      photo:'https://source.unsplash.com/featured/1600x900/?ancient-ruins,israel,desert',
      sky:['#f4d59a','#cd8a45','#6b3f12','#0a1828'],
      svg:`<g>
        <!-- Ancient hills -->
        <path d="M 0 340 Q 150 300 300 340 Q 450 310 600 350 L 600 460 L 0 460 Z" fill="#a18454"/>
        <path d="M 0 380 Q 200 350 400 380 Q 500 400 600 370 L 600 460 L 0 460 Z" fill="#7c5e2c"/>
        <!-- Tabernacle (Mishkan) outline -->
        <g transform="translate(200,250)">
          <rect width="200" height="100" fill="#5e4720" stroke="#3a2a18" stroke-width="2"/>
          <!-- Tent peaks -->
          <polygon points="0,0 100,-40 200,0" fill="#7c5e2c" stroke="#3a2a18" stroke-width="2"/>
          <!-- Pillars -->
          ${Array.from({length:6}).map((_,i)=>`<rect x="${i*40+5}" y="0" width="3" height="100" fill="#3a2a18"/>`).join('')}
          <!-- Curtain hint -->
          <path d="M 0 30 Q 100 50 200 30" fill="none" stroke="#a23a3a" stroke-width="2" opacity=".6"/>
          <path d="M 0 60 Q 100 80 200 60" fill="none" stroke="#1a3358" stroke-width="2" opacity=".6"/>
        </g>
        <!-- Altar -->
        <rect x="280" y="380" width="40" height="40" fill="#3a2a18" stroke="#5e4720" stroke-width="2"/>
        <path d="M 285 385 Q 300 365 315 385 Q 305 380 300 370 Q 295 380 285 385 Z" fill="#ff7a18"/>
        <!-- Stars -->
        <g fill="#fff" opacity=".7">
          <circle cx="120" cy="80" r="1"/>
          <circle cx="450" cy="60" r="1.5"/>
          <circle cx="380" cy="120" r="1"/>
        </g>
      </g>`
    },
    {
      id:'tzfat',
      tag:'⭐ עיר הקבלה',
      name:'צְפַת',
      gold:'עיר הקבלה',
      place:'גליל עליון · עיר עתיקה',
      quote:'"לְכָה דּוֹדִי לִקְרַאת כַּלָּה"',
      lat:32.9651, lng:35.4949,
      wiki: 'Safed',
      photo:'https://source.unsplash.com/featured/1600x900/?safed,blue,mystical',
      sky:['#a8d8f0','#4a8eb8','#1c3a5e','#0a1828'],
      svg:`<g>
        <!-- Stepped hillside city -->
        <g fill="#5b6e8b" stroke="#1a3358" stroke-width="0.5">
          ${Array.from({length:5}).map((_,r)=>{
            const y = 200 + r*45;
            return Array.from({length:8+r}).map((_,c)=>{
              const w = 580/(8+r);
              return `<g><rect x="${c*w}" y="${y}" width="${w-2}" height="40" fill="${(r+c)%2?'#7d8fa8':'#5b6e8b'}"/>
                <rect x="${c*w + w/3}" y="${y+8}" width="${w/4}" height="${w/4}" fill="#1a3358"/></g>`;
            }).join('');
          }).join('')}
        </g>
        <!-- Synagogue roof (blue dome) -->
        <path d="M 240 180 Q 300 110 360 180 Z" fill="#3470b8"/>
        <line x1="300" y1="115" x2="300" y2="95" stroke="#7a5a23" stroke-width="2"/>
        <circle cx="300" cy="92" r="5" fill="#f1d597"/>
        <!-- Cypress trees -->
        <ellipse cx="60" cy="280" rx="10" ry="50" fill="#3d5a25"/>
        <ellipse cx="540" cy="280" rx="10" ry="50" fill="#3d5a25"/>
        <!-- Stars (Tzfat is mystic) -->
        <g fill="#fff" opacity=".7">
          <circle cx="80" cy="100" r="1.5"/>
          <circle cx="180" cy="60" r="1"/>
          <circle cx="280" cy="80" r="1.5"/>
          <circle cx="420" cy="50" r="1"/>
          <circle cx="500" cy="100" r="1.5"/>
        </g>
        <!-- Light from synagogue -->
        <path d="M 280 180 L 200 460 L 400 460 L 320 180 Z" fill="#ffe5a8" opacity=".15"/>
      </g>`
    },
    {
      id:'temple-mount',
      tag:'⭐ הר הבית',
      name:'הַר הַבַּיִת',
      gold:'מקום המקדש',
      place:'ירושלים · הר המוריה',
      quote:'"יְרוּשָׁלַיִם הָרִים סָבִיב לָהּ"',
      lat:31.7780, lng:35.2354,
      wiki: 'Temple_Mount',
      photo:'https://source.unsplash.com/featured/1600x900/?dome-rock,jerusalem,golden',
      sky:['#fff5d8','#f4ce6e','#c08428','#3a2a4d'],
      svg:`<g>
        <!-- Temple Mount platform -->
        <rect x="0" y="350" width="600" height="110" fill="#a88560"/>
        <rect x="0" y="345" width="600" height="10" fill="#7a5a23"/>
        <!-- Western Wall -->
        <g fill="#a18454" stroke="#5e4720" stroke-width="0.5">
          ${Array.from({length:5}).map((_,r)=>{
            const y = 350 + r*22;
            return Array.from({length:14}).map((_,c)=>`<rect x="${c*43}" y="${y}" width="41" height="20" fill="${r%2?'#b89066':'#a18454'}"/>`).join('');
          }).join('')}
        </g>
        <!-- Imagined Temple silhouette (golden) -->
        <g opacity=".85">
          <rect x="200" y="180" width="200" height="170" fill="#e8c98a" stroke="#7a5a23" stroke-width="2"/>
          <!-- Pillars -->
          <rect x="220" y="200" width="20" height="150" fill="#cda263"/>
          <rect x="360" y="200" width="20" height="150" fill="#cda263"/>
          <!-- Roof -->
          <polygon points="200,180 300,100 400,180" fill="#f1d597" stroke="#7a5a23" stroke-width="2"/>
          <!-- Crown / decoration -->
          <rect x="280" y="120" width="40" height="20" fill="#c6a054"/>
          <circle cx="300" cy="105" r="6" fill="#f1d597"/>
        </g>
        <!-- Light beams -->
        <path d="M 250 100 L 230 460 L 280 460 L 290 100 Z" fill="#fff8e0" opacity=".25"/>
        <path d="M 350 100 L 330 460 L 380 460 L 360 100 Z" fill="#ffe5a8" opacity=".2"/>
        <!-- Cypress -->
        <ellipse cx="80" cy="310" rx="12" ry="50" fill="#3d5a25"/>
        <ellipse cx="520" cy="310" rx="12" ry="50" fill="#3d5a25"/>
      </g>`
    },
    {
      id:'sinai',
      tag:'⭐ מתן תורה',
      name:'הַר סִינַי',
      gold:'מתן תורה',
      place:'מדבר סיני',
      quote:'"וַיֵּרֶד ה\' עַל הַר סִינַי"',
      lat:28.5392, lng:33.9750,
      wiki: 'Mount_Sinai',
      photo:'https://source.unsplash.com/featured/1600x900/?mount-sinai,desert,egypt',
      sky:['#ffd470','#d18030','#5e2c0c','#1a1a3a'],
      svg:`<g>
        <!-- Mountain -->
        <path d="M 200 460 L 300 100 L 400 460 Z" fill="#5e4720"/>
        <path d="M 240 460 L 300 100 L 360 460 Z" fill="#7c5e2c" opacity=".8"/>
        <!-- Cloud over mountain -->
        <ellipse cx="300" cy="120" rx="80" ry="20" fill="#a8b8cf" opacity=".7"/>
        <ellipse cx="300" cy="100" rx="60" ry="15" fill="#cdd5e3" opacity=".8"/>
        <!-- Lightning -->
        <path d="M 290 130 L 295 150 L 285 150 L 295 180 L 290 200" fill="none" stroke="#fff8e0" stroke-width="2"/>
        <path d="M 310 130 L 315 155 L 305 155 L 315 185 L 310 205" fill="none" stroke="#fff8e0" stroke-width="2"/>
        <!-- Fire on summit -->
        <path d="M 290 110 Q 300 80 310 110 Q 305 100 300 90 Q 295 100 290 110 Z" fill="#ff7a18"/>
        <path d="M 295 110 Q 300 90 305 110 Q 302 100 300 95 Q 298 100 295 110 Z" fill="#ffd66e"/>
        <!-- Stones with letters (Lukhot) -->
        <g transform="translate(140,300)">
          <path d="M 0 60 Q 0 0 30 0 L 50 0 Q 80 0 80 60 L 80 100 L 0 100 Z" fill="#cdb47e" stroke="#5e4720" stroke-width="2"/>
          <text x="40" y="40" font-family="serif" font-size="10" fill="#5e4720" text-anchor="middle">א</text>
          <text x="40" y="55" font-family="serif" font-size="8" fill="#5e4720" text-anchor="middle">ב</text>
          <text x="40" y="70" font-family="serif" font-size="8" fill="#5e4720" text-anchor="middle">ג</text>
          <text x="40" y="85" font-family="serif" font-size="8" fill="#5e4720" text-anchor="middle">ד</text>
        </g>
        <g transform="translate(380,300)">
          <path d="M 0 60 Q 0 0 30 0 L 50 0 Q 80 0 80 60 L 80 100 L 0 100 Z" fill="#cdb47e" stroke="#5e4720" stroke-width="2"/>
          <text x="40" y="40" font-family="serif" font-size="10" fill="#5e4720" text-anchor="middle">ה</text>
          <text x="40" y="55" font-family="serif" font-size="8" fill="#5e4720" text-anchor="middle">ו</text>
          <text x="40" y="70" font-family="serif" font-size="8" fill="#5e4720" text-anchor="middle">ז</text>
          <text x="40" y="85" font-family="serif" font-size="8" fill="#5e4720" text-anchor="middle">ח</text>
        </g>
        <!-- Stars -->
        <g fill="#fff" opacity=".8">
          <circle cx="60" cy="60" r="1.5"/>
          <circle cx="160" cy="40" r="1"/>
          <circle cx="450" cy="50" r="1.5"/>
          <circle cx="540" cy="80" r="1"/>
        </g>
      </g>`
    }
  ];

  // Fallback image sources — Unsplash search returns relevant photos always
  const PHOTO_FALLBACK = {
    kotel:        'https://images.unsplash.com/photo-1544734037-5e7d2b1b8e8f?w=1280&q=80',
    machpela:     'https://source.unsplash.com/1280x460/?hebron,sacred,ancient',
    meron:        'https://source.unsplash.com/1280x460/?meron,grave,judaism',
    rachel:       'https://source.unsplash.com/1280x460/?bethlehem,tomb',
    shilo:        'https://source.unsplash.com/1280x460/?samaria,israel,ancient',
    tzfat:        'https://images.unsplash.com/photo-1591264213107-2b3c1c4cb9d2?w=1280&q=80',
    'temple-mount':'https://images.unsplash.com/photo-1542230232-c66cb35d8b85?w=1280&q=80',
    sinai:        'https://images.unsplash.com/photo-1565026057757-1bc1eaf8c14a?w=1280&q=80'
  };

  function buildSlide(item, idx){
    const sky = item.sky || ['#fce5b8','#e8a85d','#9b5e1c','#1a3358'];
    const svgFallback = `
      <svg class="kz-holy-svg-fallback" viewBox="0 0 600 460" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid slice">
        <defs>
          <linearGradient id="sky-${item.id}" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stop-color="${sky[0]}"/>
            <stop offset="40%" stop-color="${sky[1]}"/>
            <stop offset="80%" stop-color="${sky[2]}"/>
            <stop offset="100%" stop-color="${sky[3]}"/>
          </linearGradient>
        </defs>
        <rect width="600" height="460" fill="url(#sky-${item.id})"/>
        <circle cx="450" cy="120" r="35" fill="#fff8e0" opacity=".55"/>
        <circle cx="450" cy="120" r="28" fill="#fff8e0" opacity=".7"/>
        ${item.svg}
      </svg>`;
    const fallback = PHOTO_FALLBACK[item.id] || '';
    // Photo with chained fallback: primary (Wikipedia) → Unsplash → SVG
    const photoLayer = item.photo
      ? `<img class="kz-holy-photo" src="${item.photo}"
            data-fallback="${fallback}"
            alt="${item.name}"
            loading="${idx === 0 ? 'eager' : 'lazy'}"
            onerror="if(this.dataset.fallback&&this.src!==this.dataset.fallback){this.src=this.dataset.fallback;}else{this.style.display='none';this.parentElement.classList.add('kz-svg-mode');}" />`
      : '';
    return `
      <div class="kz-holy-slide ${idx === 0 ? 'is-active' : ''}" data-idx="${idx}">
        ${photoLayer}
        ${svgFallback}
      </div>`;
  }

  function buildStrip(){
    if (document.querySelector('.kz-holy-strip')) return;
    const hero = document.querySelector('.hero');
    if (!hero) return;

    // Mark hero (we no longer use it as slider host but keep class for any styles)
    hero.classList.add('kz-hero-with-slider');

    const strip = document.createElement('div');
    strip.className = 'kz-holy-strip kz-top-banner';
    strip.setAttribute('aria-label', 'מקומות קדושים');
    strip.innerHTML = `
      <div class="kz-holy-card">
        <div class="kz-holy-slides">${HOLY.map(buildSlide).join('')}</div>
        <div class="kz-holy-particles" aria-hidden="true"></div>
        <div class="kz-holy-cap">
          <span class="kz-holy-tag" id="kzHolyTag">⭐</span>
          <h2 class="kz-holy-name" id="kzHolyName">—</h2>
          <div class="kz-holy-place" id="kzHolyPlace">—</div>
          <p class="kz-holy-quote" id="kzHolyQuote">—</p>
          <div class="kz-holy-actions">
            <a class="kz-holy-btn kz-holy-btn-waze" id="kzHolyWaze" target="_blank" rel="noopener">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2c5 0 9 3.5 9 8 0 4-3 6.5-3 8.5 0 .5-.5 1-1.2 1-.7 0-1.3-.5-1.3-1.1 0-.7-.5-1.4-1.5-1.4H10.5c-1 0-1.5.7-1.5 1.4 0 .6-.6 1.1-1.3 1.1S6.5 19 6.5 18.5C6.5 16.5 3 14 3 10c0-4.5 4-8 9-8z"/></svg>
              Waze
            </a>
            <a class="kz-holy-btn kz-holy-btn-wa" id="kzHolyWa" target="_blank" rel="noopener">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413"/></svg>
              שתף
            </a>
          </div>
        </div>
        <button class="kz-holy-arrow kz-prev" aria-label="הקודם">›</button>
        <button class="kz-holy-arrow kz-next" aria-label="הבא">‹</button>
        <div class="kz-holy-dots" id="kzHolyDots">
          ${HOLY.map((_, i) => `<button class="kz-holy-dot ${i === 0 ? 'is-active' : ''}" data-idx="${i}" aria-label="מקום ${i+1}"></button>`).join('')}
        </div>
      </div>`;
    // Insert ABOVE topbar — first child of body so it sits at the very top
    document.body.insertBefore(strip, document.body.firstChild);

    // Add particles to active slide
    const partWrap = strip.querySelector('.kz-holy-particles');
    for (let i = 0; i < 16; i++){
      const p = document.createElement('span');
      p.className = 'kz-holy-particle';
      p.style.cssText = `
        left: ${Math.random() * 100}%;
        --hd: ${10 + Math.random() * 10}s;
        --hdelay: ${Math.random() * 12}s;
        --hdx: ${(Math.random() - 0.5) * 60}px;
        animation-delay: ${Math.random() * 12}s;
      `;
      partWrap.appendChild(p);
    }

    // Wire up
    let activeIdx = 0;
    let timer = null;
    const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;

    function show(i){
      activeIdx = (i + HOLY.length) % HOLY.length;
      const item = HOLY[activeIdx];
      strip.querySelectorAll('.kz-holy-slide').forEach((el, idx) => {
        el.classList.toggle('is-active', idx === activeIdx);
      });
      strip.querySelectorAll('.kz-holy-dot').forEach((el, idx) => {
        el.classList.toggle('is-active', idx === activeIdx);
      });
      strip.querySelector('#kzHolyTag').innerHTML = item.tag;
      const nameEl = strip.querySelector('#kzHolyName');
      nameEl.innerHTML = `${item.name} <span class="gold">· ${item.gold}</span>`;
      strip.querySelector('#kzHolyPlace').textContent = item.place;
      strip.querySelector('#kzHolyQuote').textContent = item.quote;
      strip.querySelector('#kzHolyWaze').href = `https://www.waze.com/ul?ll=${item.lat},${item.lng}&navigate=yes`;
      const msg = `${item.name.replace(/[ֿ-ׂ׀-״]/g,'')} · ${item.place}\n${item.quote}\nניווט: https://www.waze.com/ul?ll=${item.lat},${item.lng}&navigate=yes`;
      strip.querySelector('#kzHolyWa').href = `https://wa.me/?text=${encodeURIComponent(msg)}`;
    }

    function start(){
      if (reduceMotion) return;
      stop();
      timer = setInterval(() => show(activeIdx + 1), 6000);
    }
    function stop(){ if (timer) { clearInterval(timer); timer = null; } }

    strip.querySelector('.kz-prev').addEventListener('click', () => { show(activeIdx - 1); start(); });
    strip.querySelector('.kz-next').addEventListener('click', () => { show(activeIdx + 1); start(); });
    strip.querySelectorAll('.kz-holy-dot').forEach(d => {
      d.addEventListener('click', () => { show(parseInt(d.dataset.idx, 10)); start(); });
    });
    strip.addEventListener('mouseenter', stop);
    strip.addEventListener('mouseleave', start);

    show(0);
    start();
  }

  /* Re-enabled: fetch real photos from Wikipedia REST API.
     For places that return illustrated/old images, we use a curated override. */
  const PHOTO_OVERRIDE = {
    // Rachel's Tomb article uses old illustration → use commons file directly
    'rachel': 'https://commons.wikimedia.org/wiki/Special:FilePath/Kever_rahel.jpg?width=1600',
    // Tel Shiloh has weak images → use commons file
    'shilo':  'https://commons.wikimedia.org/wiki/Special:FilePath/Tel_Shiloh.jpg?width=1600'
  };

  async function fetchWikipediaImage(title){
    try {
      const url = `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(title)}`;
      const res = await fetch(url);
      if (!res.ok) return null;
      const data = await res.json();
      return data.originalimage?.source || data.thumbnail?.source || null;
    } catch(_){ return null; }
  }

  async function upgradeImages(){
    for (let i = 0; i < HOLY.length; i++){
      const item = HOLY[i];
      // Use override if available
      let url = PHOTO_OVERRIDE[item.id];
      // Otherwise fetch from Wikipedia
      if (!url && item.wiki){
        url = await fetchWikipediaImage(item.wiki);
      }
      if (!url) continue;

      const img = document.querySelector(`.kz-holy-slide[data-idx="${i}"] .kz-holy-photo`);
      if (!img) continue;

      // Preload before swap to avoid flicker
      const test = new Image();
      test.onload = () => {
        img.src = url;
        img.style.display = '';
        const slide = img.parentElement;
        if (slide) slide.classList.remove('kz-svg-mode');
      };
      test.onerror = () => { /* keep current photo / SVG */ };
      test.src = url;
    }
  }

  function init(){
    buildStrip();
    setTimeout(upgradeImages, 500);
  }

  if (document.readyState === 'loading'){
    document.addEventListener('DOMContentLoaded', init, { once: true });
  } else {
    init();
  }
})();
