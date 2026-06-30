// src/screens/WorkoutScreen.js
import React, { useState, useEffect, useRef } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet,
  SafeAreaView, TextInput, Alert, Animated, Modal, Vibration,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import { COLORS } from '../data/workoutData';

// ============================================
// مكون عداد الراحة بين المجموعات
// ============================================
function RestTimer({ seconds, onDone }) {
  const [remaining, setRemaining] = useState(seconds);
  const scaleAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (remaining <= 0) { onDone(); return; }
    const t = setTimeout(() => setRemaining(r => r - 1), 1000);
    if (remaining <= 3) {
      Animated.sequence([
        Animated.timing(scaleAnim, { toValue: 1.15, duration: 200, useNativeDriver: true }),
        Animated.timing(scaleAnim, { toValue: 1,    duration: 200, useNativeDriver: true }),
      ]).start();
    }
    return () => clearTimeout(t);
  }, [remaining]);

  const pct = (remaining / seconds) * 100;
  const color = remaining > seconds * 0.5 ? COLORS.green : remaining > seconds * 0.25 ? COLORS.orange : COLORS.red;

  return (
    <View style={RT.wrap}>
      <Text style={RT.title}>⏱ راحة</Text>
      <Animated.Text style={[RT.time, { color, transform: [{ scale: scaleAnim }] }]}>
        {Math.floor(remaining / 60)}:{String(remaining % 60).padStart(2, '0')}
      </Animated.Text>
      <View style={RT.barBg}>
        <View style={[RT.barFill, { width: `${pct}%`, backgroundColor: color }]} />
      </View>
      <TouchableOpacity style={RT.skipBtn} onPress={onDone}>
        <Text style={RT.skipText}>تخطى ⏩</Text>
      </TouchableOpacity>
    </View>
  );
}

const RT = StyleSheet.create({
  wrap:     { alignItems: 'center', padding: 30, backgroundColor: COLORS.bgCard, borderRadius: 24, margin: 16 },
  title:    { fontSize: 16, color: COLORS.textSub, marginBottom: 10 },
  time:     { fontSize: 64, fontWeight: '900' },
  barBg:    { height: 8, width: '100%', backgroundColor: '#1e1e35', borderRadius: 99, overflow: 'hidden', marginVertical: 16 },
  barFill:  { height: '100%', borderRadius: 99 },
  skipBtn:  { backgroundColor: '#1e1e35', borderRadius: 20, paddingHorizontal: 24, paddingVertical: 10 },
  skipText: { color: COLORS.textSub, fontSize: 15, fontWeight: '700' },
});

// ============================================
// مكون تمرين واحد
// ============================================
function ExerciseBlock({ exercise, color, onSetDone }) {
  const [sets, setSets] = useState(
    Array.from({ length: exercise.sets }, (_, i) => ({
      setNum: i + 1, weight: '', reps: '', done: false,
    }))
  );
  const [expanded, setExpanded] = useState(true);

  const updateSet = (idx, field, val) => {
    setSets(prev => {
      const next = [...prev];
      next[idx] = { ...next[idx], [field]: val };
      return next;
    });
  };

  const markDone = (idx) => {
    const set = sets[idx];
    setSets(prev => {
      const next = [...prev];
      next[idx] = { ...next[idx], done: true };
      return next;
    });
    onSetDone(exercise.id, { ...set, done: true, setNum: idx + 1 });
    Vibration.vibrate(40);
  };

  const addSet = () => {
    const last = sets[sets.length - 1];
    setSets(prev => [...prev, { setNum: prev.length + 1, weight: last.weight, reps: '', done: false }]);
  };

  const doneCount = sets.filter(s => s.done).length;
  const allDone = doneCount === sets.length;

  return (
    <View style={[EX.card, allDone && { borderColor: COLORS.green + '66' }]}>
      <TouchableOpacity style={EX.header} onPress={() => setExpanded(!expanded)}>
        <View style={EX.headerLeft}>
          <Ionicons
            name={expanded ? 'chevron-up' : 'chevron-down'}
            size={18} color={COLORS.textMuted}
          />
          <Text style={EX.count}>{doneCount}/{sets.length}</Text>
        </View>
        <View style={EX.headerRight}>
          <Text style={EX.exName}>{exercise.nameAr}</Text>
          <Text style={EX.exEn}>{exercise.name}</Text>
        </View>
        {allDone && <Ionicons name="checkmark-circle" size={24} color={COLORS.green} style={EX.check} />}
      </TouchableOpacity>

      {expanded && (
        <View style={EX.body}>
          {/* Notes */}
          <View style={EX.noteBox}>
            <Text style={EX.noteText}>💡 {exercise.notes}</Text>
          </View>

          {/* Target */}
          <View style={EX.targetRow}>
            <Text style={EX.targetLabel}>الهدف: </Text>
            <Text style={EX.targetVal}>{exercise.sets} سيت × {exercise.reps} عدة</Text>
            <Text style={[EX.targetLabel, { marginRight: 12 }]}>راحة: </Text>
            <Text style={EX.targetVal}>{Math.floor(exercise.rest / 60)}:{String(exercise.rest % 60).padStart(2,'0')} دقيقة</Text>
          </View>

          {/* Set Headers */}
          <View style={EX.setHeader}>
            <Text style={EX.setHeaderTxt}>تم</Text>
            <Text style={EX.setHeaderTxt}>الوزن</Text>
            <Text style={EX.setHeaderTxt}>العدات</Text>
            <Text style={EX.setHeaderTxt}>سيت</Text>
          </View>

          {sets.map((set, i) => (
            <View key={i} style={[EX.setRow, set.done && EX.setRowDone]}>
              <TouchableOpacity
                style={[EX.doneBtn, set.done && { backgroundColor: COLORS.green }]}
                onPress={() => !set.done && markDone(i)}
                disabled={set.done}
              >
                <Ionicons name={set.done ? 'checkmark' : 'ellipse-outline'} size={18} color="#fff" />
              </TouchableOpacity>

              <TextInput
                style={[EX.setInput, set.done && EX.setInputDone]}
                placeholder="كجم"
                placeholderTextColor={COLORS.textMuted}
                value={set.weight}
                onChangeText={v => updateSet(i, 'weight', v)}
                keyboardType="numeric"
                textAlign="center"
                editable={!set.done}
              />

              <TextInput
                style={[EX.setInput, set.done && EX.setInputDone]}
                placeholder={exercise.reps}
                placeholderTextColor={COLORS.textMuted}
                value={set.reps}
                onChangeText={v => updateSet(i, 'reps', v)}
                keyboardType="numeric"
                textAlign="center"
                editable={!set.done}
              />

              <Text style={EX.setNum}>{set.setNum}</Text>
            </View>
          ))}

          <TouchableOpacity style={EX.addSet} onPress={addSet}>
            <Ionicons name="add-circle-outline" size={16} color={COLORS.textMuted} />
            <Text style={EX.addSetText}>سيت إضافي</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const EX = StyleSheet.create({
  card:         { backgroundColor: COLORS.bgCard, borderRadius: 18, marginHorizontal: 16, marginBottom: 10, borderWidth: 1, borderColor: COLORS.border },
  header:       { flexDirection: 'row', alignItems: 'center', padding: 14, gap: 8 },
  headerLeft:   { flexDirection: 'row', alignItems: 'center', gap: 6 },
  headerRight:  { flex: 1, alignItems: 'flex-end' },
  exName:       { fontSize: 15, fontWeight: '800', color: '#fff' },
  exEn:         { fontSize: 10, color: COLORS.textMuted },
  count:        { fontSize: 12, color: COLORS.textSub, fontWeight: '700' },
  check:        { marginLeft: 4 },
  body:         { paddingHorizontal: 14, paddingBottom: 14 },
  noteBox:      { backgroundColor: '#0f0f20', borderRadius: 10, padding: 10, marginBottom: 10, borderRightWidth: 3, borderRightColor: COLORS.primary },
  noteText:     { fontSize: 12, color: COLORS.textSub, textAlign: 'right', lineHeight: 20 },
  targetRow:    { flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-end', marginBottom: 10, flexWrap: 'wrap', gap: 4 },
  targetLabel:  { fontSize: 11, color: COLORS.textMuted },
  targetVal:    { fontSize: 12, fontWeight: '700', color: COLORS.primaryLight },
  setHeader:    { flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 4, marginBottom: 6 },
  setHeaderTxt: { fontSize: 10, color: COLORS.textMuted, flex: 1, textAlign: 'center' },
  setRow:       { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 },
  setRowDone:   { opacity: 0.65 },
  setNum:       { width: 30, textAlign: 'center', fontSize: 14, color: COLORS.textSub, fontWeight: '700' },
  setInput:     { flex: 1, height: 40, backgroundColor: '#1a1a2e', borderRadius: 10, color: '#fff', fontSize: 14, fontWeight: '700', borderWidth: 1, borderColor: COLORS.border, textAlign: 'center' },
  setInputDone: { backgroundColor: COLORS.green + '22', borderColor: COLORS.green + '44' },
  doneBtn:      { width: 40, height: 40, borderRadius: 10, backgroundColor: '#1a1a2e', alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: COLORS.border },
  addSet:       { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, marginTop: 4, paddingVertical: 8, borderRadius: 10, borderWidth: 1, borderColor: COLORS.border, borderStyle: 'dashed' },
  addSetText:   { fontSize: 12, color: COLORS.textMuted },
});

// ============================================
// الشاشة الرئيسية للتمرين
// ============================================
export default function WorkoutScreen({ navigation, route }) {
  const { workout } = route.params;
  const { saveWorkoutLog, saveExercisePR, user } = useAuth();

  const [showRest, setShowRest]       = useState(false);
  const [restSeconds, setRestSeconds] = useState(60);
  const [completedSets, setCompletedSets] = useState([]);
  const [startTime]                   = useState(Date.now());
  const [elapsed, setElapsed]         = useState(0);
  const [saving, setSaving]           = useState(false);

  // عداد وقت التمرين
  useEffect(() => {
    const t = setInterval(() => setElapsed(Math.floor((Date.now() - startTime) / 1000)), 1000);
    return () => clearInterval(t);
  }, [startTime]);

  const formatElapsed = () => {
    const m = Math.floor(elapsed / 60);
    const s = elapsed % 60;
    return `${m}:${String(s).padStart(2, '0')}`;
  };

  const onSetDone = (exerciseId, setData) => {
    setCompletedSets(prev => [...prev, { exerciseId, ...setData }]);
    // عرض عداد الراحة
    const ex = workout.exercises.find(e => e.id === exerciseId);
    if (ex) {
      setRestSeconds(ex.rest);
      setShowRest(true);
    }
  };

  const handleFinish = async () => {
    Alert.alert(
      'إنهاء التمرين؟',
      `عملت ${completedSets.length} سيت في ${formatElapsed()}`,
      [
        { text: 'إلغاء', style: 'cancel' },
        {
          text: 'احفظ وانهِ ✅',
          onPress: async () => {
            setSaving(true);
            try {
              // حساب الحجم الكلي
              const totalVolume = completedSets.reduce((t, s) => {
                return t + (parseFloat(s.weight) || 0) * (parseInt(s.reps) || 0);
              }, 0);

              // تجميع بيانات التمارين
              const exercisesData = workout.exercises.map(ex => {
                const exSets = completedSets.filter(s => s.exerciseId === ex.id);
                return {
                  id: ex.id,
                  name: ex.name,
                  nameAr: ex.nameAr,
                  sets: exSets,
                  volume: exSets.reduce((t, s) => t + (parseFloat(s.weight)||0)*(parseInt(s.reps)||0), 0),
                };
              });

              await saveWorkoutLog({
                week: workout.week,
                day: workout.day,
                type: workout.type,
                focus: workout.focus,
                emoji: workout.emoji,
                exercises: exercisesData,
                totalVolume,
                totalSets: completedSets.length,
                duration: elapsed,
                completed: true,
              });

              // حفظ PRs
              for (const ex of exercisesData) {
                const maxW = Math.max(...ex.sets.map(s => parseFloat(s.weight) || 0));
                if (maxW > 0) {
                  const maxR = ex.sets.find(s => parseFloat(s.weight) === maxW)?.reps || 0;
                  await saveExercisePR(ex.id, maxW, maxR);
                }
              }

              navigation.goBack();
            } catch (e) {
              Alert.alert('خطأ', 'مش قدر يحفظ، جرب تاني');
            } finally {
              setSaving(false);
            }
          }
        }
      ]
    );
  };

  return (
    <SafeAreaView style={[S.safe, { flex: 1 }]}>
      {/* Header */}
      <LinearGradient
        colors={[workout.color + 'cc', workout.color + '44', COLORS.bg]}
        style={S.header}
      >
        <View style={S.headerRow}>
          <TouchableOpacity onPress={() => Alert.alert('تأكيد', 'عايز تخرج؟ التمرين مش هيتحفظ', [
            { text: 'ابقى', style: 'cancel' },
            { text: 'خروج', onPress: () => navigation.goBack() }
          ])}>
            <Ionicons name="close" size={26} color="#fff" />
          </TouchableOpacity>
          <View style={S.timerBox}>
            <Ionicons name="time-outline" size={14} color="rgba(255,255,255,0.7)" />
            <Text style={S.timer}>{formatElapsed()}</Text>
          </View>
        </View>

        <View style={S.headerInfo}>
          <Text style={S.workoutEmoji}>{workout.emoji}</Text>
          <View>
            <Text style={S.workoutFocus}>{workout.focus}</Text>
            <Text style={S.workoutSub}>أسبوع {workout.week} • يوم {workout.day}</Text>
          </View>
        </View>

        {/* Progress */}
        <View style={S.progressBar}>
          <View style={[S.progressFill, {
            width: `${workout.exercises.length > 0
              ? (completedSets.length / (workout.exercises.reduce((s, e) => s + e.sets, 0))) * 100
              : 0}%`,
            backgroundColor: workout.color,
          }]} />
        </View>
        <Text style={S.progressText}>{completedSets.length} سيت مكتمل</Text>
      </LinearGradient>

      {/* Rest Timer Modal */}
      <Modal visible={showRest} transparent animationType="fade">
        <View style={S.modalBg}>
          <RestTimer seconds={restSeconds} onDone={() => setShowRest(false)} />
        </View>
      </Modal>

      {/* Exercises */}
      <ScrollView style={S.scroll} showsVerticalScrollIndicator={false}>
        <View style={{ height: 12 }} />
        {workout.exercises.map((ex, i) => (
          <ExerciseBlock
            key={ex.id}
            exercise={ex}
            color={workout.color}
            onSetDone={onSetDone}
          />
        ))}
        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Finish Button */}
      <View style={S.footer}>
        <TouchableOpacity
          style={[S.finishBtn, saving && { opacity: 0.7 }]}
          onPress={handleFinish}
          disabled={saving}
          activeOpacity={0.8}
        >
          <LinearGradient
            colors={[COLORS.green, '#2aa862']}
            style={S.finishGrad}
            start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
          >
            <Ionicons name="checkmark-circle" size={22} color="#fff" />
            <Text style={S.finishText}>
              {saving ? 'جاري الحفظ...' : 'انهاء وحفظ التمرين ✅'}
            </Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const S = StyleSheet.create({
  safe:         { flex: 1, backgroundColor: COLORS.bg },
  header:       { padding: 20, paddingTop: 16 },
  headerRow:    { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 },
  timerBox:     { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: 'rgba(255,255,255,0.15)', borderRadius: 20, paddingHorizontal: 12, paddingVertical: 6 },
  timer:        { color: '#fff', fontSize: 15, fontWeight: '800', fontVariant: ['tabular-nums'] },
  headerInfo:   { flexDirection: 'row', alignItems: 'center', gap: 14, marginBottom: 16, justifyContent: 'flex-end' },
  workoutEmoji: { fontSize: 44 },
  workoutFocus: { fontSize: 24, fontWeight: '900', color: '#fff', textAlign: 'right' },
  workoutSub:   { fontSize: 12, color: 'rgba(255,255,255,0.7)', textAlign: 'right', marginTop: 3 },
  progressBar:  { height: 6, backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 99, overflow: 'hidden', marginBottom: 6 },
  progressFill: { height: '100%', borderRadius: 99, transition: 'width 0.3s' },
  progressText: { fontSize: 11, color: 'rgba(255,255,255,0.6)', textAlign: 'right' },
  scroll:       { flex: 1 },
  footer:       { padding: 14, backgroundColor: COLORS.bg, borderTopWidth: 1, borderTopColor: COLORS.border },
  finishBtn:    { borderRadius: 16, overflow: 'hidden' },
  finishGrad:   { paddingVertical: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10 },
  finishText:   { color: '#fff', fontSize: 17, fontWeight: '800' },
  modalBg:      { flex: 1, backgroundColor: 'rgba(0,0,0,0.85)', justifyContent: 'center' },
});
