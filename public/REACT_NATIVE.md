# 📱 React Native — אפליקציה אמיתית מהקוד

## הסבר ההיגיון
האתר הזה הוא PWA (Progressive Web App) — כבר עובד כאפליקציה במובייל. אבל לApp Store / Google Play צריך React Native אמיתי. קיימים 3 מסלולים:

---

## מסלול A: Capacitor (קל ומהיר — 2 שעות)
**הופך את האתר לאפליקציה native ללא כתיבת קוד מחדש.**

```bash
# 1. ייבוא
npm init -y
npm install @capacitor/core @capacitor/cli
npm install @capacitor/ios @capacitor/android

# 2. אתחול
npx cap init "הבית היהודי" com.tahori.tefila --web-dir=hostinger-site

# 3. הוסף פלטפורמות
npx cap add ios
npx cap add android

# 4. בנה
npx cap copy
npx cap open ios       # פותח Xcode
npx cap open android   # פותח Android Studio
```

**מה תקבל:**
- אותו קוד HTML/CSS/JS
- אייקונים native, push notifications native
- Camera/GPS native
- App Store + Play Store ready
- 95% מהפיצ'רים עובדים ישר

**חסרונות:**
- WebView מפעיל בפנים — ביצועים נמוכים מ-React Native אמיתי
- אנימציות מסוימות פחות חלקות

---

## מסלול B: Expo + React Native (מקצועי — 1-2 שבועות)
**אפליקציה native אמיתית, פיצ'רים מתורגמים בקפידה.**

### שלב 1: יצירת פרויקט
```bash
npx create-expo-app tefila-app --template
cd tefila-app
npx expo install react-native-screens react-native-safe-area-context
npx expo install expo-localization expo-haptics expo-linear-gradient
npx expo install expo-notifications expo-image-picker expo-location
```

### שלב 2: התקנת ספריות עיקריות
```bash
# UI primitives
npm install react-native-paper

# State
npm install zustand

# Maps
npx expo install react-native-maps

# Auth — Supabase
npm install @supabase/supabase-js react-native-url-polyfill

# Web view (לעמודי הסבר)
npx expo install react-native-webview

# Animations
npm install react-native-reanimated

# i18n
npm install i18next react-i18next
```

### שלב 3: מבנה תיקיות מומלץ
```
tefila-app/
├── app/                    (expo-router pages)
│   ├── _layout.tsx         (Topbar + tabs)
│   ├── index.tsx           (Home - Hero)
│   ├── feed.tsx            (Prayer feed)
│   ├── family/
│   │   ├── index.tsx       (Family room)
│   │   └── tehillim.tsx
│   ├── map.tsx             (Find Jewish)
│   ├── memorial.tsx        (Wall)
│   └── donate.tsx
├── components/
│   ├── HolySlider.tsx      (cinematic slider)
│   ├── PrayerCard.tsx
│   ├── CandleFlame.tsx     (Reanimated SVG flame)
│   ├── HebrewCalendar.tsx
│   └── LanguageSwitcher.tsx
├── lib/
│   ├── supabase.ts
│   ├── i18n.ts
│   └── store.ts            (zustand)
├── data/
│   └── jewish-places.ts    (port מ-data/jewish-places.js)
├── locales/                (20 שפות)
│   ├── he.json
│   ├── en.json
│   └── ...
└── assets/
    ├── images/holy/        (8 תמונות אופטימליות)
    └── fonts/              (Frank Ruhl Libre, Heebo)
```

### שלב 4: המרת רכיבים מרכזיים

**HolySlider.tsx** (במקום kz-hero-slider.js):
```tsx
import { useState, useEffect } from 'react';
import { View, Image, Text, FlatList, Dimensions } from 'react-native';
import Animated, { useSharedValue, withTiming } from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';

const HOLY = [/* port מ-kz-hero-slider.js */];

export function HolySlider(){
  const [idx, setIdx] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setIdx(i => (i + 1) % HOLY.length), 6000);
    return () => clearInterval(t);
  }, []);

  const item = HOLY[idx];
  return (
    <View style={{ height: 460 }}>
      <Image source={{ uri: item.photo }} style={{ position:'absolute', inset:0 }}/>
      <LinearGradient colors={['transparent','#0B1F3A']} style={{...}}/>
      <View style={{ position:'absolute', bottom:30, left:30 }}>
        <Text style={{ color:'#f1d597', fontSize:11 }}>{item.tag}</Text>
        <Text style={{ color:'#fff', fontSize:32, fontFamily:'FrankRuhlLibre' }}>{item.name}</Text>
        <Text style={{ color:'#fff', fontStyle:'italic' }}>{item.quote}</Text>
      </View>
    </View>
  );
}
```

**FamilyRoom** — port הלוגיקה המלאה כ-Zustand store + רכיבים.

### שלב 5: Real-time עם Supabase
זהה ל-`kz-auth-supabase.js` בדיוק. הפעל את אותם hooks ופונקציות.

### שלב 6: Push notifications
```bash
npx expo install expo-notifications
```

```ts
import * as Notifications from 'expo-notifications';
const token = await Notifications.getExpoPushTokenAsync();
// שמור ב-Supabase, שלח push דרך Expo Push Service (חינם)
```

### שלב 7: Build + Deploy
```bash
# iOS (App Store)
eas build --platform ios

# Android (Play Store)
eas build --platform android
```

---

## מסלול C: PWA + Trusted Web Activity (חינם, מהיר)
**רק ל-Android — האתר הקיים נארז כאפליקציה.**

```bash
npm install -g @bubblewrap/cli
bubblewrap init --manifest=https://yourdomain.com/manifest.webmanifest
bubblewrap build
```

תקבל APK שמתקין כאפליקציה ב-Play Store.

---

## ההמלצה שלי:
1. **שלב מיידי**: PWA install — האתר כבר תומך, משתמשים יכולים "Add to Home Screen". אין צורך בכלום.
2. **שלב 1**: Capacitor (סוף שבוע אחד) — להעלות ל-App Store + Play Store.
3. **שלב 2**: עיבוד הדרגתי ל-React Native אם יהיה צורך בפיצ'רים native מתקדמים יותר.

המסלול C (Bubblewrap) הכי קל לכניסה ל-Play Store בלי שום עבודה.
