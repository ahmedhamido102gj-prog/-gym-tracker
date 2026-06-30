// firebase.js
// ضع هنا بيانات مشروعك من Firebase Console
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyAI52V_AnyOnV7LKCmrzZ6yYggUdMUOLVA",
  authDomain: "gymtracker-bde04.firebaseapp.com",
  projectId: "gymtracker-bde04",
  storageBucket: "gymtracker-bde04.firebasestorage.app",
  messagingSenderId: "795243762973",
  appId: "1:795243762973:web:46201315b791cc7013bdf4",
  measurementId: "G-3G43T00S32",
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
