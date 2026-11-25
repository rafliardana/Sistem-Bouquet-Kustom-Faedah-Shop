/**
 * components/EmptyState.tsx
 * ------------------------------------------------------------------
 * Tampilan status kosong / error yang konsisten di seluruh aplikasi
 * (produk tidak ditemukan, gagal koneksi, belum login, dll).
 */
import React from "react";
import { Pressable, Text, View } from "react-native";

interface EmptyStateProps {
  emoji: string;
  title: string;
  message: string;
  actionLabel?: string;
  onAction?: () => void;
}

export default function EmptyState({ emoji, title, message, actionLabel, onAction }: EmptyStateProps) {
  return (
    <View className="items-center rounded-card bg-surface px-6 py-10">
      <Text className="text-5xl">{emoji}</Text>
      <Text className="mt-3 text-center text-[17px] font-bold text-ink">{title}</Text>
      <Text className="mt-1 text-center text-[13px] leading-5 text-ink-secondary">{message}</Text>
      {actionLabel && onAction && (
        <Pressable
          onPress={onAction}
          accessibilityRole="button"
          className="mt-5 rounded-full bg-brand px-6 py-3 active:opacity-80"
        >
          <Text className="text-[14px] font-bold text-white">{actionLabel}</Text>
        </Pressable>
      )}
    </View>
  );
}
