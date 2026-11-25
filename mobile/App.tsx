/**
 * App.tsx — Titik masuk (root component) aplikasi Faedah Shop Mobile.
 * ------------------------------------------------------------------
 * Urutan pembungkus (provider):
 *   SafeAreaProvider   → menyediakan inset notch/status bar/home indicator
 *   AuthProvider       → state login global (JWT di AsyncStorage)
 *   NavigationContainer→ wadah React Navigation + tema warna brand
 */
import "./global.css"; // wajib: memuat style Tailwind (NativeWind)

import { DefaultTheme, NavigationContainer, type Theme } from "@react-navigation/native";
import { StatusBar } from "expo-status-bar";
import React from "react";
import { ActivityIndicator, View } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";

import { AuthProvider, useAuth } from "./src/context/AuthContext";
import RootNavigator from "./src/navigation/RootNavigator";
import { colors } from "./src/theme/colors";

/** Tema navigasi disesuaikan dengan warna brand Faedah Shop */
const navigationTheme: Theme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: colors.brand,
    background: colors.surfaceSecondary,
    card: colors.surface,
    text: colors.textPrimary,
    border: colors.border,
  },
};

/** Menunggu auto-login selesai sebelum menampilkan navigasi */
function AppContent() {
  const { initializing } = useAuth();

  if (initializing) {
    return (
      <View className="flex-1 items-center justify-center bg-surface">
        <ActivityIndicator size="large" color={colors.brand} />
      </View>
    );
  }

  return (
    <NavigationContainer theme={navigationTheme}>
      <RootNavigator />
    </NavigationContainer>
  );
}

export default function App() {
  return (
    <SafeAreaProvider>
      <AuthProvider>
        <StatusBar style="dark" />
        <AppContent />
      </AuthProvider>
    </SafeAreaProvider>
  );
}
