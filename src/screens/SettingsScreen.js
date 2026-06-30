// src/screens/SettingsScreen.js
import React, { useState } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet,
  SafeAreaView, Switch, Alert, Modal, TextInput,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import { COLORS } from '../data/workoutData';

function Row({ icon, label, value, onPress, color = COLORS.textSub, danger = false, rightElement }) {
  return (
    <TouchableOpacity style={S.row} onPress={onPress} activeOpacity={onPress ? 0.6 : 1} disabled={!onPress}>
      {rightElement ? rightElement : (
        <Ionicons name="chevron-back" size={18} color={COLORS.textMuted} />
      )}
      <View style={S.rowCenter}>
        <Text style={[S.rowLabel, danger && { color: COLORS.red }]}>{label}</Text>
        {value ? <Text style={S.rowValue}>{value}</Text> : null}
      </View>
      <View style={[S.rowIcon, { backgroundColor: (danger ? COLORS.red : color) + '22' }]}>
        <Ionicons name={icon} size={18} color={danger ? COLORS.red : color} />
      </View>
    </TouchableOpacity>
  );
}

export default function SettingsScreen() {
  const { user, profile, logout, updateUserProfile } = useAuth();
  const [darkMode, setDarkMode]         = useState(profile?.settings?.darkMode !== false);
  const [notifications, setNotifications] = useState(profile?.settings?.notifications !== false);
  const [showPassModal, setShowPassModal] = useState(false);

  const toggleDarkMode = async (val) => {
    setDarkMode(val);
    await updateUserProfile({ 'settings.darkMode': val });
  };

  const toggleNotifications = async (val) => {
    setNotifications(val);
    await updateUserProfile({ 'settings.notifications': val });
  };

  const handleLogout = () => {
    Alert.alert('تسجيل الخروج', 'متأكد إنك عايز تخرج؟', [
      { text: 'إلغاء', style: 'cancel' },
      { text: 'خروج', style: 'destructive', onPress: logout },
    ]);
  };

  const handleResetCycle = () => {
    Alert.alert(
      'إعادة ضبط الدورة',
      'هيتم إعادة البرنامج من اليوم الأول. تقدمك المسجل (تمارين وأوزان) هيفضل محفوظ.',
      [
        { text: 'إلغاء', style: 'cancel' },
        {
          text: 'إعادة ضبط',
          style: 'destructive',
          onPress: async () => {
            await updateUserProfile({
              'currentCycle.startDate': new Date().toISOString(),
            });
            Alert.alert('✅ تم', 'تم إعادة ضبط الدورة من اليوم الأول');
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={S.safe}>
      <ScrollView style={S.scroll} showsVerticalScrollIndicator={false}>

        {/* Header / Profile */}
        <LinearGradient colors={['#1a1035', '#0b0b14']} style={S.header}>
          <Text style={S.headerTitle}>الإعدادات ⚙️</Text>
          <View style={S.profileCard}>
            <View style={S.avatar}>
              <Text style={{ fontSize: 32 }}>💪</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={S.profileName}>{profile?.name || 'مستخدم'}</Text>
              <Text style={S.profileEmail}>{user?.email}</Text>
            </View>
          </View>
        </LinearGradient>

        {/* Account Section */}
        <Text style={S.sectionLabel}>الحساب</Text>
        <View style={S.group}>
          <Row icon="person-outline" label="تعديل البيانات الشخصية" color={COLORS.primary}
               onPress={() => Alert.alert('💡', 'تقدر تعدل بياناتك من شاشة الأهداف')} />
          <View style={S.divider} />
          <Row icon="lock-closed-outline" label="تغيير كلمة المرور" color={COLORS.blue}
               onPress={() => setShowPassModal(true)} />
        </View>

        {/* Preferences */}
        <Text style={S.sectionLabel}>التفضيلات</Text>
        <View style={S.group}>
          <Row
            icon="moon-outline" label="الوضع الليلي" color={COLORS.primary}
            rightElement={<Switch value={darkMode} onValueChange={toggleDarkMode} trackColor={{ true: COLORS.primary, false: '#333' }} thumbColor="#fff" />}
          />
          <View style={S.divider} />
          <Row
            icon="notifications-outline" label="الإشعارات" color={COLORS.orange}
            rightElement={<Switch value={notifications} onValueChange={toggleNotifications} trackColor={{ true: COLORS.primary, false: '#333' }} thumbColor="#fff" />}
          />
        </View>

        {/* Program */}
        <Text style={S.sectionLabel}>البرنامج</Text>
        <View style={S.group}>
          <Row icon="refresh-outline" label="إعادة ضبط الدورة من البداية" color={COLORS.green}
               onPress={handleResetCycle} />
        </View>

        {/* About */}
        <Text style={S.sectionLabel}>عن التطبيق</Text>
        <View style={S.group}>
          <Row icon="information-circle-outline" label="الإصدار" value="1.0.0" color={COLORS.textSub} />
          <View style={S.divider} />
          <Row icon="document-text-outline" label="سياسة الخصوصية" color={COLORS.textSub}
               onPress={() => Alert.alert('سياسة الخصوصية', 'بياناتك محفوظة بأمان في Firebase ولا يتم مشاركتها مع أي طرف ثالث.')} />
        </View>

        {/* Logout */}
        <View style={S.group}>
          <Row icon="log-out-outline" label="تسجيل الخروج" danger onPress={handleLogout} />
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Change Password Info Modal */}
      <Modal visible={showPassModal} transparent animationType="fade">
        <View style={S.modalBg}>
          <View style={S.modalCard}>
            <Text style={S.modalTitle}>🔒 تغيير كلمة المرور</Text>
            <Text style={S.modalText}>
              لتغيير كلمة المرور، سجل خروج ثم استخدم خيار "نسيت كلمة المرور" في شاشة الدخول
              (يتطلب تفعيل Email/Password Reset من Firebase Console).
            </Text>
            <TouchableOpacity style={S.modalBtn} onPress={() => setShowPassModal(false)}>
              <Text style={S.modalBtnText}>فهمت</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const S = StyleSheet.create({
  safe:         { flex: 1, backgroundColor: COLORS.bg },
  scroll:       { flex: 1 },
  header:       { padding: 20, paddingTop: 16, paddingBottom: 24 },
  headerTitle:  { fontSize: 26, fontWeight: '900', color: '#fff', textAlign: 'right', marginBottom: 16 },
  profileCard:  { flexDirection: 'row', alignItems: 'center', gap: 14, backgroundColor: 'rgba(255,255,255,0.07)', borderRadius: 18, padding: 16 },
  avatar:       { width: 60, height: 60, borderRadius: 30, backgroundColor: COLORS.bgCard, alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: COLORS.primary },
  profileName:  { fontSize: 17, fontWeight: '800', color: '#fff', textAlign: 'right' },
  profileEmail: { fontSize: 12, color: COLORS.textSub, textAlign: 'right', marginTop: 3 },
  sectionLabel: { fontSize: 12, color: COLORS.textMuted, fontWeight: '700', textAlign: 'right', marginTop: 20, marginBottom: 8, paddingHorizontal: 20 },
  group:        { backgroundColor: COLORS.bgCard, marginHorizontal: 16, borderRadius: 16, borderWidth: 1, borderColor: COLORS.border, overflow: 'hidden' },
  row:          { flexDirection: 'row', alignItems: 'center', padding: 14, gap: 12 },
  rowIcon:      { width: 36, height: 36, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  rowCenter:    { flex: 1, alignItems: 'flex-end' },
  rowLabel:     { fontSize: 14, fontWeight: '600', color: '#fff' },
  rowValue:     { fontSize: 12, color: COLORS.textMuted, marginTop: 2 },
  divider:      { height: 1, backgroundColor: COLORS.border, marginLeft: 14 },
  modalBg:      { flex: 1, backgroundColor: 'rgba(0,0,0,0.8)', justifyContent: 'center', padding: 24 },
  modalCard:    { backgroundColor: COLORS.bgCard, borderRadius: 24, padding: 24 },
  modalTitle:   { fontSize: 18, fontWeight: '800', color: '#fff', textAlign: 'center', marginBottom: 14 },
  modalText:    { fontSize: 13, color: COLORS.textSub, textAlign: 'center', lineHeight: 22, marginBottom: 20 },
  modalBtn:     { backgroundColor: COLORS.primary, borderRadius: 14, padding: 14, alignItems: 'center' },
  modalBtnText: { color: '#fff', fontSize: 15, fontWeight: '700' },
});
