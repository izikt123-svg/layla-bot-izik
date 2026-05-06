# 🛠 הוראות חיבור — הבית היהודי שלך בעולם

מסמך זה מסביר איך לחבר את כל ה-integrations האמיתיים. כרגע האתר עובד 100% מקומית, אבל כדי להפוך אותו ל-production-ready עם משתמשים, תרומות אמיתיות, וסנכרון בין מכשירים — תצטרך לעקוב אחרי השלבים:

---

## 1. 💝 חיבור תרומות אמיתיות

ערוך את הקובץ [kz-supreme.js](kz-supreme.js) שורה 270 בערך:

```js
const DONATE_CONFIG = {
  paypalMe:     'YourPayPalUsername',         // ← החלף
  bitPhone:     '050-0000000',                // ← מספר ביט
  payboxLink:   'https://payboxapp.page.link/...', // ← קישור PayBox
  nedarimPlus:  'https://www.matara.pro/nedarimplus/online?mosad=...',
  bankAccount:  { bank:'בנק לאומי', branch:'XXX', account:'XXXXXX', name:'שמך' }
};
```

### איך מקבלים PayPal.me:
1. https://paypal.com → Profile → Add PayPal.Me link
2. בחר username — יהיה `paypal.me/USERNAME`
3. החלף `YourPayPalUsername` ב-`USERNAME` שלך

### איך מקבלים PayBox link:
1. פתח אפליקציית PayBox → **קבלת תשלום**
2. **שתף קישור** → קבל URL של `payboxapp.page.link/...`
3. הדבק ב-`payboxLink`

### Bit:
- אין URL scheme אוטומטי — נציג למשתמש את המספר + QR code שכבר עובד.
- שנה את `bitPhone` למספר הביט שלך.

---

## 2. 🔐 חיבור משתמשים אמיתי (Supabase)

### למה Supabase?
- **חינם** עד 50,000 משתמשים פעילים
- DB + Auth + Storage + Realtime — הכל ב-1
- אין כרטיס אשראי בהתחלה

### שלב 1 — צור חשבון
1. https://supabase.com → Sign up (Google/GitHub)
2. **New Project** → תן שם "tefila"
3. בחר אזור (Frankfurt קרוב לישראל)
4. סיסמה חזקה ל-DB → שמור!

### שלב 2 — קבל את ה-API keys
1. Project Settings → **API**
2. העתק:
   - `Project URL` → e.g. `https://abcdefgh.supabase.co`
   - `anon public` key

### שלב 3 — מלא בקובץ
ערוך [kz-auth-supabase.js](kz-auth-supabase.js):

```js
const SUPABASE_CONFIG = {
  url:     'https://abcdefgh.supabase.co',  // ← הדבק
  anon:    'eyJhbGc...',                     // ← הדבק
  enabled: true                              // ← שנה ל-true
};
```

### שלב 4 — צור טבלאות (SQL)
ב-Supabase Dashboard → SQL Editor → הדבק:

```sql
-- User data sync table
create table user_data (
  user_id uuid references auth.users primary key,
  praying jsonb default '[]'::jsonb,
  mine jsonb default '[]'::jsonb,
  family jsonb,
  candles jsonb default '[]'::jsonb,
  updated_at timestamp with time zone default now()
);
alter table user_data enable row level security;
create policy "Users can view own data" on user_data for select using (auth.uid() = user_id);
create policy "Users can insert own data" on user_data for insert with check (auth.uid() = user_id);
create policy "Users can update own data" on user_data for update using (auth.uid() = user_id);

-- Global prayers feed
create table prayers (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users,
  cat text not null,
  text text,
  for_whom text,
  count integer default 0,
  status text default 'פעילה',
  created_at timestamp with time zone default now()
);
alter table prayers enable row level security;
create policy "Anyone can view prayers" on prayers for select using (true);
create policy "Authenticated can insert" on prayers for insert with check (auth.uid() is not null);

-- Memorial candles (global wall)
create table memorial_candles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users,
  name text not null,
  by_name text,
  photo_url text,
  created_at timestamp with time zone default now()
);
alter table memorial_candles enable row level security;
create policy "Anyone can view candles" on memorial_candles for select using (true);
create policy "Authenticated can insert" on memorial_candles for insert with check (auth.uid() is not null);
```

### שלב 5 — הפעל Storage
1. **Storage** בתפריט → New bucket → name: `candle-photos`
2. **Public** ✓
3. תאפשר העלאת תמונות נרות לסנכרון בין מכשירים

### שלב 6 — הוסף בHTML
ב-`<head>` של [index.html](index.html), [family-room.html](family-room.html), [find-jewish.html](find-jewish.html):

```html
<script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>
<script src="kz-auth-supabase.js" defer></script>
```

### שלב 7 — הפעל Google Sign-In (אופציונלי)
1. Authentication → Providers → **Google**
2. **Enable**
3. צור OAuth ב-Google Cloud Console → הדבק Client ID + Secret

---

## 3. 🔔 Push Notifications אמיתיים

### אפשרות A: Web Push (חינם, פשוט)
שירות `web-push` עם Cloud Function:
1. `npm install web-push`
2. צור VAPID keys: `npx web-push generate-vapid-keys`
3. שמור public + private keys
4. שדרג את `sw.js` (service worker) להאזין ל-push events
5. הוסף ב-Supabase Edge Function שמטריק push כשנוצרת תפילה חדשה

### אפשרות B: OneSignal (חינם, פשוט יותר)
1. https://onesignal.com → Sign up
2. צור Web Push App
3. הדבק את ה-init script שהם נותנים בכל עמוד
4. **Done** — יש לך push לכל המשתמשים

---

## 4. 📸 חיבור Cloudinary לתמונות (אופציונלי)
אם תרצה שתמונות הנרות לא יישמרו ב-localStorage אלא ב-cloud אמיתי:

1. https://cloudinary.com → חשבון חינם (25GB)
2. קבל `cloud_name` + `upload_preset` (unsigned)
3. הוסף ל-`kz-supreme.js`:

```js
async function uploadToCloudinary(file){
  const fd = new FormData();
  fd.append('file', file);
  fd.append('upload_preset', 'YOUR_PRESET');
  const res = await fetch(`https://api.cloudinary.com/v1_1/YOUR_CLOUD/image/upload`, {
    method: 'POST', body: fd
  });
  const data = await res.json();
  return data.secure_url;
}
```

---

## 5. 📱 הסבה ל-React Native (אפליקציה אמיתית)

ראה [REACT_NATIVE.md](REACT_NATIVE.md) להוראות מלאות.

---

## 6. ⚡ אופטימיזציה ל-Lighthouse 95+

ראה [PERFORMANCE.md](PERFORMANCE.md) להוראות מלאות.

---

## 7. 🚀 פריסה לפרודקשן

### Hostinger:
1. Upload כל קבצי `hostinger-site/` ל-`public_html/`
2. SSL פעיל אוטומטית
3. Done

### Netlify (מומלץ — חינם, מהיר יותר):
1. https://netlify.com → New Site from Git (או drag-drop folder)
2. Domain → custom domain שלך
3. HTTPS אוטומטי
4. CDN ברחבי העולם
