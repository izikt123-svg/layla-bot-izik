# layla-bot-izik

ריפו זה מכיל כמה פרויקטים נפרדים. ראה התפלגות למטה.

## מבנה הריפו

```
.
├── index.js              # בוט WhatsApp "לילה" של GoTours (פעיל בפרודקשן ב-Render)
├── package.json
├── archive/
│   └── my-hom-net.zip    # ארכיון אתר KZ / my-hom-net (75 קבצי HTML/CSS/JS)
└── docs/
    └── alon-tahori-system/   # מפרט מערכת CRM+ERP+AI למשרד ייעוץ מס אלון טהורי
```

## הפרויקטים

### 1. בוט WhatsApp "לילה" — GoTours

קובץ `index.js`. בוט תגובה אוטומטית מבוסס Google Gemini 1.5 Flash, רץ עם `whatsapp-web.js` + Express, פרוס על Render.

**הפעלה:**
```bash
npm install
npm start
```

נדרש `API_KEY` (Google Generative AI) כמשתנה סביבה.

### 2. ארכיון my-hom-net (KZ)

`archive/my-hom-net.zip` — אתר תיירות יהודי סטטי. נשמר כאסמכתא בלבד, לא מורץ מהריפו הזה.

### 3. מפרט מערכת אלון טהורי

`docs/alon-tahori-system/` — מסמך תכנון מלא של מערכת CRM + ERP + AI למשרד ייעוץ מס. נכון לעכשיו: **מסמך בלבד, ללא קוד**. ראה [docs/alon-tahori-system/README.md](./docs/alon-tahori-system/README.md) לתוכן עניינים.

## בראנצ'ים

- `main` — בוט לילה היציב.
- `claude/wetech-content-migration-8OsVb` — מיגרציה של תוכן wetech: הוספת מפרט אלון טהורי וארגון הריפו.
