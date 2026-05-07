# ⚡ Lighthouse 95+ Performance Guide

## כיצד להגיע ל-95+ בכל קטגוריה ב-Lighthouse

### 1. 🖼️ אופטימיזציית תמונות (חיוני)

תמונות הסליידר מ-Wikimedia כבדות מאוד. בצע:

```bash
# התקן imagemagick / squoosh
npm install -g @squoosh/cli

# המר כל תמונה ל-WebP בגודל אופטימלי
squoosh-cli --webp '{quality:75}' --resize '{width:1280}' images/*.jpg
```

לחלופין:
1. הורד את 8 התמונות ל-`images/holy/`
2. דחוס דרך https://squoosh.app
3. שמור כ-`.webp` (חיסכון ~70%)
4. עדכן את `kz-hero-slider.js`:

```js
photo: 'images/holy/kotel.webp'  // במקום ה-URL מ-Wikimedia
```

### 2. ⚙️ Defer + Module Loading

עדכן את כל ה-script tags בעמודי HTML:

```html
<!-- ב-<head> -->
<link rel="preload" href="styles.css" as="style">
<link rel="preload" href="script.js" as="script">

<!-- בסוף <body> -->
<script src="script.js" defer></script>
<script type="module" src="kz-elevate.js"></script>
```

### 3. 🎨 Inline Critical CSS

הקבצים הקיימים גדולים. שלוף את ה-CSS הקריטי (above-the-fold) ל-`<style>` inline:

```bash
npm install -g critical
critical index.html --base hostinger-site/ --inline > index-optimized.html
```

### 4. 🗜️ Minify

```bash
npm install -g html-minifier-terser cssnano-cli terser

# CSS
cat *.css | cssnano > all.min.css

# JS
terser script.js kz-elevate.js kz-alive.js -o all.min.js -c -m

# HTML
html-minifier-terser --collapse-whitespace --remove-comments index.html -o index.min.html
```

### 5. 🌐 Caching Headers

ב-Hostinger:
- צור `.htaccess`:
```
<IfModule mod_expires.c>
  ExpiresActive On
  ExpiresByType image/* "access plus 1 year"
  ExpiresByType text/css "access plus 1 month"
  ExpiresByType application/javascript "access plus 1 month"
  ExpiresByType application/json "access plus 1 day"
</IfModule>

<IfModule mod_deflate.c>
  AddOutputFilterByType DEFLATE text/html text/css application/javascript application/json
</IfModule>
```

### 6. 📦 Service Worker — Cache Aggressively

עדכן את [sw.js](sw.js) להוסיף את כל הקבצים החדשים ב-precache:

```js
const CACHE = 'kz-v2';
const ASSETS = [
  '/', '/index.html', '/family-room.html', '/find-jewish.html',
  '/styles.css', '/kz-elevate.css', '/kz-alive.css', '/kz-i18n.css',
  '/kz-vocalized.css', '/kz-hero-slider.css', '/kz-supreme.css', '/kz-responsive.css',
  '/script.js', '/kz-elevate.js', '/kz-alive.js', '/kz-i18n.js',
  '/kz-hero-slider.js', '/kz-supreme.js',
  '/data/jewish-places.js'
];
```

### 7. 🌳 Tree-shaking + Bundle (אופציונלי, לשיפור משמעותי)

הסבת הפרויקט ל-Vite:
```bash
npm create vite@latest tefila-prod -- --template vanilla
# העתק את כל הקבצים
npm install
npm run build
```

תקבל bundle של ~150KB דחוס במקום 500KB+.

### 8. 🎯 Image lazy loading
כל ה-img tags כבר עם `loading="lazy"` חוץ מהראשונה.

### 9. 🌐 CDN
העבר ל-Netlify/Cloudflare Pages — חינם, מהיר פי 5 מ-Hostinger באירופה/ארה"ב.

### 10. ✅ בדיקה
```bash
npm install -g lighthouse
lighthouse https://yourdomain.com --view
```

---

## טיפים מהירים שכבר נעשו אוטומטית:

✅ Fluid typography עם `clamp()`
✅ `prefers-reduced-motion` כיבוד
✅ `loading="lazy"` בתמונות
✅ Defer scripts בעמודי המשנה
✅ CSS variables (no preprocessor)
✅ Mobile-first responsive
✅ PWA manifest + service worker
✅ Safe-area insets ל-iPhone
✅ `font-display: swap` (Google Fonts default)

## מה עוד נשאר לעשות:

- [ ] הורדת תמונות הולי לתיקייה מקומית + WebP
- [ ] Inline critical CSS
- [ ] Bundle + minify
- [ ] CDN deployment
