# 💪 GymTracker Pro — دليل التشغيل الكامل

تطبيق تتبع تمارين احترافي (React Native + Expo + Firebase) لبرنامج التضخيم بتاعك.

---

## 📁 هيكلة المشروع

```
GymTracker/
├── App.js                          ← نقطة البداية
├── app.json                        ← إعدادات Expo (اسم، أيقونة، splash)
├── eas.json                        ← إعدادات بناء APK
├── babel.config.js
├── package.json
├── firebase.js                     ← إعدادات Firebase (هتحط بياناتك هنا)
└── src/
    ├── data/
    │   └── workoutData.js          ← كل التمارين + دورة الـ3 أسابيع + الألوان
    ├── context/
    │   └── AuthContext.js          ← كل عمليات Firebase (دخول، تسجيل، حفظ بيانات)
    ├── navigation/
    │   └── AppNavigator.js         ← تنقل التطبيق (Tabs + Stack)
    └── screens/
        ├── LoginScreen.js          ← تسجيل الدخول
        ├── RegisterScreen.js       ← إنشاء حساب
        ├── HomeScreen.js           ← الرئيسية (ملخص + تمرين اليوم)
        ├── ProgramScreen.js        ← عرض البرنامج كامل (3 أسابيع)
        ├── WorkoutScreen.js        ← تنفيذ تمرين (عداد راحة + تسجيل أوزان)
        ├── ProgressScreen.js       ← رسوم بيانية + سجل + أرقام قياسية
        ├── GoalsScreen.js          ← الأهداف + BMI + احتياج غذائي
        └── SettingsScreen.js       ← إعدادات + خروج
```

---

## 1️⃣ تشغيل المشروع على الكمبيوتر

### المتطلبات
- Node.js (نسخة 18 أو أحدث) من https://nodejs.org
- محرر أكواد (VS Code يفضل)

### الخطوات

```bash
# 1. افتح Terminal/CMD داخل فولدر المشروع GymTracker

# 2. ثبّت الباكدجات
npm install

# 3. شغّل المشروع
npx expo start
```

هيظهرلك QR Code في الـ Terminal، وكمان متصفح هيفتح صفحة فيها نفس الـ QR Code.

---

## 2️⃣ تجربة التطبيق على موبايلك (الأسهل والأسرع)

### الخطوات:
1. نزّل تطبيق **Expo Go** من Google Play (أندرويد) أو App Store (آيفون).
2. افتح تطبيق Expo Go.
3. اعمل سكان للـ QR Code اللي ظهر في الـ Terminal أو المتصفح.
4. التطبيق هيفتح على موبايلك فورًا، وأي تعديل في الكود هيتحدث تلقائيًا (Hot Reload).

> ملاحظة: لازم موبايلك والكمبيوتر يكونوا على نفس شبكة الواي فاي.

---

## 3️⃣ ربط Firebase خطوة بخطوة

### الخطوة 1: إنشاء المشروع
1. روح على https://console.firebase.google.com
2. دوس **Add Project** / إضافة مشروع.
3. اكتب اسم المشروع (مثلاً: GymTrackerPro) ودوس Continue.
4. ممكن تعطل Google Analytics (مش ضروري) ودوس Create Project.

### الخطوة 2: تفعيل Authentication
1. من القائمة الجانبية: **Build > Authentication**.
2. دوس **Get Started**.
3. من تبويب **Sign-in method**، فعّل **Email/Password**.

### الخطوة 3: تفعيل Firestore Database
1. من القائمة الجانبية: **Build > Firestore Database**.
2. دوس **Create Database**.
3. اختار **Start in test mode** (للتجربة فقط؛ هنعدل القواعد لاحقًا).
4. اختار أقرب Region ليك (مثلاً eur3 أو me-west1) ودوس Enable.

### الخطوة 4: الحصول على بيانات الربط (Config)
1. من القائمة الجانبية دوس على ⚙️ **Project Settings**.
2. انزل لتحت لقسم **Your apps**.
3. دوس على أيقونة **</>** (Web app).
4. اكتب اسم (مثلاً: GymTracker Web) ودوس **Register app**.
5. هيظهرلك كود فيه `firebaseConfig` — انسخه.

### الخطوة 5: لصق البيانات في المشروع
افتح ملف `firebase.js` في جذر المشروع، واستبدل القيم دي ببياناتك:

```javascript
const firebaseConfig = {
  apiKey: "هنا الـ API Key بتاعك",
  authDomain: "your-project.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abcdef123456",
};
```

### الخطوة 6: قواعد أمان Firestore (مهم!)
في Firestore Database، روح لتبويب **Rules** والصق القواعد دي عشان كل مستخدم يشوف بياناته بس:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;

      match /{document=**} {
        allow read, write: if request.auth != null && request.auth.uid == userId;
      }
    }
  }
}
```

دوس **Publish** بعد ما تحط القواعد دي.

---

## 4️⃣ عمل Build لتطبيق Android (APK)

### الطريقة الموصى بها: EAS Build (سحابي، مجاني)

```bash
# 1. ثبّت أداة EAS
npm install -g eas-cli

# 2. اعمل تسجيل دخول لحساب Expo (هيطلب منك تعمل حساب لو معندكش)
eas login

# 3. اربط المشروع بـ EAS (مرة واحدة بس)
eas build:configure

# 4. ابدأ بناء APK (هيتم على سيرفرات Expo، يستغرق 10-20 دقيقة)
eas build --platform android --profile preview
```

بعد ما يخلص، هيديك رابط تنزل منه ملف **APK** مباشرة على موبايلك أو تبعته لأي حد يجربه.

> الـ profile اسمه `preview` بيطلع APK عادي تقدر تنصبه على أي موبايل أندرويد على طول بدون متجر.

---

## 5️⃣ رفع التطبيق على Google Play

### الخطوات:
1. اعمل حساب مطور على Google Play Console: https://play.google.com/console
   (فيه رسوم تسجيل لمرة واحدة 25 دولار تقريبًا).

2. عدّل ملف `eas.json` لو عايز ترفع نسخة AAB (مطلوبة للنشر الرسمي):
```bash
eas build --platform android --profile production
```
دا هيطلعلك ملف `.aab` بدل `.apk` (مطلوب من جوجل بلاي).

3. في Google Play Console:
   - دوس **Create app**.
   - املا بيانات التطبيق (الاسم، الوصف، التصنيف).
   - ارفع صور Screenshots (لازم على الأقل 2 صورة).
   - ارفع أيقونة التطبيق (512×512).
   - ارفع ملف الـ `.aab` اللي طلع من EAS Build في قسم **Production > Releases**.

4. املا **Privacy Policy** (سياسة الخصوصية) — تقدر تستخدم مولد مجاني زي:
   https://app-privacy-policy-generator.firebaseapp.com

5. دوس **Submit for review** — جوجل بياخد من يوم لـ 7 أيام للمراجعة.

---

## 6️⃣ تشغيل سريع بدون Build (للتجربة فقط)

لو عايز تجرب على أكتر من جهاز بسرعة بدون APK:

```bash
npx expo start --tunnel
```

ده بيعمل رابط عام تقدر تشاركه مع أي حد في أي مكان (مش لازم يكونوا على نفس الواي فاي).

---

## 🎨 تخصيص ألوان وأسماء التطبيق

- **الألوان**: عدّل كائن `COLORS` في `src/data/workoutData.js`.
- **اسم التطبيق وأيقونته**: عدّل `app.json` (الحقول `name`, `icon`, `splash`).
- **التمارين والبرنامج**: عدّل `EXERCISES` و `PROGRAM_CYCLE` في نفس الملف `workoutData.js`.

---

## 🗂️ هيكلة قاعدة البيانات (Firestore)

```
users/{userId}
  ├── name, email, weight, height, targetWeight
  ├── currentCycle: { startDate, totalDaysCompleted }
  ├── settings: { darkMode, notifications }
  │
  ├── workoutLogs/{logId}
  │     { date, week, day, type, focus, exercises[], totalVolume, totalSets, duration }
  │
  ├── weightLogs/{logId}
  │     { date, weight, notes }
  │
  └── exercisePRs/{exerciseId}
        { maxWeight, maxReps, date }
```

---

## ❓ مشاكل شائعة

**"Network request failed" عند تسجيل الدخول**
→ تأكد إنك حطيت بيانات Firebase صح في `firebase.js`، وإن Authentication مفعّل.

**التطبيق بيقفل فجأة على الموبايل**
→ شغّل `npx expo start` وشوف الأخطاء (logs) في الـ Terminal، غالبًا حقل ناقص في `firebase.js`.

**الرسم البياني مش بيظهر**
→ لازم يكون عندك على الأقل سجلين وزن (Weight Logs) عشان الخط يظهر.

---

بالتوفيق في رحلة التضخيم! 💪🔥
