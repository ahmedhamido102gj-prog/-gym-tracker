// firebase.js
// ضع هنا بيانات مشروعك من Firebase Console
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// 1. روح على https://console.firebase.google.com
// 2. أنشئ مشروع جديد
// 3. روح Project Settings > Your apps > Web app
// 4. انسخ الـ config هنا:
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT_ID.appspot.com",
  messagingSenderId: "YOUR_SENDER_ID",
  appId: "YOUR_APP_ID",
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
export default app;

// ============================================
// هيكلة قاعدة البيانات في Firestore:
//
// users/{userId}
//   ├── profile: { name, email, weight, height, targetWeight, birthDate, goal }
//   ├── settings: { darkMode, notifications, language }
//   ├── currentCycle: { startDate, currentWeek, currentDay, totalDaysCompleted }
//   └── collections:
//       ├── workoutLogs/{logId}
//       │     { date, week, day, type, exercises[], totalVolume, duration, completed }
//       ├── weightLogs/{logId}
//       │     { date, weight, notes }
//       ├── exercisePRs/{exerciseName}
//       │     { maxWeight, maxReps, date }
//       └── goals/{goalId}
//             { type, target, current, startDate, deadline }
// ============================================
