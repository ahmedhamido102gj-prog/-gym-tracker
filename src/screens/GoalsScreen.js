// src/screens/GoalsScreen.js
import React, { useState } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet,
  SafeAreaView, TextInput, Alert, Modal,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import { COLORS } from '../data/workoutData';

export default function GoalsScreen() {
  const { profile, updateUserProfile } = useAuth();
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({
    weight:       String(profile?.weight || ''),
    height:       String(profile?.height || ''),
    targetWeight: String(profile?.targetWeight || ''),
    name:         profile?.name || '',
  });
  const [saving, setSaving] = useState(false);

  const update = (key, val) => setForm(p => ({ ...p, [key]: val }));

  const bmi = () => {
    const w = parseFloat(form.weight || profile?.weight);
    const h = parseFloat(form.height || profile?.height);
    if (!w || !h) return null;
    return (w / Math.pow(h / 100, 2)).toFixed(1);
  };

  const bmiLabel = (b) => {
    if (!b) return { text: '—', color: COLORS.textSub };
    if (b < 18.5) return { text: 'نقص وزن', color: COLORS.blue };
    if (b < 25)   return { text: 'طبيعي ✅', color: COLORS.green };
    if (b < 30)   return { text: 'زيادة بسيطة', color: COLORS.orange };
    return              { text: 'زيادة وزن', color: COLORS.red };
  };

  const idealWeight = () => {
    const h = parseFloat(profile?.height);
    if (!h) return null;
    const min = (18.5 * Math.pow(h / 100, 2)).toFixed(0);
    const max = (24.9 * Math.pow(h / 100, 2)).toFixed(0);
    return `${min} - ${max} كجم`;
  };

  const proteinNeeded = () => {
    const w = parseFloat(profile?.weight);
    if (!w) return null;
    return `${(w * 1.6).toFixed(0)} - ${(w * 2.2).toFixed(0)} جرام`;
  };

  const caloriesNeeded = () => {
    const w = parseFloat(profile?.weight);
    const h = parseFloat(profile?.height);
    if (!w || !h) return null;
    // Harris-Benedict تقريبي للذكور + نشاط متوسط
    const bmr = 10 * w + 6.25 * h - 5 * 25 + 5;
    const maintenance = Math.round(bmr * 1.55);
    return `${maintenance} - ${maintenance + 400} سعر`;
  };

  const weightToGoal = () => {
    const w = parseFloat(profile?.weight);
    const t = parseFloat(profile?.targetWeight);
    if (!w || !t) return null;
    return (t - w).toFixed(1);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await updateUserProfile({
        name:         form.name,
        weight:       parseFloat(form.weight) || profile?.weight,
        height:       parseFloat(form.height) || profile?.height,
        targetWeight: parseFloat(form.targetWeight) || profile?.targetWeight,
      });
      setEditing(false);
      Alert.alert('✅ تم', 'تم حفظ البيانات');
    } catch (e) {
      Alert.alert('خطأ', 'مش قدر يحفظ');
    } finally {
      setSaving(false);
    }
  };

  const b    = parseFloat(bmi());
  const bmi_ = bmiLabel(b);
  const diff = weightToGoal();

  const weeks12Progress = () => {
    const total = profile?.currentCycle?.totalDaysCompleted || 0;
    const target = 48; // 4 days × 12 weeks
    return Math.min(100, Math.round((total / target) * 100));
  };

  return (
    <SafeAreaView style={S.safe}>
      <ScrollView style={S.scroll} showsVerticalScrollIndicator={false}>

        {/* Header */}
        <LinearGradient colors={['#1a1035', '#0b0b14']} style={S.header}>
          <View style={S.headerRow}>
            <TouchableOpacity
              style={S.editBtn}
              onPress={() => setEditing(true)}
            >
              <Ionicons name="pencil" size={16} color="#fff" />
              <Text style={S.editBtnText}>تعديل</Text>
            </TouchableOpacity>
            <Text style={S.headerTitle}>الأهداف 🎯</Text>
          </View>

          <Text style={S.userName}>{profile?.name || '—'}</Text>

          {/* BMI Card */}
          <View style={S.bmiCard}>
            <View style={S.bmiLeft}>
              <Text style={[S.bmiVal, { color: bmi_.color }]}>{b || '—'}</Text>
              <Text style={S.bmiSub}>BMI</Text>
            </View>
            <View style={S.bmiRight}>
              <Text style={[S.bmiLabel, { color: bmi_.color }]}>{bmi_.text}</Text>
              <Text style={S.bmiIdeal}>المدى المثالي: {idealWeight() || '—'}</Text>
            </View>
          </View>
        </LinearGradient>

        {/* Stats Cards */}
        <View style={S.statsGrid}>
          {[
            { label: 'الوزن الحالي', value: `${profile?.weight || '—'} كجم`, icon: '⚖️', color: COLORS.primary },
            { label: 'الطول', value: `${profile?.height || '—'} سم`, icon: '📏', color: COLORS.blue },
            { label: 'الهدف', value: `${profile?.targetWeight || '—'} كجم`, icon: '🎯', color: COLORS.green },
            { label: 'المتبقي', value: diff ? `${parseFloat(diff) > 0 ? '+' : ''}${diff} كجم` : '—', icon: '📊', color: parseFloat(diff) > 0 ? COLORS.orange : COLORS.green },
          ].map((s, i) => (
            <View key={i} style={S.statCard}>
              <Text style={S.statIcon}>{s.icon}</Text>
              <Text style={[S.statVal, { color: s.color }]}>{s.value}</Text>
              <Text style={S.statLabel}>{s.label}</Text>
            </View>
          ))}
        </View>

        {/* Progress to Goal */}
        {profile?.weight && profile?.targetWeight && (
          <View style={S.section}>
            <Text style={S.sectionTitle}>التقدم نحو الهدف</Text>
            <View style={S.goalCard}>
              <View style={S.goalRow}>
                <Text style={S.goalStart}>{profile.weight} كجم</Text>
                <View style={{ flex: 1 }}>
                  <View style={S.goalBarBg}>
                    <View style={[S.goalBarFill, {
                      width: `${Math.min(100, Math.max(0,
                        ((profile.weight - 50) / (profile.targetWeight - 50)) * 100
                      ))}%`
                    }]} />
                  </View>
                </View>
                <Text style={S.goalEnd}>{profile.targetWeight} كجم</Text>
              </View>
              <Text style={S.goalMsg}>
                {parseFloat(diff) > 0
                  ? `باقي ${diff} كجم للوصول للهدف 💪`
                  : parseFloat(diff) < 0
                  ? `وصلت الهدف وزدت! راجع هدفك 🎉`
                  : `وصلت الهدف بالظبط 🎉`}
              </Text>
            </View>
          </View>
        )}

        {/* Program Progress */}
        <View style={S.section}>
          <Text style={S.sectionTitle}>التزامك بالبرنامج (12 أسبوع)</Text>
          <View style={S.programCard}>
            <View style={S.programRow}>
              <Text style={S.programPct}>{weeks12Progress()}%</Text>
              <View style={{ flex: 1 }}>
                <View style={S.programBarBg}>
                  <LinearGradient
                    colors={[COLORS.primary, COLORS.primaryLight]}
                    style={[S.programBarFill, { width: `${weeks12Progress()}%` }]}
                    start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
                  />
                </View>
              </View>
            </View>
            <Text style={S.programMeta}>
              {profile?.currentCycle?.totalDaysCompleted || 0} يوم مكتمل من 48 يوم
            </Text>
          </View>
        </View>

        {/* Nutrition Needs */}
        <View style={S.section}>
          <Text style={S.sectionTitle}>احتياجاتك اليومية 🍽️</Text>
          <View style={S.nutriCard}>
            {[
              { label: 'البروتين المطلوب', value: proteinNeeded() || '—', icon: '🥩', color: COLORS.red },
              { label: 'السعرات للتضخيم', value: caloriesNeeded() || '—', icon: '🔥', color: COLORS.orange },
              { label: 'الماء المطلوب', value: profile?.weight ? `${(parseFloat(profile.weight) * 0.033).toFixed(1)} لتر` : '—', icon: '💧', color: COLORS.blue },
            ].map((item, i) => (
              <View key={i} style={S.nutriRow}>
                <View>
                  <Text style={[S.nutriVal, { color: item.color }]}>{item.value}</Text>
                  <Text style={S.nutriLabel}>{item.label}</Text>
                </View>
                <Text style={S.nutriIcon}>{item.icon}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Tips */}
        <View style={[S.section, { marginBottom: 100 }]}>
          <Text style={S.sectionTitle}>💡 نصائح للتضخيم</Text>
          {[
            ['🍚', 'الكارب مهم', 'الأرز والمكرونة والبطاطس ضرورية للطاقة والتضخيم'],
            ['😴', 'النوم مش اختياري', '7-9 ساعات نوم يوميًا ضروري عشان العضل يكبر'],
            ['📈', 'Progressive Overload', 'زود الوزن أو العدات كل أسبوع عشان تحفز نمو العضل'],
            ['⏳', 'الاتساق هو المفتاح', 'الـ 12 أسبوع كاملة بدون تقطيع هيعمل فرق كبير'],
          ].map(([icon, title, text], i) => (
            <View key={i} style={S.tipCard}>
              <Text style={S.tipIcon}>{icon}</Text>
              <View style={{ flex: 1 }}>
                <Text style={S.tipTitle}>{title}</Text>
                <Text style={S.tipText}>{text}</Text>
              </View>
            </View>
          ))}
        </View>

      </ScrollView>

      {/* Edit Modal */}
      <Modal visible={editing} transparent animationType="slide">
        <View style={S.modalBg}>
          <View style={S.modalCard}>
            <Text style={S.modalTitle}>تعديل البيانات ✏️</Text>

            {[
              { key: 'name', label: 'الاسم', keyboard: 'default', icon: 'person-outline' },
              { key: 'weight', label: 'الوزن الحالي (كجم)', keyboard: 'numeric', icon: 'barbell-outline' },
              { key: 'height', label: 'الطول (سم)', keyboard: 'numeric', icon: 'resize-outline' },
              { key: 'targetWeight', label: 'الوزن المستهدف (كجم)', keyboard: 'numeric', icon: 'trending-up-outline' },
            ].map(({ key, label, keyboard, icon }) => (
              <View key={key} style={S.modalInputWrap}>
                <Ionicons name={icon} size={16} color={COLORS.textMuted} style={{ marginLeft: 8 }} />
                <TextInput
                  style={S.modalInput}
                  placeholder={label}
                  placeholderTextColor={COLORS.textMuted}
                  value={form[key]}
                  onChangeText={v => update(key, v)}
                  keyboardType={keyboard}
                  textAlign="right"
                />
              </View>
            ))}

            <View style={S.modalBtns}>
              <TouchableOpacity style={S.modalCancel} onPress={() => setEditing(false)}>
                <Text style={S.modalCancelText}>إلغاء</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[S.modalSave, saving && { opacity: 0.7 }]}
                onPress={handleSave}
                disabled={saving}
              >
                <Text style={S.modalSaveText}>{saving ? 'جاري...' : 'حفظ ✅'}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const S = StyleSheet.create({
  safe:           { flex: 1, backgroundColor: COLORS.bg },
  scroll:         { flex: 1 },
  header:         { padding: 20, paddingTop: 16, paddingBottom: 24 },
  headerRow:      { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  headerTitle:    { fontSize: 26, fontWeight: '900', color: '#fff' },
  editBtn:        { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: COLORS.primary, borderRadius: 20, paddingHorizontal: 16, paddingVertical: 8 },
  editBtnText:    { color: '#fff', fontSize: 13, fontWeight: '700' },
  userName:       { fontSize: 20, fontWeight: '800', color: '#fff', textAlign: 'right', marginBottom: 16 },
  bmiCard:        { backgroundColor: 'rgba(255,255,255,0.08)', borderRadius: 18, padding: 16, flexDirection: 'row', alignItems: 'center', gap: 20 },
  bmiLeft:        { alignItems: 'center', minWidth: 70 },
  bmiVal:         { fontSize: 40, fontWeight: '900' },
  bmiSub:         { fontSize: 12, color: COLORS.textSub },
  bmiRight:       { flex: 1 },
  bmiLabel:       { fontSize: 18, fontWeight: '800' },
  bmiIdeal:       { fontSize: 12, color: COLORS.textSub, marginTop: 4 },
  statsGrid:      { flexDirection: 'row', flexWrap: 'wrap', gap: 10, padding: 16 },
  statCard:       { width: '47%', backgroundColor: COLORS.bgCard, borderRadius: 18, padding: 16, alignItems: 'center', borderWidth: 1, borderColor: COLORS.border },
  statIcon:       { fontSize: 28, marginBottom: 8 },
  statVal:        { fontSize: 20, fontWeight: '900' },
  statLabel:      { fontSize: 11, color: COLORS.textSub, marginTop: 4 },
  section:        { paddingHorizontal: 16, marginBottom: 4 },
  sectionTitle:   { fontSize: 16, fontWeight: '800', color: '#fff', textAlign: 'right', marginBottom: 12 },
  goalCard:       { backgroundColor: COLORS.bgCard, borderRadius: 18, padding: 16, borderWidth: 1, borderColor: COLORS.border },
  goalRow:        { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 10 },
  goalStart:      { fontSize: 13, fontWeight: '700', color: COLORS.primaryLight, minWidth: 60, textAlign: 'center' },
  goalEnd:        { fontSize: 13, fontWeight: '700', color: COLORS.green, minWidth: 60, textAlign: 'center' },
  goalBarBg:      { height: 10, backgroundColor: '#1e1e35', borderRadius: 99, overflow: 'hidden' },
  goalBarFill:    { height: '100%', backgroundColor: COLORS.primary, borderRadius: 99 },
  goalMsg:        { textAlign: 'center', color: COLORS.textSub, fontSize: 13 },
  programCard:    { backgroundColor: COLORS.bgCard, borderRadius: 18, padding: 16, borderWidth: 1, borderColor: COLORS.border, marginBottom: 16 },
  programRow:     { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 8 },
  programPct:     { fontSize: 22, fontWeight: '900', color: COLORS.primaryLight, minWidth: 50 },
  programBarBg:   { height: 10, backgroundColor: '#1e1e35', borderRadius: 99, overflow: 'hidden', flex: 1 },
  programBarFill: { height: '100%', borderRadius: 99 },
  programMeta:    { fontSize: 12, color: COLORS.textSub, textAlign: 'right' },
  nutriCard:      { backgroundColor: COLORS.bgCard, borderRadius: 18, padding: 16, borderWidth: 1, borderColor: COLORS.border, marginBottom: 16 },
  nutriRow:       { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: COLORS.border },
  nutriVal:       { fontSize: 18, fontWeight: '900', textAlign: 'right' },
  nutriLabel:     { fontSize: 12, color: COLORS.textSub, textAlign: 'right', marginTop: 2 },
  nutriIcon:      { fontSize: 30 },
  tipCard:        { backgroundColor: COLORS.bgCard, borderRadius: 16, padding: 14, marginBottom: 8, flexDirection: 'row', gap: 12, alignItems: 'center', borderWidth: 1, borderColor: COLORS.border },
  tipIcon:        { fontSize: 28 },
  tipTitle:       { fontSize: 14, fontWeight: '800', color: '#fff', textAlign: 'right' },
  tipText:        { fontSize: 12, color: COLORS.textSub, textAlign: 'right', marginTop: 3, lineHeight: 18 },
  modalBg:        { flex: 1, backgroundColor: 'rgba(0,0,0,0.8)', justifyContent: 'flex-end' },
  modalCard:      { backgroundColor: COLORS.bgCard, borderTopLeftRadius: 28, borderTopRightRadius: 28, padding: 28 },
  modalTitle:     { fontSize: 22, fontWeight: '900', color: '#fff', textAlign: 'center', marginBottom: 20 },
  modalInputWrap: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#1a1a2e', borderRadius: 14, height: 50, paddingHorizontal: 14, marginBottom: 12, borderWidth: 1, borderColor: COLORS.border },
  modalInput:     { flex: 1, color: '#fff', fontSize: 14 },
  modalBtns:      { flexDirection: 'row', gap: 12, marginTop: 8 },
  modalCancel:    { flex: 1, padding: 15, backgroundColor: '#1a1a2e', borderRadius: 14, alignItems: 'center' },
  modalCancelText:{ color: COLORS.textSub, fontSize: 15, fontWeight: '700' },
  modalSave:      { flex: 1, padding: 15, backgroundColor: COLORS.primary, borderRadius: 14, alignItems: 'center' },
  modalSaveText:  { color: '#fff', fontSize: 15, fontWeight: '800' },
});
