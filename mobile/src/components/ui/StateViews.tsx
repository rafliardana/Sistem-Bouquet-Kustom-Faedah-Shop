// Tampilan status umum: memuat (loading), kosong (empty), dan error dengan tombol coba lagi.
import type { ComponentProps } from "react";
import { ActivityIndicator, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { colors } from "@/theme/colors";
import { Button } from "./Button";

export function LoadingView({ message = "Memuat..." }: { message?: string }) {
  return (
    <View className="flex-1 items-center justify-center p-8">
      <ActivityIndicator size="large" color={colors.brand} />
      <Text className="mt-3 text-sm text-ink-tertiary">{message}</Text>
    </View>
  );
}

interface EmptyStateProps {
  icon?: ComponentProps<typeof Ionicons>["name"];
  title: string;
  message?: string;
  actionLabel?: string;
  onAction?: () => void;
}

export function EmptyState({ icon = "flower-outline", title, message, actionLabel, onAction }: EmptyStateProps) {
  return (
    <View className="flex-1 items-center justify-center p-8">
      <View className="mb-4 h-16 w-16 items-center justify-center rounded-full bg-brand-tertiary">
        <Ionicons name={icon} size={30} color={colors.brand} />
      </View>
      <Text className="text-center text-base font-bold text-ink">{title}</Text>
      {message && <Text className="mt-1 text-center text-sm text-ink-tertiary">{message}</Text>}
      {actionLabel && onAction && <Button label={actionLabel} onPress={onAction} className="mt-5" />}
    </View>
  );
}

export function ErrorView({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <EmptyState
      icon="cloud-offline-outline"
      title="Terjadi Kesalahan"
      message={message}
      actionLabel="Coba Lagi"
      onAction={onRetry}
    />
  );
}
