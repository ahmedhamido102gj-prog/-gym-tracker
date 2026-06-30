// src/navigation/AppNavigator.js
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { View, Text, ActivityIndicator, StyleSheet } from 'react-native';

import { useAuth } from '../context/AuthContext';
import { COLORS } from '../data/workoutData';

// Screens
import LoginScreen      from '../screens/LoginScreen';
import RegisterScreen   from '../screens/RegisterScreen';
import HomeScreen       from '../screens/HomeScreen';
import ProgramScreen    from '../screens/ProgramScreen';
import WorkoutScreen    from '../screens/WorkoutScreen';
import ProgressScreen   from '../screens/ProgressScreen';
import GoalsScreen      from '../screens/GoalsScreen';
import SettingsScreen   from '../screens/SettingsScreen';

const Stack = createNativeStackNavigator();
const Tab   = createBottomTabNavigator();

// ============================================
// التنقل السفلي (للمستخدمين المسجلين)
// ============================================
function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarStyle: styles.tabBar,
        tabBarActiveTintColor: COLORS.primary,
        tabBarInactiveTintColor: COLORS.textMuted,
        tabBarLabelStyle: styles.tabLabel,
        tabBarIcon: ({ focused, color, size }) => {
          const icons = {
            Home:     focused ? 'home'           : 'home-outline',
            Program:  focused ? 'calendar'       : 'calendar-outline',
            Progress: focused ? 'stats-chart'    : 'stats-chart-outline',
            Goals:    focused ? 'trophy'         : 'trophy-outline',
            Settings: focused ? 'settings'       : 'settings-outline',
          };
          return <Ionicons name={icons[route.name]} size={size} color={color} />;
        },
      })}
    >
      <Tab.Screen name="Home"     component={HomeScreen}     options={{ title: 'الرئيسية' }} />
      <Tab.Screen name="Program"  component={ProgramScreen}  options={{ title: 'البرنامج' }} />
      <Tab.Screen name="Progress" component={ProgressScreen} options={{ title: 'التقدم' }} />
      <Tab.Screen name="Goals"    component={GoalsScreen}    options={{ title: 'الأهداف' }} />
      <Tab.Screen name="Settings" component={SettingsScreen} options={{ title: 'الإعدادات' }} />
    </Tab.Navigator>
  );
}

// ============================================
// Stack الرئيسي
// ============================================
export default function AppNavigator() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <View style={styles.loading}>
        <Text style={styles.loadingIcon}>💪</Text>
        <ActivityIndicator size="large" color={COLORS.primary} style={{ marginTop: 20 }} />
        <Text style={styles.loadingText}>GymTracker Pro</Text>
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {!user ? (
          // Auth Stack
          <>
            <Stack.Screen name="Login"    component={LoginScreen} />
            <Stack.Screen name="Register" component={RegisterScreen} />
          </>
        ) : (
          // App Stack
          <>
            <Stack.Screen name="Main"    component={MainTabs} />
            <Stack.Screen
              name="Workout"
              component={WorkoutScreen}
              options={{ presentation: 'modal', gestureEnabled: false }}
            />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  loading: {
    flex: 1, backgroundColor: COLORS.bg,
    alignItems: 'center', justifyContent: 'center',
  },
  loadingIcon:  { fontSize: 64 },
  loadingText:  { color: COLORS.textSub, marginTop: 12, fontSize: 16, fontWeight: '600' },
  tabBar: {
    backgroundColor: '#0f0f1e',
    borderTopColor: COLORS.border,
    borderTopWidth: 1,
    height: 70,
    paddingBottom: 10,
    paddingTop: 8,
  },
  tabLabel: { fontSize: 10, fontWeight: '600' },
});
