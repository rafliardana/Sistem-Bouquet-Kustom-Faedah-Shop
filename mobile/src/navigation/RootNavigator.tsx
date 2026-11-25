/**
 * navigation/RootNavigator.tsx
 * ------------------------------------------------------------------
 * Navigator akar (Native Stack) yang membungkus:
 *   - MainTabs        : Bottom Tab pelanggan
 *   - Checkout        : layar penuh (tab bar disembunyikan) agar fokus bayar
 *   - AdminDashboard  : hanya didaftarkan jika user ber-role admin/owner
 * Native Stack memakai komponen navigasi asli (UINavigationController
 * di iOS, Fragment di Android) sehingga transisi terasa native.
 */
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import React from "react";

import { useAuth } from "../context/AuthContext";
import AdminDashboardScreen from "../screens/admin/AdminDashboardScreen";
import CheckoutScreen from "../screens/checkout/CheckoutScreen";
import { colors } from "../theme/colors";
import CustomerTabs from "./CustomerTabs";
import type { RootStackParamList } from "./types";

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function RootNavigator() {
  const { isAdmin } = useAuth();

  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: colors.surface },
        headerTitleStyle: { color: colors.textPrimary, fontWeight: "700" },
        headerTintColor: colors.brand, // warna tombol kembali
        headerTitleAlign: "center",
        headerShadowVisible: false,
        headerBackButtonDisplayMode: "minimal", // iOS: sembunyikan teks "Back"
        contentStyle: { backgroundColor: colors.surfaceSecondary },
      }}
    >
      <Stack.Screen name="MainTabs" component={CustomerTabs} options={{ headerShown: false }} />
      <Stack.Screen name="Checkout" component={CheckoutScreen} options={{ title: "Checkout" }} />

      {/* Proteksi rute: layar admin tidak terdaftar sama sekali untuk pelanggan */}
      {isAdmin && (
        <Stack.Screen
          name="AdminDashboard"
          component={AdminDashboardScreen}
          options={{ title: "Dashboard Admin" }}
        />
      )}
    </Stack.Navigator>
  );
}
