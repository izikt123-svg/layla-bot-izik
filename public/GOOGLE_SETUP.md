# 🔍 Google Setup — my-hom.net

מדריך מלא להפעלה של כל שירותי Google באתר. זמן הכנה: ~30 דקות.

---

## 1. 🌐 Google Search Console — אינדוקס באתר Google

### למה זה חשוב?
כדי שאנשים ימצאו את `my-hom.net` בחיפוש בגוגל. תוך כמה ימים האתר יוכל להופיע בתוצאות.

### צעדים:
1. **היכנס ל**: https://search.google.com/search-console
2. **הוסף נכס** → "תחילית URL" → `https://my-hom.net`
3. **בחר אימות עם meta tag**
4. **העתק את הקוד** שגוגל נותנים — נראה כמו `<meta name="google-site-verification" content="abc123XYZ..." />`
5. **פתח** [index.html](index.html), חפש `REPLACE_WITH_YOUR_GOOGLE_VERIFICATION_CODE`, **הדבק את הקוד** במקומו
6. **העלה את הקובץ** לשרת
7. **חזור ל-Search Console** ולחץ "אמת"
8. **שלח sitemap**: ב-Search Console → "Sitemaps" → הוסף `sitemap.xml`

### ✅ זה אומר שגוגל יסרוק את 18 העמודים שלך אוטומטית.

---

## 2. 📊 Google Analytics 4 — מי מבקר באתר

### צעדים:
1. **היכנס ל**: https://analytics.google.com
2. **צור Property חדש** → "הבית היהודי שלך בעולם"
3. **הוסף Data Stream** → Web → URL: `https://my-hom.net`
4. **העתק את ה-Measurement ID** — נראה כמו `G-XXXXXXXXXX`
5. **פתח** [index.html](index.html), **החלף את `G-REPLACE_ME` בשני המקומות** ב-ID שקיבלת
6. **בעת העלייה** — תוך 24 שעות תראה נתונים

### מה תראה:
- 👁️ צפיות
- 🌍 ממה מדינה
- 📱 מובייל / דסקטופ
- ⏱️ כמה זמן נשארו
- 🛣️ מאיפה הגיעו (גוגל / WhatsApp / ישיר)

---

## 3. 🔐 Google Sign-In — כניסה למשתמשים

### צעדים:
1. **היכנס ל**: https://console.cloud.google.com
2. **צור פרויקט חדש** → "הבית היהודי"
3. **APIs & Services → Credentials → Create Credentials → OAuth Client ID**
4. **Application Type: Web Application**
5. **שם**: `הבית היהודי - Web`
6. **Authorized JavaScript origins**:
   - `https://my-hom.net`
   - `http://localhost:8080` (לפיתוח)
7. **Authorized redirect URIs**:
   - `https://my-hom.net`
8. **Create** → תקבל **Client ID** (נראה כמו `123456789-abc.apps.googleusercontent.com`)
9. **פתח** [kz-google-auth.js](kz-google-auth.js), חפש `YOUR_GOOGLE_CLIENT_ID`, **הדבק את ה-Client ID** במקום

### ✅ עכשיו משתמשים יוכלו ללחוץ "כניסה עם Google" וייכנסו ישר.

---

## 4. 🗺️ Google Maps Embed (אופציונלי)

אם תרצה להוסיף מפת Google מובנית במקום Leaflet:
1. https://console.cloud.google.com → APIs & Services → **Maps JavaScript API** → Enable
2. צור API Key חדש
3. הגבל אותו ל-`https://my-hom.net/*`
4. תגיד לי ואחליף

---

## 5. 📺 Google Ads / AdSense (אם תרצה לעתיד)

לרוב לא רלוונטי לאתר תרומות / חינם, אבל אפשר. תגיד לי אם זה מעניין.

---

## 6. 📝 Google Tag Manager (לטכנולוגיים)

אופציה חזקה אם תרצה להוסיף בעתיד:
- Facebook Pixel
- TikTok Analytics
- Hotjar
- Custom events

ב-tagmanager.google.com → צור container → הוסף קוד אחד לאתר → ניהול הכל ממקום אחד.

---

## 🚀 סדר ההפעלה המומלץ

| # | שלב | זמן | חשיבות |
|---|---|---|---|
| 1 | Search Console + sitemap | 10 דק' | 🔴 חובה |
| 2 | Google Analytics 4 | 5 דק' | 🟡 מומלץ |
| 3 | Google Sign-In | 15 דק' | 🟡 מומלץ |
| 4 | Maps API | 5 דק' | 🟢 אופציונלי |

---

## ⚠️ הערות חשובות

### לפני העלייה ל-my-hom.net:
- וודא שכל ה-`REPLACE_ME` תוקנו ל-IDs אמיתיים
- בדוק ב-https://my-hom.net/sitemap.xml שהוא נטען
- בדוק ב-https://my-hom.net/robots.txt שהוא נכון
- אחרי העלייה — סרוק את האתר ב-Lighthouse כדי לוודא 90+

### עזרה:
אם נתקעת באחד השלבים — **תגיד לי** את הקוד / השלב, ואני אעזור.

---

## 🎯 צ'ק-ליסט סופי

- [ ] Search Console verification meta tag הוחלף
- [ ] sitemap.xml מועלה ל-`my-hom.net/sitemap.xml`
- [ ] Google Analytics G-XXX הוחלף בקוד
- [ ] Google Sign-In Client ID הוחלף ב-kz-google-auth.js
- [ ] sitemap נשלח ב-Search Console
- [ ] רן Lighthouse — ציון 90+

**כשמסיים** — האתר יהיה מאונדקס ב-Google תוך 3-7 ימים, וכל אדם יוכל למצוא אותו בחיפוש "מרכז התפילה" / "הבית היהודי" / "מפת חב"ד עולמית" / וכו'.
