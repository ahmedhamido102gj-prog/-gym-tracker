// src/screens/RegisterScreen.js
import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  SafeAreaView, KeyboardAvoidingView, Platform, ScrollView,
  Alert, ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import { COLORS } from '../data/workoutData';

const Field = ({ icon, placeholder, value, onChange, keyboard = 'default', secure = false, hint }) => {
  const [show, setShow] = useState(false);
  return (
    <View style={{ marginBottom: 12 }}>
      {hint && <Text style={S.hint}>{hint}</Text>}
      <View style={S.inputWrap}>
        {secure
          ? <TouchableOpacity onPress={() => setShow(!show)} style={S.icon}>
              <Ionicons name={show ? 'eye-outline' : 'eye-off-outline'} size={16} color={COLORS.textMuted} />
            </TouchableOpacity>
          : <Ionicons name={icon} size={16} color={COLORS.textMuted} style={S.icon} />
        }
        <TextInput
          style={S.input}
          placeholder={placeholder}
          placeholderTextColor={COLORS.textMuted}
          value={value}
          onChangeText={onChange}
          keyboardType={keyboard}
          secureTextEntry={secure && !show}
          autoCapitalize="none"
          textAlign="right"
        />
      </View>
    </View>
  );
};

export default function RegisterScreen({ navigation }) {
  const { register } = useAuth();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: '', email: '', password: '', confirmPassword: '',
    weight: '', height: '', targetWeight: '',
  });

  const update = (key, val) => setForm(p => ({ ...p, [key]: val }));

  const handleRegister = async () => {
    if (!form.name || !form.email || !form.password || !form.weight || !form.height) {
      Alert.alert('ناقص', 'كمل كل الحقول المطلوبة');
      return;
    }
    if (form.password !== form.confirmPassword) {
      Alert.alert('خطأ', 'كلمة المرور مش متطابقة');
      return;
    }
    if (form.password.length < 6) {
      Alert.alert('خطأ', 'كلمة المرور محتاج 6 أحرف على الأقل');
      return;
    }
    setLoading(true);
    try {
      await register(form);
    } catch (e) {
      const msgs = {
        'auth/email-already-in-use': 'البريد مسجل من قبل',
        'auth/invalid-email': 'بريد غير صحيح',
        'auth/weak-password': 'كلمة المرور ضعيفة',
      };
      Alert.alert('خطأ', msgs[e.code] || e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <LinearGradient colors={['#0b0b14', '#13102b', '#0b0b14']} style={{ flex: 1 }}>
      <SafeAreaView style={{ flex: 1 }}>
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
          <ScrollView contentContainerStyle={S.scroll} keyboardShouldPersistTaps="handled">

            <View style={S.header}>
              <TouchableOpacity onPress={() => navigation.goBack()} style={S.back}>
                <Ionicons name="arrow-back" size={22} color={COLORS.textSub} />
              </TouchableOpacity>
              <Text style={S.title}>إنشاء حساب جديد 💪</Text>
              <Text style={S.sub}>ابدأ رحلتك لبناء جسمك</Text>
            </View>

            <View style={S.card}>
              <Text style={S.section}>📋 البيانات الأساسية</Text>
              <Field icon="person-outline" placeholder="الاسم *" value={form.name} onChange={v => update('name', v)} />
              <Field icon="mail-outline" placeholder="البريد الإلكتروني *" value={form.email} onChange={v => update('email', v)} keyboard="email-address" />
              <Field placeholder="كلمة المرور *" value={form.password} onChange={v => update('password', v)} secure />
              <Field placeholder="تأكيد كلمة المرور *" value={form.confirmPassword} onChange={v => update('confirmPassword', v)} secure />
            </View>

            <View style={S.card}>
              <Text style={S.section}>📏 البيانات الجسدية</Text>
              <Field icon="barbell-outline" placeholder="الوزن الحالي (كجم) *" value={form.weight} onChange={v => update('weight', v)} keyboard="numeric" />
              <Field icon="resize-outline" placeholder="الطول (سم) *" value={form.height} onChange={v => update('height', v)} keyboard="numeric" />
              <Field icon="trending-up-outline" placeholder="الوزن المستهدف (كجم)" value={form.targetWeight} onChange={v => update('targetWeight', v)} keyboard="numeric" />
            </View>

            <TouchableOpacity
              style={[S.btn, loading && { opacity: 0.7 }]}
              onPress={handleRegister}
              disabled={loading}
              activeOpacity={0.8}
            >
              <LinearGradient colors={[COLORS.green, '#2aa862']} style={S.btnGrad} start={{x:0,y:0}} end={{x:1,y:1}}>
                {loading
                  ? <ActivityIndicator color="#fff" />
                  : <Text style={S.btnText}>إنشاء الحساب 🚀</Text>
                }
              </LinearGradient>
            </TouchableOpacity>

            <TouchableOpacity onPress={() => navigation.goBack()} style={{ alignItems: 'center', marginTop: 20 }}>
              <Text style={{ color: COLORS.textSub, fontSize: 14 }}>عندك حساب؟ <Text style={{ color: COLORS.primaryLight }}>سجل دخول</Text></Text>
            </TouchableOpacity>

          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </LinearGradient>
  );
}

const S = StyleSheet.create({
  scroll:   { flexGrow: 1, padding: 20 },
  header:   { alignItems: 'center', marginVertical: 24, position: 'relative' },
  back:     { position: 'absolute', right: 0, top: 0, padding: 8 },
  title:    { fontSize: 24, fontWeight: '900', color: '#fff' },
  sub:      { fontSize: 13, color: COLORS.textSub, marginTop: 6 },
  card:     { backgroundColor: COLORS.bgCard, borderRadius: 20, padding: 18, marginBottom: 14, borderWidth: 1, borderColor: COLORS.border },
  section:  { fontSize: 14, fontWeight: '700', color: COLORS.primaryLight, marginBottom: 14, textAlign: 'right' },
  hint:     { fontSize: 11, color: COLORS.textMuted, textAlign: 'right', marginBottom: 4 },
  inputWrap:{ flexDirection: 'row', alignItems: 'center', backgroundColor: '#1a1a2e', borderRadius: 12, borderWidth: 1, borderColor: COLORS.border, height: 50, paddingHorizontal: 12 },
  icon:     { marginLeft: 8 },
  input:    { flex: 1, color: '#fff', fontSize: 14 },
  btn:      { borderRadius: 16, overflow: 'hidden', marginTop: 4 },
  btnGrad:  { paddingVertical: 16, alignItems: 'center' },
  btnText:  { color: '#fff', fontSize: 17, fontWeight: '800' },
});
