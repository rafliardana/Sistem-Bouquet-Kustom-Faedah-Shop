// Kartu angka ringkas di Dashboard admin (total pesanan, pendapatan, dll.).
import type { ComponentProps } from "react";
import { Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { colors } from "@/theme/colors";

interface StatCardProps {
  icon: ComponentProps<typeof Ionicons>["name"];
  label: string;
  value: string;
  accent?: boolean; // kartu utama berlatar warna brand
}

export function StatCard({ icon, label, value, accent }: StatCardProps) {
  return (
    <View className={`flex-1 rounded-2xl p-4 ${accent ? "bg-brand" : "border border-line bg-surface"}`}>
      <View className={`mb-3 h-9 w-9 items-center justify-center rounded-full ${accent ? "bg-white/20" : "bg-brand-tertiary"}`}>
        <Ionicons name={icon} size={18} color={accent ? "#fff" : colors.brand} />
      </View>
      <Text className={`text-xs ${accent ? "text-white/80" : "text-ink-tertiary"}`}>{label}</Text>
      <Text numberOfLines={1} adjustsFontSizeToFit className={`mt-0.5 text-lg font-bold ${accent ? "text-white" : "text-ink"}`}>
        {value}
      </Text>
    </View>
  );
}
