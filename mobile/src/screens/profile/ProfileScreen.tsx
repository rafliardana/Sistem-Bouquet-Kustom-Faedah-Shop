/**
 * screens/profile/ProfileScreen.tsx
 * ------------------------------------------------------------------
 * Halaman Profil & Autentikasi (Tab ke-4).
 * - Mode belum login: formulir Masuk (Login) & Daftar Pelanggan (Register)
 *   terhubung ke POST /api/auth/login dan POST /api/signup, menyimpan
 *   JWT ke AsyncStorage via AuthContext.
 * - Mode sudah login: informasi akun, tombol cepat Lacak Pesanan,
 *   tombol akses Dashboard Admin (khusus role admin/owner), & Logout.
 */
import { Ionicons } from "@expo/vector-icons";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";

import { API_BASE_URL } from "../../config/env";
import { useAuth } from "../../context/AuthContext";
import type { CustomerTabScreenProps } from "../../navigation/types";
import { colors } from "../../theme/colors";
import { shadows } from "../../theme/shadows";

export default function ProfileScreen({ navigation }: CustomerTabScreenProps<"Profil">) {
  const { user, isAdmin, login, register, logout } = useAuth();

  const [mode, setMode] = useState<"login" | "register">("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async () => {
    setError(null);
    if (!email.trim() || !password || (mode === "register" && !name.trim())) {
      setError("Mohon lengkapi seluruh kolom yang wajib diisi.");
      return;
    }

    setSubmitting(true);
    try {
      if (mode === "login") {
        await login(email, password);
      } else {
        await register(name, email, password);
      }
      setPassword("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Autentikasi gagal. Coba lagi.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleLogout = () => {
    Alert.alert("Keluar Akun", "Anda yakin ingin keluar dari Faedah Shop?", [
      { text: "Batal", style: "cancel" },
      { text: "Keluar", style: "destructive", onPress: () => logout() },
    ]);
  };

  // ── Tampilan saat sudah login ──────────────────────────────────
  if (user) {
    const initial = (user.name || user.email).charAt(0).toUpperCase();
    return (
      <ScrollView
        className="flex-1 bg-surface-secondary"
        contentContainerStyle={{ padding: 20, gap: 16 }}
      >
        {/* Kartu identitas pengguna */}
        <View className="items-center rounded-card bg-surface p-6" style={shadows.card}>
          <View className="h-16 w-16 items-center justify-center rounded-full bg-brand">
            <Text className="text-[26px] font-extrabold text-white">{initial}</Text>
          </View>
          <Text className="mt-3 text-[18px] font-extrabold text-ink">{user.name}</Text>
          <Text className="mt-0.5 text-[13px] text-ink-secondary">{user.email}</Text>
          <View className="mt-2.5 rounded-full bg-brand-tertiary px-3 py-1">
            <Text className="text-[11px] font-bold uppercase text-brand">Role: {user.role}</Text>
          </View>
        </View>

        {/* Menu cepat */}
        <View className="overflow-hidden rounded-card bg-surface" style={shadows.card}>
          {/* Akses Dashboard Admin (hanya tampil bila role admin / owner) */}
          {isAdmin && (
            <Pressable
              onPress={() => navigation.navigate("AdminDashboard")}
              className="flex-row items-center justify-between border-b border-line-subtle px-4 py-4 active:bg-surface-secondary"
            >
              <View className="flex-row items-center gap-3">
                <View className="h-10 w-10 items-center justify-center rounded-xl bg-brand-tertiary">
                  <Ionicons name="shield-checkmark-outline" size={20} color={colors.brand} />
                </View>
                <View>
                  <Text className="text-[14px] font-bold text-ink">Dashboard Admin</Text>
                  <Text className="text-[12px] text-ink-secondary">
                    Kelola pesanan & perbarui status pengerjaan
                  </Text>
                </View>
              </View>
              <Ionicons name="chevron-forward" size={18} color={colors.textTertiary} />
            </Pressable>
          )}

          <Pressable
            onPress={() => navigation.navigate("LacakPesanan")}
            className="flex-row items-center justify-between px-4 py-4 active:bg-surface-secondary"
          >
            <View className="flex-row items-center gap-3">
              <View className="h-10 w-10 items-center justify-center rounded-xl bg-surface-secondary">
                <Ionicons name="receipt-outline" size={20} color={colors.textPrimary} />
              </View>
              <View>
                <Text className="text-[14px] font-bold text-ink">Pesanan Saya</Text>
                <Text className="text-[12px] text-ink-secondary">
                  Lacak riwayat & status buket FLR-XXXXXX
                </Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={18} color={colors.textTertiary} />
          </Pressable>
        </View>

        {/* Info endpoint aktif (memudahkan verifikasi saat demo UTS) */}
        <View className="rounded-xl bg-surface px-4 py-3">
          <Text className="text-[11px] font-semibold text-ink-tertiary">Server API Aktif</Text>
          <Text className="mt-0.5 text-[12px] text-ink-secondary">{API_BASE_URL}</Text>
        </View>

        <Pressable
          onPress={handleLogout}
          accessibilityRole="button"
          className="flex-row items-center justify-center gap-2 rounded-full bg-danger-bg py-3.5 active:opacity-80"
        >
          <Ionicons name="log-out-outline" size={18} color={colors.danger} />
          <Text className="text-[14px] font-bold text-danger">Keluar dari Akun</Text>
        </Pressable>
      </ScrollView>
    );
  }

  // ── Tampilan Form Login / Register ─────────────────────────────
  return (
    <KeyboardAvoidingView
      className="flex-1 bg-surface-secondary"
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      keyboardVerticalOffset={90}
    >
      <ScrollView
        contentContainerStyle={{ padding: 20, gap: 16 }}
        keyboardShouldPersistTaps="handled"
      >
        <View className="items-center py-2">
          <View className="h-14 w-14 items-center justify-center rounded-full bg-brand-tertiary">
            <Text className="text-3xl">💐</Text>
          </View>
          <Text className="mt-3 text-[20px] font-extrabold text-ink">Faedah Shop</Text>
          <Text className="mt-1 text-center text-[13px] text-ink-secondary">
            {mode === "login"
              ? "Masuk sebagai Pelanggan atau Admin Faedah Shop."
              : "Buat akun pelanggan untuk memesan & melacak buket kustom."}
          </Text>
        </View>

        {/* Segmented Control Masuk / Daftar */}
        <View className="flex-row rounded-full bg-surface p-1" style={shadows.card}>
          {(["login", "register"] as const).map((tab) => {
            const active = mode === tab;
            return (
              <Pressable
                key={tab}
                onPress={() => {
                  setMode(tab);
                  setError(null);
                }}
                className={`flex-1 items-center rounded-full py-2.5 ${active ? "bg-brand" : ""}`}
              >
                <Text className={`text-[13px] font-bold ${active ? "text-white" : "text-ink-secondary"}`}>
                  {tab === "login" ? "Masuk" : "Daftar Akun"}
                </Text>
              </Pressable>
            );
          })}
        </View>

        {/* Formulir */}
        <View className="gap-3.5 rounded-card bg-surface p-5" style={shadows.card}>
          {mode === "register" && (
            <View className="gap-1">
              <Text className="text-[12px] font-semibold text-ink-secondary">Nama Lengkap</Text>
              <TextInput
                value={name}
                onChangeText={setName}
                placeholder="Nama lengkap Anda"
                placeholderTextColor={colors.textTertiary}
                className="h-11 rounded-xl border border-line bg-surface-secondary px-3 text-[14px] text-ink"
              />
            </View>
          )}

          <View className="gap-1">
            <Text className="text-[12px] font-semibold text-ink-secondary">Email</Text>
            <TextInput
              value={email}
              onChangeText={setEmail}
              placeholder="nama@email.com"
              placeholderTextColor={colors.textTertiary}
              autoCapitalize="none"
              keyboardType="email-address"
              className="h-11 rounded-xl border border-line bg-surface-secondary px-3 text-[14px] text-ink"
            />
          </View>

          <View className="gap-1">
            <Text className="text-[12px] font-semibold text-ink-secondary">Password</Text>
            <TextInput
              value={password}
              onChangeText={setPassword}
              placeholder="Masukkan password"
              placeholderTextColor={colors.textTertiary}
              secureTextEntry
              className="h-11 rounded-xl border border-line bg-surface-secondary px-3 text-[14px] text-ink"
            />
          </View>

          {error && (
            <View className="rounded-xl bg-danger-bg px-3 py-2.5">
              <Text className="text-[12px] font-medium text-danger">{error}</Text>
            </View>
          )}

          <Pressable
            onPress={handleSubmit}
            disabled={submitting}
            accessibilityRole="button"
            className="mt-1 flex-row items-center justify-center rounded-full bg-brand py-3.5 active:opacity-85"
          >
            {submitting ? (
              <ActivityIndicator color={colors.white} />
            ) : (
              <Text className="text-[15px] font-bold text-white">
                {mode === "login" ? "Masuk Sekarang" : "Daftar & Masuk"}
              </Text>
            )}
          </Pressable>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
