/* ============================================================
   Cantor Mode — script
   ============================================================ */
(function(){
  'use strict';

  const PRAYERS = {
    shema: {
      title: 'קריאת שמע',
      lines: [
        'שְׁמַע יִשְׂרָאֵל,',
        '<span class="accent">יְהוָה אֱלֹהֵינוּ, יְהוָה אֶחָד</span>.',
        'בָּרוּךְ שֵׁם כְּבוֹד מַלְכוּתוֹ לְעוֹלָם וָעֶד.',
        '',
        'וְאָהַבְתָּ אֵת יְהוָה אֱלֹהֶיךָ',
        'בְּכָל-לְבָבְךָ וּבְכָל-נַפְשְׁךָ וּבְכָל-מְאֹדֶךָ.',
        'וְהָיוּ הַדְּבָרִים הָאֵלֶּה',
        'אֲשֶׁר אָנֹכִי מְצַוְּךָ הַיּוֹם — עַל-לְבָבֶךָ.',
        '',
        'וְשִׁנַּנְתָּם לְבָנֶיךָ וְדִבַּרְתָּ בָּם,',
        'בְּשִׁבְתְּךָ בְּבֵיתֶךָ וּבְלֶכְתְּךָ בַדֶּרֶךְ,',
        'וּבְשָׁכְבְּךָ וּבְקוּמֶךָ.'
      ]
    },
    amida: {
      title: 'תפילת עמידה (פתיחה)',
      lines: [
        'אֲדֹנָי, שְׂפָתַי תִּפְתָּח,',
        'וּפִי יַגִּיד תְּהִלָּתֶךָ.',
        '',
        'בָּרוּךְ אַתָּה יְהוָה,',
        'אֱלֹהֵינוּ וֵאלֹהֵי אֲבוֹתֵינוּ,',
        '<span class="accent">אֱלֹהֵי אַבְרָהָם, אֱלֹהֵי יִצְחָק וֵאלֹהֵי יַעֲקֹב</span>.',
        '',
        'הָאֵל הַגָּדוֹל הַגִּבּוֹר וְהַנּוֹרָא,',
        'אֵל עֶלְיוֹן, גּוֹמֵל חֲסָדִים טוֹבִים,',
        'וְקוֹנֵה הַכֹּל, וְזוֹכֵר חַסְדֵי אָבוֹת,',
        'וּמֵבִיא גוֹאֵל לִבְנֵי בְנֵיהֶם,',
        'לְמַעַן שְׁמוֹ בְּאַהֲבָה.'
      ]
    },
    kaddish: {
      title: 'קדיש יתום',
      lines: [
        'יִתְגַּדַּל וְיִתְקַדַּשׁ שְׁמֵהּ רַבָּא',
        '<span class="accent">(אָמֵן)</span>',
        'בְּעָלְמָא דִּי בְרָא כִרְעוּתֵהּ,',
        'וְיַמְלִיךְ מַלְכוּתֵהּ,',
        'בְּחַיֵּיכוֹן וּבְיוֹמֵיכוֹן',
        'וּבְחַיֵּי דְכָל בֵּית יִשְׂרָאֵל,',
        'בַּעֲגָלָא וּבִזְמַן קָרִיב,',
        'וְאִמְרוּ אָמֵן.',
        '',
        '<span class="accent">יְהֵא שְׁמֵהּ רַבָּא מְבָרַךְ</span>',
        '<span class="accent">לְעָלַם וּלְעָלְמֵי עָלְמַיָּא</span>.'
      ]
    },
    havdala: {
      title: 'הבדלה',
      lines: [
        'הִנֵּה אֵל יְשׁוּעָתִי,',
        'אֶבְטַח וְלֹא אֶפְחָד.',
        'כִּי עָזִּי וְזִמְרָת יָהּ יְהוָה,',
        'וַיְהִי לִי לִישׁוּעָה.',
        '',
        'בָּרוּךְ אַתָּה יְהוָה אֱלֹהֵינוּ מֶלֶךְ הָעוֹלָם,',
        '<span class="accent">בּוֹרֵא פְּרִי הַגָּפֶן</span>.',
        '',
        'בָּרוּךְ אַתָּה יְהוָה אֱלֹהֵינוּ מֶלֶךְ הָעוֹלָם,',
        '<span class="accent">בּוֹרֵא מִינֵי בְשָׂמִים</span>.',
        '',
        'בָּרוּךְ אַתָּה יְהוָה אֱלֹהֵינוּ מֶלֶךְ הָעוֹלָם,',
        '<span class="accent">בּוֹרֵא מְאוֹרֵי הָאֵשׁ</span>.',
        '',
        'בָּרוּךְ אַתָּה יְהוָה אֱלֹהֵינוּ מֶלֶךְ הָעוֹלָם,',
        'הַמַּבְדִּיל בֵּין קֹדֶשׁ לְחֹל.'
      ]
    },
    hatikva: {
      title: 'התקווה',
      lines: [
        'כָּל עוֹד בַּלֵּבָב פְּנִימָה',
        'נֶפֶשׁ יְהוּדִי הוֹמִיָּה,',
        'וּלְפַאֲתֵי מִזְרָח קָדִימָה',
        'עַיִן לְצִיּוֹן צוֹפִיָּה.',
        '',
        '<span class="accent">עוֹד לֹא אָבְדָה תִּקְוָתֵנוּ,</span>',
        '<span class="accent">הַתִּקְוָה בַּת שְׁנוֹת אַלְפַּיִם,</span>',
        'לִהְיוֹת עַם חָפְשִׁי בְּאַרְצֵנוּ,',
        'אֶרֶץ צִיּוֹן וִירוּשָׁלָיִם.'
      ]
    },
    bracha: {
      title: 'ברכת כהנים',
      lines: [
        '<span class="accent">יְבָרֶכְךָ יְהוָה וְיִשְׁמְרֶךָ.</span>',
        '',
        '<span class="accent">יָאֵר יְהוָה פָּנָיו אֵלֶיךָ וִיחֻנֶּךָּ.</span>',
        '',
        '<span class="accent">יִשָּׂא יְהוָה פָּנָיו אֵלֶיךָ,</span>',
        '<span class="accent">וְיָשֵׂם לְךָ שָׁלוֹם.</span>'
      ]
    },
    psalms23: {
      title: 'תהלים כ"ג — מזמור לדוד',
      lines: [
        '<span class="verse-num">א</span>מִזְמוֹר לְדָוִד,',
        '<span class="accent">יְהוָה רֹעִי, לֹא אֶחְסָר</span>.',
        '<span class="verse-num">ב</span>בִּנְאוֹת דֶּשֶׁא יַרְבִּיצֵנִי,',
        'עַל-מֵי מְנֻחוֹת יְנַהֲלֵנִי.',
        '<span class="verse-num">ג</span>נַפְשִׁי יְשׁוֹבֵב,',
        'יַנְחֵנִי בְמַעְגְּלֵי-צֶדֶק לְמַעַן שְׁמוֹ.',
        '<span class="verse-num">ד</span>גַּם כִּי-אֵלֵךְ בְּגֵיא צַלְמָוֶת',
        'לֹא-אִירָא רָע, כִּי-אַתָּה עִמָּדִי.'
      ]
    },
    psalms121: {
      title: 'תהלים קכ"א — שיר למעלות',
      lines: [
        '<span class="verse-num">א</span>שִׁיר לַמַּעֲלוֹת,',
        'אֶשָּׂא עֵינַי אֶל-הֶהָרִים — מֵאַיִן יָבֹא עֶזְרִי.',
        '<span class="verse-num">ב</span><span class="accent">עֶזְרִי מֵעִם יְהוָה,</span>',
        '<span class="accent">עֹשֵׂה שָׁמַיִם וָאָרֶץ.</span>',
        '<span class="verse-num">ג</span>אַל-יִתֵּן לַמּוֹט רַגְלֶךָ,',
        'אַל-יָנוּם שֹׁמְרֶךָ.',
        '<span class="verse-num">ד</span>הִנֵּה לֹא יָנוּם וְלֹא יִישָׁן,',
        'שׁוֹמֵר יִשְׂרָאֵל.'
      ]
    }
  };

  const $ = (s) => document.querySelector(s);
  const stage = $('.cantor-stage');
  const text  = $('#cantorText');
  const sel   = $('#cantorPrayer');
  const btnPlay = $('#cantorPlay');
  const btnPlus = $('#cantorPlus');
  const btnMinus= $('#cantorMinus');
  const btnTheme= $('#cantorTheme');
  const btnFs   = $('#cantorFs');
  const progI   = $('#cantorProgress > i');

  let currentSize = 64;
  let scrollSpeed = 0.6; // px per frame
  let playing = false;
  let raf = 0;

  function render(){
    const p = PRAYERS[sel.value] || PRAYERS.shema;
    text.innerHTML = p.lines.map(l => l ? `<p>${l}</p>` : '<p>&nbsp;</p>').join('');
    stage.scrollTop = 0;
    updateProgress();
  }

  function setSize(px){
    currentSize = Math.max(28, Math.min(120, px));
    document.documentElement.style.setProperty('--c-size', currentSize + 'px');
  }

  function updateProgress(){
    const max = stage.scrollHeight - stage.clientHeight;
    const pct = max > 0 ? (stage.scrollTop / max) * 100 : 0;
    progI.style.width = pct + '%';
  }

  function play(){
    playing = true;
    btnPlay.classList.add('is-on');
    btnPlay.textContent = '❚❚';
    function loop(){
      if (!playing) return;
      stage.scrollTop += scrollSpeed;
      updateProgress();
      const max = stage.scrollHeight - stage.clientHeight;
      if (stage.scrollTop >= max){ pause(); return; }
      raf = requestAnimationFrame(loop);
    }
    raf = requestAnimationFrame(loop);
  }
  function pause(){
    playing = false;
    cancelAnimationFrame(raf);
    btnPlay.classList.remove('is-on');
    btnPlay.textContent = '▶';
  }

  sel.addEventListener('change', render);
  btnPlay.addEventListener('click',  () => playing ? pause() : play());
  btnPlus.addEventListener('click',  () => setSize(currentSize + 6));
  btnMinus.addEventListener('click', () => setSize(currentSize - 6));
  btnTheme.addEventListener('click', () => document.body.classList.toggle('is-hc'));
  btnFs.addEventListener('click', () => {
    const el = document.documentElement;
    if (!document.fullscreenElement && el.requestFullscreen) el.requestFullscreen();
    else if (document.exitFullscreen) document.exitFullscreen();
  });

  stage.addEventListener('scroll', updateProgress, { passive: true });
  window.addEventListener('resize', updateProgress);

  document.addEventListener('keydown', (e) => {
    if (e.target.tagName === 'INPUT' || e.target.tagName === 'SELECT') return;
    if (e.code === 'Space'){ e.preventDefault(); playing ? pause() : play(); }
    else if (e.key === '+' || e.key === '=') setSize(currentSize + 6);
    else if (e.key === '-' || e.key === '_') setSize(currentSize - 6);
    else if (e.key === 'ArrowUp')   { scrollSpeed = Math.min(3.5, scrollSpeed + 0.2); }
    else if (e.key === 'ArrowDown') { scrollSpeed = Math.max(0.1, scrollSpeed - 0.2); }
    else if (e.key === 'f' || e.key === 'F') btnFs.click();
    else if (e.key === 'h' || e.key === 'H') btnTheme.click();
  });

  render();
  setSize(64);

  // Wake-lock so the screen doesn't sleep during prayer leading
  if ('wakeLock' in navigator){
    let lock = null;
    const acquire = async () => { try { lock = await navigator.wakeLock.request('screen'); } catch{} };
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'visible' && !lock) acquire();
    });
    acquire();
  }
})();
