/**
 * navigation/CustomerTabs.tsx
 * ------------------------------------------------------------------
 * Navigasi utama Pelanggan berupa Bottom Tab (4 menu):
 *   1. Katalog        — daftar buket & filter kategori
 *   2. Kustomisasi    — atur ukuran, addons, catatan, foto referensi
 *   3. Lacak Pesanan  — cek status pesanan FLR-XXXXXX
 *   4. Profil         — login/registrasi & akses admin
 * Bottom tab dipilih karena mudah dijangkau ibu jari (thumb zone)
 * dan merupakan pola standar pada Android (Material) maupun iOS (HIG).
 */
import { Ionicons } from "@expo/vector-icons";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import React from "react";
import { Platform } from "react-native";

import CatalogScreen from "../screens/catalog/CatalogScreen";
import CustomizeScreen from "../screens/customize/CustomizeScreen";
import ProfileScreen from "../screens/profile/ProfileScreen";
import TrackOrderScreen from "../screens/tracking/TrackOrderScreen";
import { colors } from "../theme/colors";
import type { CustomerTabParamList } from "./types";

const Tab = createBottomTabNavigator<CustomerTabParamList>();

/** Pemetaan ikon tab: [ikon aktif, ikon tidak aktif] (Ionicons) */
const TAB_ICONS: Record<
  keyof CustomerTabParamList,
  [keyof typeof Ionicons.glyphMap, keyof typeof Ionicons.glyphMap]
> = {
  Katalog: ["flower", "flower-outline"],
  Kustomisasi: ["color-palette", "color-palette-outline"],
  LacakPesanan: ["receipt", "receipt-outline"],
  Profil: ["person-circle", "person-circle-outline"],
};

export default function CustomerTabs() {
  return (
    <Tab.Navigator
      initialRouteName="Katalog"
      screenOptions={({ route }) => ({
        // Ikon berubah filled/outline sesuai status fokus
        tabBarIcon: ({ focused, color, size }) => {
          const [active, inactive] = TAB_ICONS[route.name];
          return <Ionicons name={focused ? active : inactive} size={size} color={color} />;
        },
        tabBarActiveTintColor: colors.brand,
        tabBarInactiveTintColor: colors.textTertiary,
        tabBarLabelStyle: { fontSize: 11, fontWeight: "600" },
        tabBarStyle: {
          backgroundColor: colors.surface,
          borderTopColor: colors.border,
          // Tinggi disesuaikan agar proporsional di Android (iOS diatur safe area)
          ...(Platform.OS === "android" ? { height: 64, paddingBottom: 8, paddingTop: 6 } : null),
        },
        headerStyle: { backgroundColor: colors.surface },
        headerTitleStyle: { color: colors.textPrimary, fontWeight: "700" },
        headerTitleAlign: "center", // judul di tengah pada kedua platform
        headerShadowVisible: false,
      })}
    >
      <Tab.Screen
        name="Katalog"
        component={CatalogScreen}
        options={{ title: "Katalog", headerShown: false }}
      />
      <Tab.Screen
        name="Kustomisasi"
        component={CustomizeScreen}
        options={{ title: "Kustomisasi", headerTitle: "Kustomisasi Buket" }}
      />
      <Tab.Screen
        name="LacakPesanan"
        component={TrackOrderScreen}
        options={{ title: "Lacak", headerTitle: "Lacak Pesanan" }}
      />
      <Tab.Screen
        name="Profil"
        component={ProfileScreen}
        options={{ title: "Profil", headerTitle: "Profil Saya" }}
      />
    </Tab.Navigator>
  );
}
