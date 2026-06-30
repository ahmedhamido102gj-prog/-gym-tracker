// src/screens/HomeScreen.js
import React, { useEffect, useState, useCallback } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet,
  SafeAreaView, RefreshControl, Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { collection, query, orderBy, limit, getDocs, where } from 'firebase/firestore';
import { db } from '../../firebase';
import { useAuth } from '../context/AuthContext';
import { COLORS, getTodayWorkout, EXERCISES } from '../data/workoutData';

const W = Dimensions.get('window').width;

export default function HomeScreen({ navigation }) {
  const { user, profile, refreshProfile } = useAuth();
  const [todayWorkout, setTodayWorkout]   = useState(null);
  const [weekCount, setWeekCount]         = useState(0);
  const [recentLogs, setRecentLogs]       = useState([]);
  const [refreshing, setRefreshing]       = useState(false);

  const greeting = () => {
    const h = new Date().getHours();
    if (h < 12) return 'صباح الخير';
    if (h < 18) return 'مساء الخير';
    return 'مساء النور';
  };

  const bmi = () => {
    if (!profile?.weight || !profile?.height) return '—';
    const h = profile.height / 100;
    return (profile.weight / (h * h)).toFixed(1);
  };

  const loadData = useCallback(async () => {
    if (!user || !profile) return;

    // تمرين اليوم
    const tw = getTodayWorkout(profile?.currentCycle?.startDate);
    setTodayWorkout(tw);

    // عدد تمارين هذا الأسبوع
    try {
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      const logsRef = collection(db, 'users', user.uid, 'workoutLogs');
      const q = query(logsRef, where('date', '>=', weekAgo.toISOString()), orderBy('date', 'desc'));
      const snap = await getDocs(q);
      setWeekCount(snap.size);

      const recent = [];
      snap.forEach(d => recent.push({ id: d.id, ...d.data() }));
      setRecentLogs(recent.slice(0, 3));
    } catch (e) {
      console.log('loadData error:', e);
    }
  }, [user, profile]);

  useEffect(() => { loadData(); }, [loadData]);

  const onRefresh = async () => {
    setRefreshing(true);
    await refreshProfile();
    await loadData();
    setRefreshing(false);
  };

  const totalDays   = profile?.currentCycle?.totalDaysCompleted || 0;
  const commitment  = totalDays > 0 ? Math.min(100, Math.round((weekCount / 4) * 100)) : 0;
  const targetDiff  = profile?.targetWeight && profile?.weight
    ? (profile.targetWeight - profile.weight).toFixed(1) : null;

  return (
    <SafeAreaView style={S.safe}>
      <ScrollView
        style={S.scroll}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.primary} />}
      >
        {/* Header */}
        <LinearGradient colors={['#1a1035', '#0b0b14']} style={S.header}>
          <View style={S.headerRow}>
            <View>
              <Text style={S.greeting}>{greeting()} 👋</Text>
              <Text style={S.name}>{profile?.name || user?.displayName || 'بطل'}</Text>
            </View>
            <View style={S.avatar}>
              <Text style={{ fontSize: 28 }}>💪</Text>
            </View>
          </View>

          {/* Stats Row */}
          <View style={S.statsRow}>
            {[
              { label: 'الوزن', value: `${profile?.weight || '—'} كجم`, icon: '⚖️' },
              { label: 'هذا الأسبوع', value: `${weekCount}/4`, icon: '📅' },
              { label: 'الالتزام', value: `${commitment}%`, icon: '🎯' },
              { label: 'BMI', value: bmi(), icon: '📊' },
            ].map((s, i) => (
              <View key={i} style={S.statBox}>
                <Text style={S.statIcon}>{s.icon}</Text>
                <Text style={S.statVal}>{s.value}</Text>
                <Text style={S.statLabel}>{s.label}</Text>
              </View>
            ))}
          </View>
        </LinearGradient>

        {/* Today's Workout */}
        {todayWorkout && (
          <View style={S.section}>
            <Text style={S.sectionTitle}>تمرين اليوم 🏋️</Text>
            <TouchableOpacity
              activeOpacity={0.85}
              onPress={() => navigation.navigate('Workout', { workout: todayWorkout })}
            >
              <LinearGradient
                colors={[todayWorkout.color + 'cc', todayWorkout.color + '55', '#13131f']}
                style={S.todayCard}
                start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
              >
                <View style={S.todayTop}>
                  <Text style={S.todayEmoji}>{todayWorkout.emoji}</Text>
                  <View style={S.todayBadge}>
                    <Text style={S.todayBadgeText}>أسبوع {todayWorkout.week}</Text>
                  </View>
                </View>
                <Text style={S.todayFocus}>{todayWorkout.focus}</Text>
                <Text style={S.todaySub}>{todayWorkout.exercises.length} تمارين</Text>
                <View style={S.todayExList}>
                  {todayWorkout.exercises.slice(0, 3).map((ex, i) => (
                    <View key={i} style={S.todayExChip}>
                      <Text style={S.todayExText}>{ex.nameAr}</Text>
                    </View>
                  ))}
                  {todayWorkout.exercises.length > 3 && (
                    <View style={S.todayExChip}>
                      <Text style={S.todayExText}>+{todayWorkout.exercises.length - 3}</Text>
                    </View>
                  )}
                </View>
                <View style={S.startBtn}>
                  <Text style={S.startBtnText}>ابدأ التمرين 🚀</Text>
                  <Ionicons name="arrow-forward" size={18} color="#fff" />
                </View>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        )}

        {/* Progress Toward Goal */}
        {targetDiff !== null && (
          <View style={S.section}>
            <Text style={S.sectionTitle}>تقدمك نحو الهدف 🎯</Text>
            <View style={S.goalCard}>
              <View style={S.goalRow}>
                <Text style={S.goalCurrent}>{profile.weight} كجم</Text>
                <Text style={S.goalArrow}>←</Text>
                <Text style={S.goalTarget}>{profile.targetWeight} كجم</Text>
              </View>
              <View style={S.goalBarBg}>
                <View style={[S.goalBarFill, {
                  width: `${Math.min(100, Math.max(0, ((profile.weight - 50) / (profile.targetWeight - 50)) * 100))}%`
                }]} />
              </View>
              <Text style={S.goalDiff}>
                {parseFloat(targetDiff) > 0 ? `باقي ${targetDiff} كجم للهدف` : `وصلت الهدف! 🎉`}
              </Text>
            </View>
          </View>
        )}

        {/* Recent Activity */}
        {recentLogs.length > 0 && (
          <View style={S.section}>
            <Text style={S.sectionTitle}>آخر التمارين 📋</Text>
            {recentLogs.map(log => (
              <View key={log.id} style={S.logCard}>
                <View style={S.logLeft}>
                  <Text style={S.logEmoji}>{log.emoji || '🏋️'}</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={S.logFocus}>{log.focus || '—'}</Text>
                  <Text style={S.logDate}>{new Date(log.date).toLocaleDateString('ar-EG', { weekday: 'long', month: 'short', day: 'numeric' })}</Text>
                </View>
                <View style={S.logRight}>
                  <Text style={S.logVol}>{(log.totalVolume || 0).toLocaleString()}</Text>
                  <Text style={S.logVolLabel}>كجم حجم</Text>
                </View>
              </View>
            ))}
          </View>
        )}

        {/* Tips */}
        <View style={[S.section, { marginBottom: 100 }]}>
          <View style={S.tipCard}>
            <Text style={S.tipTitle}>💡 نصيحة اليوم</Text>
            <Text style={S.tipText}>
              {totalDays % 3 === 0
                ? 'النوم 7-9 ساعات ضروري للتضخيم — العضل بتكبر وانت بتنام!'
                : totalDays % 3 === 1
                ? 'البروتين مهم — 1.6 إلى 2.2 جرام لكل كيلو وزن جسمك يوميًا'
                : 'Progressive Overload — كل أسبوع زود عدة أو وزن، ده سر التطور'}
            </Text>
          </View>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

const S = StyleSheet.create({
  safe:         { flex: 1, backgroundColor: COLORS.bg },
  scroll:       { flex: 1 },
  header:       { padding: 20, paddingTop: 16, paddingBottom: 24 },
  headerRow:    { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  greeting:     { fontSize: 13, color: COLORS.textSub },
  name:         { fontSize: 26, fontWeight: '900', color: '#fff', marginTop: 2 },
  avatar:       { width: 54, height: 54, borderRadius: 27, backgroundColor: COLORS.bgCard, alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: COLORS.primary },
  statsRow:     { flexDirection: 'row', gap: 8 },
  statBox:      { flex: 1, backgroundColor: 'rgba(255,255,255,0.07)', borderRadius: 14, padding: 10, alignItems: 'center' },
  statIcon:     { fontSize: 18, marginBottom: 4 },
  statVal:      { fontSize: 14, fontWeight: '800', color: '#fff' },
  statLabel:    { fontSize: 9, color: COLORS.textSub, marginTop: 2 },
  section:      { padding: 16 },
  sectionTitle: { fontSize: 16, fontWeight: '800', color: '#fff', textAlign: 'right', marginBottom: 12 },
  todayCard:    { borderRadius: 22, padding: 20, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' },
  todayTop:     { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  todayEmoji:   { fontSize: 40 },
  todayBadge:   { backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 20, paddingHorizontal: 12, paddingVertical: 5 },
  todayBadgeText:{ fontSize: 12, color: '#fff', fontWeight: '700' },
  todayFocus:   { fontSize: 26, fontWeight: '900', color: '#fff', textAlign: 'right' },
  todaySub:     { fontSize: 13, color: 'rgba(255,255,255,0.7)', textAlign: 'right', marginTop: 4, marginBottom: 12 },
  todayExList:  { flexDirection: 'row', flexWrap: 'wrap', gap: 6, justifyContent: 'flex-end', marginBottom: 16 },
  todayExChip:  { backgroundColor: 'rgba(255,255,255,0.15)', borderRadius: 20, paddingHorizontal: 10, paddingVertical: 4 },
  todayExText:  { color: '#fff', fontSize: 11, fontWeight: '600' },
  startBtn:     { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(255,255,255,0.15)', borderRadius: 14, paddingVertical: 12, gap: 8 },
  startBtnText: { color: '#fff', fontSize: 16, fontWeight: '800' },
  goalCard:     { backgroundColor: COLORS.bgCard, borderRadius: 18, padding: 18, borderWidth: 1, borderColor: COLORS.border },
  goalRow:      { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 16, marginBottom: 14 },
  goalCurrent:  { fontSize: 22, fontWeight: '900', color: COLORS.primaryLight },
  goalArrow:    { fontSize: 18, color: COLORS.textMuted },
  goalTarget:   { fontSize: 22, fontWeight: '900', color: COLORS.green },
  goalBarBg:    { height: 8, backgroundColor: '#1e1e35', borderRadius: 99, overflow: 'hidden', marginBottom: 10 },
  goalBarFill:  { height: '100%', backgroundColor: COLORS.green, borderRadius: 99 },
  goalDiff:     { textAlign: 'center', color: COLORS.textSub, fontSize: 13 },
  logCard:      { backgroundColor: COLORS.bgCard, borderRadius: 16, padding: 14, marginBottom: 8, flexDirection: 'row', alignItems: 'center', gap: 12, borderWidth: 1, borderColor: COLORS.border },
  logLeft:      { width: 44, height: 44, borderRadius: 22, backgroundColor: '#1a1a2e', alignItems: 'center', justifyContent: 'center' },
  logEmoji:     { fontSize: 22 },
  logFocus:     { fontSize: 14, fontWeight: '700', color: '#fff', textAlign: 'right' },
  logDate:      { fontSize: 11, color: COLORS.textSub, textAlign: 'right', marginTop: 2 },
  logRight:     { alignItems: 'center' },
  logVol:       { fontSize: 16, fontWeight: '900', color: COLORS.primaryLight },
  logVolLabel:  { fontSize: 9, color: COLORS.textMuted },
  tipCard:      { backgroundColor: '#0d180f', borderRadius: 18, padding: 18, borderWidth: 1, borderColor: COLORS.green + '33' },
  tipTitle:     { fontSize: 14, fontWeight: '800', color: COLORS.green, textAlign: 'right', marginBottom: 8 },
  tipText:      { fontSize: 13, color: COLORS.textSub, textAlign: 'right', lineHeight: 22 },
});
