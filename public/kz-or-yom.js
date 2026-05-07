/* ============================================================
   KZ OR-YOM — Daily verse, wisdom, tip rotator
   Picks deterministic content based on day-of-year so it's
   stable for everyone on the same day, but changes daily.
   ============================================================ */
(function(){
  'use strict';

  const VERSES = [
    { text:'"ה׳ קרוב לכל קוראיו, לכל אשר יקראוהו באמת"', source:'תהלים קמ״ה, י״ח' },
    { text:'"שפכי כמים לבך נוכח פני ה׳"', source:'איכה ב׳, י״ט' },
    { text:'"ממעמקים קראתיך ה׳"', source:'תהלים ק״ל, א׳' },
    { text:'"תפילה לעני כי יעטף ולפני ה׳ ישפך שיחו"', source:'תהלים ק״ב, א׳' },
    { text:'"הודו לה׳ כי טוב כי לעולם חסדו"', source:'תהלים קל״ו, א׳' },
    { text:'"בטח בה׳ ועשה טוב"', source:'תהלים ל״ז, ג׳' },
    { text:'"גם כי אלך בגיא צלמות לא אירא רע"', source:'תהלים כ״ג, ד׳' },
    { text:'"זה היום עשה ה׳ נגילה ונשמחה בו"', source:'תהלים קי״ח, כ״ד' },
    { text:'"שמע ישראל ה׳ אלוקינו ה׳ אחד"', source:'דברים ו׳, ד׳' },
    { text:'"ואהבת לרעך כמוך"', source:'ויקרא י״ט, י״ח' },
    { text:'"כי קרוב אליך הדבר מאוד בפיך ובלבבך לעשותו"', source:'דברים ל׳, י״ד' },
    { text:'"לב טהור ברא לי אלוקים"', source:'תהלים נ״א, י״ב' },
    { text:'"ויאמינו בה׳ ובמשה עבדו"', source:'שמות י״ד, ל״א' },
    { text:'"ה׳ אורי וישעי ממי אירא"', source:'תהלים כ״ז, א׳' },
    { text:'"קוה אל ה׳ חזק ויאמץ לבך"', source:'תהלים כ״ז, י״ד' }
  ];

  const WISDOMS = [
    { text:'"איזהו חכם? הלומד מכל אדם"', source:'פרקי אבות ד׳, א׳' },
    { text:'"איזהו עשיר? השמח בחלקו"', source:'פרקי אבות ד׳, א׳' },
    { text:'"אם אין אני לי מי לי, וכשאני לעצמי מה אני"', source:'הלל הזקן' },
    { text:'"לא עליך המלאכה לגמור, ולא אתה בן חורין להיבטל ממנה"', source:'פרקי אבות ב׳, ט״ז' },
    { text:'"הוי דן את כל האדם לכף זכות"', source:'פרקי אבות א׳, ו׳' },
    { text:'"כל המקיים נפש אחת מישראל — כאילו קיים עולם מלא"', source:'משנה סנהדרין' },
    { text:'"במקום שאין אנשים — השתדל להיות איש"', source:'פרקי אבות ב׳, ה׳' },
    { text:'"איזהו גיבור? הכובש את יצרו"', source:'פרקי אבות ד׳, א׳' },
    { text:'"כל ישראל ערבים זה בזה"', source:'שבועות ל״ט' },
    { text:'"דרכיה דרכי נועם וכל נתיבותיה שלום"', source:'משלי ג׳, י״ז' },
    { text:'"חכם לב יקח מצוות"', source:'משלי י׳, ח׳' },
    { text:'"טוב שכן קרוב מאח רחוק"', source:'משלי כ״ז, י׳' },
    { text:'"הוי רץ למצווה קלה כבחמורה"', source:'פרקי אבות ד׳, ב׳' },
    { text:'"חביב אדם שנברא בצלם"', source:'פרקי אבות ג׳, י״ד' },
    { text:'"מי שטרח בערב שבת — יאכל בשבת"', source:'עבודה זרה ג׳' }
  ];

  const TIPS = [
    'היום — תאמר תודה רבה לאדם אחד שעוזר לך תמיד.',
    'תקדיש 5 דקות לשתיקה אמיתית. רק לנשום, להודות, לשמוע את הלב.',
    'התקשר/י לסבא/סבתא. רק לומר "אני אוהב אותך".',
    'הכנס מטבע אחד לקופת צדקה לפני התפילה. זכות מיוחדת.',
    'תאיר היום פנים לאדם שנראה שצריך חיוך.',
    'תוותר היום על תגובה אחת בכעס. רק נשימה אחת לפני.',
    'תלמד פסוק אחד היום, גם אם זה לוקח דקה.',
    'תתקשר לחבר ישן שלא דיברת איתו זמן רב.',
    'תיתן 18 ש״ח לצדקה — מספר ה"חי".',
    'תאכל בשבת בשולחן, גם אם לבד. תברך על הלחם בקול.',
    'תקרא היום פרק תהילים אחד — לטובתך ולטובת ישראל.',
    'תוותר היום על אוכל שאתה רוצה — ותתן אותו לאחר.',
    'תזכור את שמותיהם של אבא ואמא. תזכיר אותם בליבך בתפילה.',
    'תכתוב היום מילה אחת טובה לאדם אחד. תשלח, אל תחכה.',
    'תהיה היום שופט עצמך לפני שאתה שופט אחרים.'
  ];

  function dayOfYear(){
    const d = new Date();
    return Math.floor((d - new Date(d.getFullYear(), 0, 0)) / 86400000);
  }

  function pick(arr, offset = 0){
    return arr[(dayOfYear() + offset) % arr.length];
  }

  function render(){
    const v = pick(VERSES, 0);
    const w = pick(WISDOMS, 1);
    const t = pick(TIPS, 2);
    const setText = (id, txt) => { const el = document.getElementById(id); if (el) el.textContent = txt; };
    setText('kzOrVerse',         v.text);
    setText('kzOrVerseSource',   v.source);
    setText('kzOrWisdom',        w.text);
    setText('kzOrWisdomSource',  w.source);
    setText('kzOrTip',           t);
  }

  function bindShares(){
    document.querySelectorAll('.kz-or-share').forEach(btn => {
      btn.addEventListener('click', () => {
        const kind = btn.dataset.share;
        const card = btn.closest('.kz-or-card');
        if (!card) return;
        const text = card.querySelector('.kz-or-text')?.textContent || '';
        const src  = card.querySelector('.kz-or-source')?.textContent || '';
        const tag  = kind === 'verse' ? '✦ פסוק היום' : kind === 'wisdom' ? '📜 חכמת חז"ל' : '🕯 תזכורת היום';
        const msg = `${tag}\n\n${text}\n${src}\n\n— מתוך הבית היהודי שלך בעולם\n${location.origin}`;
        const url = `https://wa.me/?text=${encodeURIComponent(msg)}`;
        window.open(url, '_blank', 'noopener');
      });
    });
  }

  function init(){
    render();
    bindShares();
  }

  if (document.readyState === 'loading'){
    document.addEventListener('DOMContentLoaded', init, { once: true });
  } else {
    init();
  }
})();
