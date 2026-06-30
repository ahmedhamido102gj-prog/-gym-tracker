// src/screens/ProgressScreen.js
import React, { useState, useEffect } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet,
  SafeAreaView, TextInput, Modal, Alert, Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { LineChart, BarChart } from 'react-native-chart-kit';
import { collection, query, orderBy, limit, getDocs } from 'firebase/firestore';
import { db } from '../../firebase';
import { useAuth } from '../context/AuthContext';
import { COLORS, EXERCISES } from '../data/workoutData';

const W = Dimensions.get('window').width;

// ============================================
// مكون رسم بياني بسيط بدون مكتبة (احتياطي)
// ============================================
function MiniChart({ data, color, height = 60 }) {
  if (!data || data.length === 0) return null;
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;

  return (
    <View style={{ height, flexDirection: 'row', alignItems: 'flex-end', gap: 4 }}>
      {data.map((v, i) => {
        const barH = Math.max(4, ((v - min) / range) * (height - 20));
        const isLast = i === data.length - 1;
        return (
          <View key={i} style={{ flex: 1, alignItems: 'center' }}>
            <Text style={{ fontSize: 8, color: isLast ? color : COLORS.textMuted, marginBottom: 2 }}>
              {isLast ? v : ''}
            </Text>
            <View style={{ width: '80%', height: barH, backgroundColor: isLast ? color : color + '44', borderRadius: 4 }} />
          </View>
        );
      })}
    </View>
  );
}

export default function ProgressScreen() {
  const { user, profile, logWeight } = useAuth();
  const [weightLogs, setWeightLogs]   = useState([]);
  const [workoutLogs, setWorkoutLogs] = useState([]);
  const [prs, setPRs]                 = useState({});
  const [showAddWeight, setShowAddWeight] = useState(false);
  const [newWeight, setNewWeight]     = useState('');
  const [activeTab, setActiveTab]     = useState('weight'); // weight | volume | history | prs

  useEffect(() => {
    if (!user) return;
    loadAll();
  }, [user]);

  const loadAll = async () => {
    try {
      // سجل الوزن
      const wSnap = await getDocs(
        query(collection(db, 'users', user.uid, 'weightLogs'), orderBy('date', 'asc'), limit(30))
      );
      const wLogs = [];
      wSnap.forEach(d => wLogs.push({ id: d.id, ...d.data() }));
      setWeightLogs(wLogs);

      // سجل التمارين
      const woSnap = await getDocs(
        query(collection(db, 'users', user.uid, 'workoutLogs'), orderBy('date', 'desc'), limit(20))
      );
      const woLogs = [];
      woSnap.forEach(d => woLogs.push({ id: d.id, ...d.data() }));
      setWorkoutLogs(woLogs);

      // الأرقام القياسية
      const prSnap = await getDocs(collection(db, 'users', user.uid, 'exercisePRs'));
      const prMap = {};
      prSnap.forEach(d => { prMap[d.id] = d.data(); });
      setPRs(prMap);
    } catch (e) {
      console.error('loadAll error:', e);
    }
  };

  const handleAddWeight = async () => {
    if (!newWeight || isNaN(parseFloat(newWeight))) {
      Alert.alert('خطأ', 'ادخل وزن صحيح');
      return;
    }
    await logWeight(parseFloat(newWeight));
    setNewWeight('');
    setShowAddWeight(false);
    loadAll();
  };

  const weightChartData = weightLogs.slice(-10).map(l => parseFloat(l.weight));
  const weightLabels = weightLogs.slice(-10).map(l => {
    const d = new Date(l.date);
    return `${d.getDate()}/${d.getMonth() + 1}`;
  });
  const volumeData = workoutLogs.slice(0, 7).reverse().map(l => l.totalVolume || 0);

  const chartConfig = {
    backgroundColor: COLORS.bgCard,
    backgroundGradientFrom: COLORS.bgCard,
    backgroundGradientTo: COLORS.bgCard,
    decimalPlaces: 0,
    color: (opacity = 1) => `rgba(124, 107, 255, ${opacity})`,
    labelColor: () => COLORS.textSub,
    propsForDots: { r: '5', strokeWidth: '2', stroke: COLORS.primaryLight },
    propsForBackgroundLines: { stroke: COLORS.border },
  };

  return (
    <SafeAreaView style={S.safe}>
      <ScrollView style={S.scroll} showsVerticalScrollIndicator={false}>

        {/* Header */}
        <LinearGradient colors={['#1a1035', '#0b0b14']} style={S.header}>
          <View style={S.headerRow}>
            <TouchableOpacity
              style={S.addWeightBtn}
              onPress={() => setShowAddWeight(true)}
            >
              <Ionicons name="add" size={18} color="#fff" />
              <Text style={S.addWeightText}>سجل وزن</Text>
            </TouchableOpacity>
            <Text style={S.headerTitle}>التقدم 📈</Text>
          </View>

          {/* Summary stats */}
          {weightLogs.length >= 2 && (() => {
            const first = weightLogs[0].weight;
            const last  = weightLogs[weightLogs.length - 1].weight;
            const diff  = (last - first).toFixed(1);
            return (
              <View style={S.summaryRow}>
                <View style={S.summaryBox}>
                  <Text style={S.summaryVal}>{last} كجم</Text>
                  <Text style={S.summaryLabel}>الوزن الحالي</Text>
                </View>
                <View style={S.summaryBox}>
                  <Text style={[S.summaryVal, { color: parseFloat(diff) > 0 ? COLORS.green : COLORS.red }]}>
                    {parseFloat(diff) > 0 ? '+' : ''}{diff} كجم
                  </Text>
                  <Text style={S.summaryLabel}>التغيير الكلي</Text>
                </View>
                <View style={S.summaryBox}>
                  <Text style={S.summaryVal}>{workoutLogs.length}</Text>
                  <Text style={S.summaryLabel}>تمرين كلي</Text>
                </View>
              </View>
            );
          })()}
        </LinearGradient>

        {/* Tabs */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={S.tabsWrap}>
          {[
            ['weight', '⚖️ الوزن'],
            ['volume', '📦 الحجم'],
            ['history', '📋 السجل'],
            ['prs', '🏆 الأرقام القياسية'],
          ].map(([id, label]) => (
            <TouchableOpacity
              key={id}
              style={[S.tab, activeTab === id && S.tabActive]}
              onPress={() => setActiveTab(id)}
            >
              <Text style={[S.tabText, activeTab === id && S.tabTextActive]}>{label}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Weight Tab */}
        {activeTab === 'weight' && (
          <View style={S.tabContent}>
            {weightChartData.length >= 2 ? (
              <>
                <LineChart
                  data={{ labels: weightLabels, datasets: [{ data: weightChartData }] }}
                  width={W - 32}
                  height={200}
                  chartConfig={chartConfig}
                  bezier
                  style={S.chart}
                  withInnerLines={false}
                />
                <View style={S.weightList}>
                  {weightLogs.slice().reverse().slice(0, 8).map((log, i) => (
                    <View key={log.id} style={S.weightItem}>
                      <Text style={S.weightDate}>
                        {new Date(log.date).toLocaleDateString('ar-EG', { weekday: 'short', month: 'short', day: 'numeric' })}
                      </Text>
                      <Text style={S.weightVal}>{log.weight} كجم</Text>
                    </View>
                  ))}
                </View>
              </>
            ) : (
              <View style={S.empty}>
                <Text style={S.emptyEmoji}>⚖️</Text>
                <Text style={S.emptyText}>سجل وزنك بانتظام عشان تشوف تطورك</Text>
                <TouchableOpacity style={S.emptyBtn} onPress={() => setShowAddWeight(true)}>
                  <Text style={S.emptyBtnText}>سجل وزنك دلوقتي</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        )}

        {/* Volume Tab */}
        {activeTab === 'volume' && (
          <View style={S.tabContent}>
            {volumeData.some(v => v > 0) ? (
              <>
                <Text style={S.chartTitle}>حجم التمارين (آخر 7 جلسات)</Text>
                <BarChart
                  data={{
                    labels: volumeData.map((_, i) => `${i + 1}`),
                    datasets: [{ data: volumeData }],
                  }}
                  width={W - 32}
                  height={200}
                  chartConfig={{ ...chartConfig, color: (o = 1) => `rgba(62, 201, 122, ${o})` }}
                  style={S.chart}
                  withInnerLines={false}
                  showValuesOnTopOfBars
                />
              </>
            ) : (
              <View style={S.empty}>
                <Text style={S.emptyEmoji}>📦</Text>
                <Text style={S.emptyText}>ابدأ تسجل تمارينك عشان يظهر الحجم</Text>
              </View>
            )}
          </View>
        )}

        {/* History Tab */}
        {activeTab === 'history' && (
          <View style={S.tabContent}>
            {workoutLogs.length === 0 ? (
              <View style={S.empty}>
                <Text style={S.emptyEmoji}>📋</Text>
                <Text style={S.emptyText}>ابدأ تمرينك الأول</Text>
              </View>
            ) : workoutLogs.map(log => (
              <View key={log.id} style={S.logCard}>
                <View style={S.logLeft}>
                  <Text style={{ fontSize: 26 }}>{log.emoji || '🏋️'}</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={S.logFocus}>{log.focus}</Text>
                  <Text style={S.logDate}>
                    {new Date(log.date).toLocaleDateString('ar-EG', { weekday: 'long', month: 'long', day: 'numeric' })}
                  </Text>
                  <Text style={S.logMeta}>
                    {log.totalSets || 0} سيت •{' '}
                    {Math.floor((log.duration || 0) / 60)} دقيقة •{' '}
                    {(log.totalVolume || 0).toLocaleString()} كجم حجم
                  </Text>
                </View>
              </View>
            ))}
          </View>
        )}

        {/* PRs Tab */}
        {activeTab === 'prs' && (
          <View style={S.tabContent}>
            <Text style={S.prNote}>🏆 أقصى وزن حققته في كل تمرين</Text>
            {Object.entries(EXERCISES).map(([type, exList]) => (
              <View key={type} style={{ marginBottom: 16 }}>
                {exList.map(ex => {
                  const pr = prs[ex.id];
                  return (
                    <View key={ex.id} style={S.prCard}>
                      <Text style={S.prEmoji}>{ex.emoji}</Text>
                      <View style={{ flex: 1 }}>
                        <Text style={S.prName}>{ex.nameAr}</Text>
                        <Text style={S.prEnName}>{ex.name}</Text>
                      </View>
                      <View style={S.prRight}>
                        <Text style={S.prWeight}>{pr ? `${pr.maxWeight} كجم` : '—'}</Text>
                        {pr?.maxReps && <Text style={S.prReps}>× {pr.maxReps}</Text>}
                      </View>
                    </View>
                  );
                })}
              </View>
            ))}
          </View>
        )}

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Add Weight Modal */}
      <Modal visible={showAddWeight} transparent animationType="slide">
        <View style={S.modalBg}>
          <View style={S.modalCard}>
            <Text style={S.modalTitle}>⚖️ سجل وزنك</Text>
            <TextInput
              style={S.modalInput}
              placeholder="الوزن بالكيلو"
              placeholderTextColor={COLORS.textMuted}
              value={newWeight}
              onChangeText={setNewWeight}
              keyboardType="numeric"
              textAlign="center"
              autoFocus
            />
            <View style={S.modalBtns}>
              <TouchableOpacity style={S.modalCancel} onPress={() => setShowAddWeight(false)}>
                <Text style={S.modalCancelText}>إلغاء</Text>
              </TouchableOpacity>
              <TouchableOpacity style={S.modalSave} onPress={handleAddWeight}>
                <Text style={S.modalSaveText}>حفظ ✅</Text>
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
  header:         { padding: 20, paddingTop: 16 },
  headerRow:      { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  headerTitle:    { fontSize: 26, fontWeight: '900', color: '#fff' },
  addWeightBtn:   { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: COLORS.primary, borderRadius: 20, paddingHorizontal: 16, paddingVertical: 8 },
  addWeightText:  { color: '#fff', fontSize: 13, fontWeight: '700' },
  summaryRow:     { flexDirection: 'row', gap: 10 },
  summaryBox:     { flex: 1, backgroundColor: 'rgba(255,255,255,0.07)', borderRadius: 14, padding: 12, alignItems: 'center' },
  summaryVal:     { fontSize: 18, fontWeight: '900', color: '#fff' },
  summaryLabel:   { fontSize: 10, color: COLORS.textSub, marginTop: 3 },
  tabsWrap:       { paddingVertical: 12, paddingHorizontal: 16 },
  tab:            { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, marginLeft: 8, backgroundColor: COLORS.bgCard, borderWidth: 1, borderColor: COLORS.border },
  tabActive:      { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  tabText:        { fontSize: 13, color: COLORS.textSub, fontWeight: '600' },
  tabTextActive:  { color: '#fff', fontWeight: '800' },
  tabContent:     { padding: 16 },
  chart:          { borderRadius: 16, marginBottom: 16 },
  chartTitle:     { fontSize: 14, color: COLORS.textSub, textAlign: 'right', marginBottom: 10 },
  weightList:     {},
  weightItem:     { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: COLORS.border },
  weightDate:     { fontSize: 13, color: COLORS.textSub },
  weightVal:      { fontSize: 15, fontWeight: '800', color: '#fff' },
  empty:          { alignItems: 'center', paddingVertical: 60, gap: 12 },
  emptyEmoji:     { fontSize: 56 },
  emptyText:      { fontSize: 14, color: COLORS.textSub, textAlign: 'center' },
  emptyBtn:       { backgroundColor: COLORS.primary, borderRadius: 20, paddingHorizontal: 24, paddingVertical: 10, marginTop: 8 },
  emptyBtnText:   { color: '#fff', fontSize: 14, fontWeight: '700' },
  logCard:        { backgroundColor: COLORS.bgCard, borderRadius: 16, padding: 14, marginBottom: 8, flexDirection: 'row', gap: 12, borderWidth: 1, borderColor: COLORS.border },
  logLeft:        { width: 48, height: 48, borderRadius: 24, backgroundColor: '#1a1a2e', alignItems: 'center', justifyContent: 'center' },
  logFocus:       { fontSize: 14, fontWeight: '800', color: '#fff', textAlign: 'right' },
  logDate:        { fontSize: 11, color: COLORS.textSub, textAlign: 'right', marginTop: 3 },
  logMeta:        { fontSize: 11, color: COLORS.textMuted, textAlign: 'right', marginTop: 4 },
  prNote:         { fontSize: 13, color: COLORS.textSub, textAlign: 'right', marginBottom: 14 },
  prCard:         { backgroundColor: COLORS.bgCard, borderRadius: 14, padding: 14, marginBottom: 8, flexDirection: 'row', alignItems: 'center', gap: 12, borderWidth: 1, borderColor: COLORS.border },
  prEmoji:        { fontSize: 26, width: 36 },
  prName:         { fontSize: 14, fontWeight: '700', color: '#fff', textAlign: 'right' },
  prEnName:       { fontSize: 10, color: COLORS.textMuted, textAlign: 'right' },
  prRight:        { alignItems: 'flex-end' },
  prWeight:       { fontSize: 18, fontWeight: '900', color: COLORS.orange },
  prReps:         { fontSize: 11, color: COLORS.textSub },
  modalBg:        { flex: 1, backgroundColor: 'rgba(0,0,0,0.8)', justifyContent: 'flex-end' },
  modalCard:      { backgroundColor: COLORS.bgCard, borderTopLeftRadius: 28, borderTopRightRadius: 28, padding: 30 },
  modalTitle:     { fontSize: 22, fontWeight: '900', color: '#fff', textAlign: 'center', marginBottom: 20 },
  modalInput:     { backgroundColor: '#1a1a2e', borderRadius: 16, height: 60, color: '#fff', fontSize: 28, fontWeight: '900', textAlign: 'center', marginBottom: 20, borderWidth: 1, borderColor: COLORS.border },
  modalBtns:      { flexDirection: 'row', gap: 12 },
  modalCancel:    { flex: 1, padding: 16, backgroundColor: '#1a1a2e', borderRadius: 14, alignItems: 'center' },
  modalCancelText:{ color: COLORS.textSub, fontSize: 15, fontWeight: '700' },
  modalSave:      { flex: 1, padding: 16, backgroundColor: COLORS.green, borderRadius: 14, alignItems: 'center' },
  modalSaveText:  { color: '#fff', fontSize: 15, fontWeight: '800' },
});
