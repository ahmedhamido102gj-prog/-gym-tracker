// src/screens/ProgramScreen.js
import React, { useState } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity,
  StyleSheet, SafeAreaView, Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import { COLORS, PROGRAM_CYCLE, EXERCISES, getTodayWorkout } from '../data/workoutData';

const W = Dimensions.get('window').width;

export default function ProgramScreen({ navigation }) {
  const { profile } = useAuth();
  const [selectedWeek, setSelectedWeek] = useState(0);
  const todayWorkout = getTodayWorkout(profile?.currentCycle?.startDate);

  const typeColors = {
    chest_back: COLORS.chestBack,
    arms:       COLORS.arms,
    legs_abs:   COLORS.legsAbs,
  };

  const typeLabels = {
    chest_back: 'صدر + ظهر',
    arms:       'دراع + ساعد',
    legs_abs:   'رجل + بطن',
  };

  return (
    <SafeAreaView style={S.safe}>
      <ScrollView style={S.scroll} showsVerticalScrollIndicator={false}>

        {/* Header */}
        <LinearGradient colors={['#1a1035', '#0b0b14']} style={S.header}>
          <Text style={S.headerTitle}>البرنامج 📅</Text>
          <Text style={S.headerSub}>دورة 3 أسابيع • 4 أيام أسبوعيًا</Text>

          {/* Legend */}
          <View style={S.legend}>
            {Object.entries(typeColors).map(([type, color]) => (
              <View key={type} style={S.legendItem}>
                <View style={[S.legendDot, { backgroundColor: color }]} />
                <Text style={S.legendText}>{typeLabels[type]}</Text>
              </View>
            ))}
          </View>
        </LinearGradient>

        {/* Week Tabs */}
        <View style={S.tabs}>
          {PROGRAM_CYCLE.map((w, i) => (
            <TouchableOpacity
              key={i}
              style={[S.tab, selectedWeek === i && S.tabActive]}
              onPress={() => setSelectedWeek(i)}
            >
              <Text style={[S.tabText, selectedWeek === i && S.tabTextActive]}>
                أسبوع {w.week}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Days Grid */}
        <View style={S.daysGrid}>
          {PROGRAM_CYCLE[selectedWeek].days.map((day, di) => {
            const isToday = todayWorkout?.week === PROGRAM_CYCLE[selectedWeek].week && todayWorkout?.day === day.day;
            const exercises = EXERCISES[day.type];
            const color = typeColors[day.type];

            return (
              <TouchableOpacity
                key={di}
                activeOpacity={0.85}
                style={S.dayCardWrap}
                onPress={() => navigation.navigate('Workout', {
                  workout: {
                    ...day,
                    week: PROGRAM_CYCLE[selectedWeek].week,
                    exercises,
                    color,
                  }
                })}
              >
                <LinearGradient
                  colors={[color + 'aa', color + '33', COLORS.bgCard]}
                  style={[S.dayCard, isToday && S.dayCardToday]}
                  start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
                >
                  {isToday && (
                    <View style={S.todayBadge}>
                      <Text style={S.todayBadgeText}>اليوم ✨</Text>
                    </View>
                  )}

                  <Text style={S.dayNum}>يوم {day.day}</Text>
                  <Text style={S.dayEmoji}>{day.emoji}</Text>
                  <Text style={S.dayFocus}>{day.focus}</Text>

                  <View style={S.exPreview}>
                    {exercises.slice(0, 3).map((ex, i) => (
                      <Text key={i} style={S.exChip} numberOfLines={1}>• {ex.nameAr}</Text>
                    ))}
                    {exercises.length > 3 && (
                      <Text style={[S.exChip, { color: COLORS.textMuted }]}>+{exercises.length - 3} أكتر</Text>
                    )}
                  </View>

                  <View style={S.dayFooter}>
                    <Text style={S.dayExCount}>{exercises.length} تمارين</Text>
                    <Ionicons name="play-circle" size={22} color="#fff" />
                  </View>
                </LinearGradient>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* All Exercises List */}
        <View style={S.section}>
          <Text style={S.sectionTitle}>جميع التمارين 📋</Text>

          {Object.entries(EXERCISES).map(([type, exList]) => (
            <View key={type} style={S.typeGroup}>
              <View style={[S.typeHeader, { borderLeftColor: typeColors[type] }]}>
                <Text style={[S.typeTitle, { color: typeColors[type] }]}>{typeLabels[type]}</Text>
              </View>
              {exList.map((ex, i) => (
                <View key={i} style={S.exRow}>
                  <View style={S.exInfo}>
                    <Text style={S.exName}>{ex.nameAr}</Text>
                    <Text style={S.exEn}>{ex.name}</Text>
                  </View>
                  <View style={S.exStats}>
                    <Text style={S.exStat}>{ex.sets} × {ex.reps}</Text>
                    <View style={[S.muscleBadge, { backgroundColor: typeColors[type] + '33' }]}>
                      <Text style={[S.muscleText, { color: typeColors[type] }]}>{ex.muscle}</Text>
                    </View>
                  </View>
                </View>
              ))}
            </View>
          ))}
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const S = StyleSheet.create({
  safe:           { flex: 1, backgroundColor: COLORS.bg },
  scroll:         { flex: 1 },
  header:         { padding: 20, paddingTop: 16 },
  headerTitle:    { fontSize: 28, fontWeight: '900', color: '#fff', textAlign: 'right' },
  headerSub:      { fontSize: 13, color: COLORS.textSub, textAlign: 'right', marginTop: 4, marginBottom: 16 },
  legend:         { flexDirection: 'row', gap: 16, justifyContent: 'flex-end' },
  legendItem:     { flexDirection: 'row', alignItems: 'center', gap: 6 },
  legendDot:      { width: 10, height: 10, borderRadius: 5 },
  legendText:     { fontSize: 11, color: COLORS.textSub },
  tabs:           { flexDirection: 'row', padding: 16, gap: 8 },
  tab:            { flex: 1, paddingVertical: 10, borderRadius: 12, backgroundColor: COLORS.bgCard, alignItems: 'center', borderWidth: 1, borderColor: COLORS.border },
  tabActive:      { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  tabText:        { fontSize: 13, color: COLORS.textSub, fontWeight: '600' },
  tabTextActive:  { color: '#fff', fontWeight: '800' },
  daysGrid:       { flexDirection: 'row', flexWrap: 'wrap', padding: 12, gap: 10 },
  dayCardWrap:    { width: (W - 34) / 2 },
  dayCard:        { borderRadius: 20, padding: 16, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)', minHeight: 200 },
  dayCardToday:   { borderColor: 'rgba(255,255,255,0.4)', borderWidth: 2 },
  todayBadge:     { backgroundColor: 'rgba(255,255,255,0.25)', borderRadius: 20, paddingHorizontal: 10, paddingVertical: 3, alignSelf: 'flex-end', marginBottom: 8 },
  todayBadgeText: { fontSize: 11, color: '#fff', fontWeight: '800' },
  dayNum:         { fontSize: 11, color: 'rgba(255,255,255,0.6)', textAlign: 'right', marginBottom: 6 },
  dayEmoji:       { fontSize: 32, textAlign: 'right', marginBottom: 6 },
  dayFocus:       { fontSize: 16, fontWeight: '900', color: '#fff', textAlign: 'right', marginBottom: 10 },
  exPreview:      { flex: 1 },
  exChip:         { fontSize: 10, color: 'rgba(255,255,255,0.7)', textAlign: 'right', marginBottom: 3 },
  dayFooter:      { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 12 },
  dayExCount:     { fontSize: 12, color: 'rgba(255,255,255,0.6)' },
  section:        { padding: 16 },
  sectionTitle:   { fontSize: 18, fontWeight: '800', color: '#fff', textAlign: 'right', marginBottom: 14 },
  typeGroup:      { marginBottom: 20 },
  typeHeader:     { borderLeftWidth: 3, paddingLeft: 10, marginBottom: 10 },
  typeTitle:      { fontSize: 15, fontWeight: '800' },
  exRow:          { backgroundColor: COLORS.bgCard, borderRadius: 14, padding: 12, marginBottom: 8, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderWidth: 1, borderColor: COLORS.border },
  exInfo:         { flex: 1 },
  exName:         { fontSize: 14, fontWeight: '700', color: '#fff', textAlign: 'right' },
  exEn:           { fontSize: 10, color: COLORS.textMuted, textAlign: 'right', marginTop: 2 },
  exStats:        { alignItems: 'flex-end', gap: 4 },
  exStat:         { fontSize: 13, fontWeight: '700', color: COLORS.primaryLight },
  muscleBadge:    { borderRadius: 10, paddingHorizontal: 8, paddingVertical: 3 },
  muscleText:     { fontSize: 10, fontWeight: '700' },
});
