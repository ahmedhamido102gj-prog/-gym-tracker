// src/context/AuthContext.js
import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateProfile,
} from 'firebase/auth';
import {
  doc, setDoc, getDoc, updateDoc, serverTimestamp,
} from 'firebase/firestore';
import { auth, db } from '../../firebase';

const AuthContext = createContext({});
export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }) {
  const [user, setUser]       = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  // مراقبة حالة الدخول
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);
      if (firebaseUser) {
        await loadProfile(firebaseUser.uid);
      } else {
        setProfile(null);
      }
      setLoading(false);
    });
    return unsub;
  }, []);

  // تحميل بيانات المستخدم من Firestore
  const loadProfile = async (uid) => {
    try {
      const snap = await getDoc(doc(db, 'users', uid));
      if (snap.exists()) {
        setProfile(snap.data());
      }
    } catch (e) {
      console.error('loadProfile error:', e);
    }
  };

  // تسجيل مستخدم جديد
  const register = async ({ name, email, password, weight, height, targetWeight }) => {
    const cred = await createUserWithEmailAndPassword(auth, email, password);
    await updateProfile(cred.user, { displayName: name });

    const profileData = {
      uid: cred.user.uid,
      name,
      email,
      weight: parseFloat(weight) || 0,
      height: parseFloat(height) || 0,
      targetWeight: parseFloat(targetWeight) || 0,
      goal: 'muscle_gain',
      createdAt: serverTimestamp(),
      currentCycle: {
        startDate: new Date().toISOString(),
        totalDaysCompleted: 0,
      },
      settings: {
        darkMode: true,
        notifications: true,
      },
    };

    await setDoc(doc(db, 'users', cred.user.uid), profileData);
    setProfile(profileData);
    return cred.user;
  };

  // تسجيل الدخول
  const login = async (email, password) => {
    const cred = await signInWithEmailAndPassword(auth, email, password);
    await loadProfile(cred.user.uid);
    return cred.user;
  };

  // تسجيل الخروج
  const logout = async () => {
    await signOut(auth);
    setProfile(null);
  };

  // تحديث بيانات الملف الشخصي
  const updateUserProfile = async (data) => {
    if (!user) return;
    await updateDoc(doc(db, 'users', user.uid), data);
    setProfile(prev => ({ ...prev, ...data }));
  };

  // تسجيل وزن جديد
  const logWeight = async (weight, notes = '') => {
    if (!user) return;
    const logRef = doc(db, 'users', user.uid, 'weightLogs', Date.now().toString());
    await setDoc(logRef, {
      weight: parseFloat(weight),
      notes,
      date: new Date().toISOString(),
      timestamp: serverTimestamp(),
    });
    // تحديث الوزن الحالي في الملف الشخصي
    await updateUserProfile({ weight: parseFloat(weight) });
  };

  // حفظ سجل تمرين مكتمل
  const saveWorkoutLog = async (workoutData) => {
    if (!user) return;
    const logId = Date.now().toString();
    const logRef = doc(db, 'users', user.uid, 'workoutLogs', logId);
    await setDoc(logRef, {
      ...workoutData,
      date: new Date().toISOString(),
      timestamp: serverTimestamp(),
    });
    // زيادة عدد الأيام المكتملة
    const newTotal = (profile?.currentCycle?.totalDaysCompleted || 0) + 1;
    await updateUserProfile({
      'currentCycle.totalDaysCompleted': newTotal,
    });
    return logId;
  };

  // حفظ أقصى وزن لتمرين معين (PR)
  const saveExercisePR = async (exerciseId, weight, reps) => {
    if (!user) return;
    const prRef = doc(db, 'users', user.uid, 'exercisePRs', exerciseId);
    const snap = await getDoc(prRef);
    const current = snap.exists() ? snap.data().maxWeight : 0;
    if (parseFloat(weight) > current) {
      await setDoc(prRef, {
        maxWeight: parseFloat(weight),
        maxReps: reps,
        date: new Date().toISOString(),
      });
    }
  };

  return (
    <AuthContext.Provider value={{
      user, profile, loading,
      register, login, logout,
      updateUserProfile, logWeight,
      saveWorkoutLog, saveExercisePR,
      refreshProfile: () => user && loadProfile(user.uid),
    }}>
      {children}
    </AuthContext.Provider>
  );
}
