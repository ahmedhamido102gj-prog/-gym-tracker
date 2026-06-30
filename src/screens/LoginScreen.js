// src/screens/LoginScreen.js
import React, { useState, useRef } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, SafeAreaView, KeyboardAvoidingView,
  Platform, ScrollView, Animated, Alert, ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import { COLORS } from '../data/workoutData';

export default function LoginScreen({ navigation }) {
  const { login } = useAuth();
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw]     = useState(false);
  const [loading, setLoading]   = useState(false);
  const shakeAnim = useRef(new Animated.Value(0)).current;

  const shake = () => {
    Animated.sequence([
      Animated.timing(shakeAnim, { toValue: 10,  duration: 50, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: -10, duration: 50, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 10,  duration: 50, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 0,   duration: 50, useNativeDriver: true }),
    ]).start();
  };

  const handleLogin = async () => {
    if (!email.trim() || !password) { shake(); return; }
    setLoading(true);
    try {
      await login(email.trim(), password);
    } catch (e) {
      shake();
      const msgs = {
        'auth/user-not-found':  'البريد غير مسجل',
        'auth/wrong-password':  'كلمة المرور غلط',
        'auth/invalid-email':   'بريد إلكتروني غير صحيح',
        'auth/too-many-requests': 'حاولت كتير، انتظر شوية',
      };
      Alert.alert('خطأ', msgs[e.code] || 'حدث خطأ، حاول مرة أخرى');
    } finally {
      setLoading(false);
    }
  };

  return (
    <LinearGradient colors={['#0b0b14', '#13102b', '#0b0b14']} style={{ flex: 1 }}>
      <SafeAreaView style={{ flex: 1 }}>
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
          <ScrollView contentContainerStyle={S.scroll} keyboardShouldPersistTaps="handled">

            {/* Logo */}
            <View style={S.logo}>
              <Text style={S.logoEmoji}>💪</Text>
              <Text style={S.appName}>GymTracker Pro</Text>
              <Text style={S.tagline}>تتبع تقدمك، ابني جسمك</Text>
            </View>

            {/* Form */}
            <Animated.View style={[S.card, { transform: [{ translateX: shakeAnim }] }]}>
              <Text style={S.title}>مرحبًا بعودتك 👋</Text>
              <Text style={S.sub}>سجل دخول للمتابعة</Text>

              <View style={S.inputWrap}>
                <Ionicons name="mail-outline" size={18} color={COLORS.textMuted} style={S.icon} />
                <TextInput
                  style={S.input}
                  placeholder="البريد الإلكتروني"
                  placeholderTextColor={COLORS.textMuted}
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  textAlign="right"
                />
              </View>

              <View style={S.inputWrap}>
                <TouchableOpacity onPress={() => setShowPw(!showPw)} style={S.icon}>
                  <Ionicons name={showPw ? 'eye-outline' : 'eye-off-outline'} size={18} color={COLORS.textMuted} />
                </TouchableOpacity>
                <TextInput
                  style={S.input}
                  placeholder="كلمة المرور"
                  placeholderTextColor={COLORS.textMuted}
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!showPw}
                  textAlign="right"
                />
              </View>

              <TouchableOpacity
                style={[S.btn, loading && { opacity: 0.7 }]}
                onPress={handleLogin}
                disabled={loading}
                activeOpacity={0.8}
              >
                <LinearGradient colors={[COLORS.primary, COLORS.primaryDark]} style={S.btnGrad} start={{x:0,y:0}} end={{x:1,y:1}}>
                  {loading
                    ? <ActivityIndicator color="#fff" />
                    : <Text style={S.btnText}>دخول 🚀</Text>
                  }
                </LinearGradient>
              </TouchableOpacity>

              <View style={S.divider}>
                <View style={S.line} /><Text style={S.orText}>أو</Text><View style={S.line} />
              </View>

              <TouchableOpacity style={S.register} onPress={() => navigation.navigate('Register')}>
                <Text style={S.registerText}>مش عندك حساب؟ <Text style={{ color: COLORS.primaryLight, fontWeight: '700' }}>سجل دلوقتي</Text></Text>
              </TouchableOpacity>
            </Animated.View>

          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </LinearGradient>
  );
}

const S = StyleSheet.create({
  scroll:     { flexGrow: 1, justifyContent: 'center', padding: 24 },
  logo:       { alignItems: 'center', marginBottom: 40 },
  logoEmoji:  { fontSize: 64 },
  appName:    { fontSize: 28, fontWeight: '900', color: '#fff', marginTop: 12 },
  tagline:    { fontSize: 14, color: COLORS.textSub, marginTop: 6 },
  card:       { backgroundColor: COLORS.bgCard, borderRadius: 24, padding: 24, borderWidth: 1, borderColor: COLORS.border },
  title:      { fontSize: 22, fontWeight: '800', color: '#fff', textAlign: 'right', marginBottom: 4 },
  sub:        { fontSize: 13, color: COLORS.textSub, textAlign: 'right', marginBottom: 24 },
  inputWrap:  { flexDirection: 'row', alignItems: 'center', backgroundColor: '#1a1a2e', borderRadius: 14, marginBottom: 14, borderWidth: 1, borderColor: COLORS.border, height: 54, paddingHorizontal: 14 },
  icon:       { marginLeft: 8 },
  input:      { flex: 1, color: '#fff', fontSize: 15 },
  btn:        { borderRadius: 14, overflow: 'hidden', marginTop: 8 },
  btnGrad:    { paddingVertical: 16, alignItems: 'center' },
  btnText:    { color: '#fff', fontSize: 17, fontWeight: '800' },
  divider:    { flexDirection: 'row', alignItems: 'center', marginVertical: 20 },
  line:       { flex: 1, height: 1, backgroundColor: COLORS.border },
  orText:     { color: COLORS.textMuted, marginHorizontal: 12, fontSize: 13 },
  register:   { alignItems: 'center' },
  registerText: { color: COLORS.textSub, fontSize: 14 },
});
