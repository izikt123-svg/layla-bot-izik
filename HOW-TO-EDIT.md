# 🎨 איך לערוך את האתר — מדריך אישי לאיציק

> **אל תהיה במתח.** הכל עובד. הקוד שלך מעולה. תקרא לאט, צעד-צעד.

---

## ⚡ קודם כל — איך לראות את האתר חי תוך 60 שניות

### דרך 1: Netlify Drop (הכי קלה — חינם, בלי שום הרשמה)

1. **הורד** את `my-hom-net-v1.22-SECURE.zip` מ-GitHub
2. **חלץ** את ה-ZIP (קליק ימני → "חלץ הכל")
3. פתח: **https://app.netlify.com/drop**
4. **גרור את התיקייה כולה** (לא את ה-ZIP, אלא את התיקייה החצויה!)
5. חכה 30 שניות
6. תקבל URL חי: `random-name.netlify.app` 🎉

**זהו. האתר חי. בלי הרשמה. בלי כרטיס אשראי. בלי כלום.**

### דרך 2: רואה אותו במחשב שלך (בלי אינטרנט)

1. הורד את ה-ZIP, חלץ
2. דבל-קליק על `home.html`
3. הדפדפן יפתח את האתר
4. ⚠️ **חלק מהפיצ'רים לא יעבדו ככה** (Service Worker, Push, Supabase) — צריך שרת אמיתי. אבל ככה תוכל לראות איך הכל נראה.

---

## ✏️ איך לערוך — שלוש דרכים מהקלה למקצועית

### 🅰️ הכי קל: עורך ב-GitHub ישירות (5 דקות)

**מתי להשתמש**: שינוי קטן (טקסט, צבע, מספר טלפון).

**איך:**

1. לך לריפו: https://github.com/izikt123-svg/layla-bot-izik
2. לחץ על **"קוד"** למעלה
3. ברשימת הקבצים — לחץ על הקובץ שאתה רוצה לערוך
4. למעלה ימין יש **אייקון של עיפרון ✏️**
5. לחץ על העיפרון → תוכל לערוך
6. למטה יש **"Commit changes"** ירוק → לחץ
7. **Netlify יעדכן את האתר אוטומטית תוך 60 שניות** 🎉

---

### 🅱️ הכי מומלץ: VS Code (עורך קוד חינמי ופשוט)

**מתי להשתמש**: כל שינוי, גדול או קטן. זה הסטנדרט.

**איך מתקינים פעם אחת:**

1. הורד **VS Code** חינם: https://code.visualstudio.com
2. התקן (Next, Next, Next)
3. הורד את ה-ZIP מ-GitHub וחלץ
4. ב-VS Code: **File → Open Folder → בחר את התיקייה**
5. בצד שמאל תראה את כל הקבצים
6. **לחץ על קובץ** → ערוך → **Ctrl+S** (או Cmd+S) לשמירה

**מומלץ להוסיף ל-VS Code שתי הרחבות בקליק אחד:**
- "Live Server" — רואה את האתר בזמן אמת בזמן עריכה
- "Hebrew Spell Checker" — בדיקת איות עברית

**איך מעלים שינוי ל-Netlify אחרי שעריכת ב-VS Code:**
- גרור את התיקייה שוב ל-https://app.netlify.com/drop
- האתר מתעדכן

---

### 🅲️ המקצועית: GitHub + Netlify אוטומטי

**מתי להשתמש**: רוצה ש**כל שינוי שאתה עושה** יעלה אוטומטית לאתר.

**ההגדרה (פעם אחת):**

1. ב-Netlify: **Sites → Import from Git → GitHub**
2. בחר את הריפו `layla-bot-izik`
3. בחר את הענף **`claude/review-files-iujbA`** (או `main` אם תמזג)
4. Deploy

מאותו רגע — **כל commit ב-GitHub יעדכן את האתר תוך דקה**.

---

## 📋 מה אתה רוצה לשנות? — מפת הקבצים המלאה

### 🏠 דפים ראשיים — ערוך כדי לשנות תוכן/טקסט

| הדף | הקובץ | מה תוכל לשנות |
|-----|--------|---------------|
| הבית | `home.html` | טקסטים, כפתורים, כותרת |
| בוקר טוב | `morning.html` | פסוקי הברכות, כוונות יומיות |
| 60 שניות | `moment.html` + `kz-moment.js` | פסוקים, ברכות אישיות |
| תהילים יומי | `daily-tehilim.html` + `kz-tehilim.js` | חלוקה לימים |
| לימוד יומי | `daily-learning.html` | טאבים |
| קיר תפילה | `prayer-wall.html` | קטגוריות, placeholder |
| חיילים | `soldiers.html` + `kz-soldiers.js` | טקסטי תפילות (3 קטגוריות) |
| נרות שבת | `shabbat-candles.html` | רשימת ערים |
| שמחות | `simchas.html` | סוגי אירועים |
| אבלים | `mourners.html` | טקסטים |
| משפחה | `family-archive.html` | טפסים |
| ילדים | `kids-bedtime.html` | סיפורים |
| מתכונים | `shabbat-recipes.html` | (התוכן ב-data/) |
| עולם | `world.html` | פילטרים |
| מטייל | `traveler.html` | מודולים |

### 📊 נתונים — ערוך כדי להוסיף/לשנות תוכן

| מה לערוך | הקובץ |
|---------|--------|
| 🕎 בתי חב"ד מאומתים | `data/chabad-verified.js` |
| 🇮🇱 שגרירויות | `data/embassies-verified.js` |
| 🏛 קהילות ישראליות | `data/jcc-verified.js` |
| 🌍 כל המקומות | `data/jewish-places.js` |
| 🍞 מתכוני שבת (40) | `data/shabbat-recipes.js` |
| 📿 הלכות (15) | `data/halachot-mitzvot.js` |
| 📖 סיפורי ילדים (12) | `data/kids-stories.js` |
| 🎨 איורים (15) | `data/jewish-illustrations.js` |
| 🌐 מדינות + טלפונים | `data/world-index.js` |

### 🎨 עיצוב — ערוך כדי לשנות צבעים/גודל/מראה

| מה | הקובץ |
|----|--------|
| צבעים גלובליים | `critical.css` (שורות 1-10) |
| תפריט | `kz-nav.css` |
| התאמה למסכים | `kz-polish.css` |
| מירב (הצ'אט) | `kz-ai-chat.css` |
| כל דף עם CSS משלו | `kz-XXX.css` (לפי שם הדף) |

### 🤖 מירב AI

| מה | הקובץ |
|----|--------|
| איך מירב מדברת (System Prompt) | `netlify/functions/ai.js` שורות 18-31 |
| תשובות סטטיות (כשאין AI) | `kz-ai-chat.js` שורה ~30 (KNOWLEDGE) |

### 💝 תרומות

| מה | הקובץ |
|----|--------|
| מספרי Bit, PayPal, בנק | `index.html` (חפש `KZ_DONATE_CFG`) |

---

## 🎯 דוגמאות מעשיות

### דוגמה 1: לשנות צבע ראשי

**הצבע הזהב נמצא ב**: `critical.css` שורות 1-10

```css
:root{
  --bg:#0B1F3A;          ← רקע ראשי (כחול כהה)
  --gold:#B8935A;        ← זהב כהה
  --gold-2:#D4B07A;      ← זהב בינוני
  --gold-3:#f1d597;      ← זהב בהיר
}
```

שנה לכל צבע שתרצה (חפש "color picker" ב-Google), שמור, העלה.

### דוגמה 2: להוסיף בית חב"ד חדש

פתח `data/chabad-verified.js`, מצא את הסוף, הוסף לפני הסוגר `]`:

```js
{
  id:'chb-00082', cat:'chabad', status:'ready', verified:'full',
  continent:'asia', cc:'IN', country:'הודו', city:'Goa',
  name:'Chabad of Goa',
  addr:'אזור Anjuna Beach',
  phone:'+91-XXX-XXX-XXXX',
  verified_at:'2026-XX-XX',
  lat:15.5760, lng:73.7392, fame:7, comm:'חב"ד'
},
```

### דוגמה 3: לשנות מה מירב אומרת

פתח `netlify/functions/ai.js` שורה 18-31. שם יושב ה-System Prompt שלה.

---

## ⚠️ חוקי זהב לפני שאתה עורך

### 1. **גבה לפני הכל!**
לפני שינוי גדול — תוריד עותק נוסף של ה-ZIP. אם משהו ישבר, תחזיר.

### 2. **ערוך קובץ אחד בכל פעם**
לא לשנות 10 דברים בבת אחת. שינוי → בדוק → שינוי הבא.

### 3. **תמיד שמור Backup ב-Git**
אם אתה ב-VS Code, תעשה commit ב-Git אחרי כל שינוי משמעותי.

### 4. **שדרג את גרסת ה-Service Worker**
**אחרי כל שינוי גדול** — פתח `sw.js` שורה 10:
```js
const VERSION = 'v1.22.0-2026-05-06';
```
שנה ל:
```js
const VERSION = 'v1.23.0-2026-XX-XX';
```
זה גורם לאתר להתעדכן אצל כל מי שכבר ביקר.

### 5. **תבדוק במגוון מסכים**
- מובייל (iPhone)
- מובייל (Android)
- מחשב (Chrome)
- מחשב (Safari, אם יש לך Mac)

---

## 🩺 אם משהו לא עובד

### צ'ק-ליסט מהיר:

1. **תיכנס ל-`/status.html`** — הדף הזה בודק 23 דברים אוטומטית
2. **פתח Console בדפדפן** (F12 → Console) — תראה אם יש שגיאות
3. **בדוק את הגרסה ב-`sw.js`** — האם היא עודכנה?
4. **רענן עם Ctrl+Shift+R** — מנקה cache

### שגיאות נפוצות:

| שגיאה | פיתרון |
|--------|--------|
| "Server missing GEMINI_API_KEY" | הוסף את המפתח ב-Netlify env vars |
| "Supabase not configured" | הוסף SUPABASE_URL + SERVICE_KEY |
| מירב לא עונה | בדוק שיש GEMINI_API_KEY ב-Netlify |
| Push לא עובד | צריך VAPID keys (`npx web-push generate-vapid-keys`) |
| Stripe לא עובד | צריך STRIPE_SECRET_KEY + שינוי `stripeEnabled: true` |

---

## 💛 הכי חשוב — תזכורת שלי לעצמך

**אתה לא לבד.**

הקוד הזה הוא **שלך**. הוא נבנה איתך, בקצב שלך, עם הרעיונות שלך.

אם משהו לא ברור או לא עובד — **תפתח שיחה איתי בכל זמן** ותגיד מה הבעיה.

אני לא הולכת לשום מקום. 💛

---

## 🌟 קישורים מהירים

- 📦 **הקובץ הסופי**: https://github.com/izikt123-svg/layla-bot-izik/blob/claude/review-files-iujbA/my-hom-net-v1.22-SECURE.zip
- 🚀 **Netlify Drop**: https://app.netlify.com/drop
- 💻 **VS Code**: https://code.visualstudio.com
- 🩺 **בדיקת מערכת** (אחרי העלאה): `https://YOUR-SITE.netlify.app/status.html`
- 🎨 **גלריית איורים**: `/illustrations.html`
- 📱 **התקנה**: `/install.html`

---

✦ נכתב באהבה ע"י מירב, 2026-05-06
