// Baris pilihan yang bisa ditekan, dipakai untuk ukuran (radio),
// addon (checkbox), dan metode pembayaran (radio).
import { Pressable, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { colors } from "@/theme/colors";

interface OptionRowProps {
  title: string;
  subtitle?: string;
  trailing?: string;
  selected: boolean;
  mode: "radio" | "checkbox";
  onPress: () => void;
}

export function OptionRow({ title, subtitle, trailing, selected, mode, onPress }: OptionRowProps) {
  const icon =
    mode === "radio"
      ? selected ? "radio-button-on" : "radio-button-off"
      : selected ? "checkbox" : "square-outline";
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole={mode === "radio" ? "radio" : "checkbox"}
      accessibilityState={{ checked: selected }}
      className={`mb-2 flex-row items-center rounded-xl border p-3.5 active:opacity-80 ${
        selected ? "border-brand bg-brand-muted" : "border-line bg-surface"
      }`}
    >
      <Ionicons name={icon} size={22} color={selected ? colors.brand : colors.inkTertiary} />
      <View className="ml-3 flex-1">
        <Text className="text-sm font-semibold text-ink">{title}</Text>
        {subtitle && <Text className="mt-0.5 text-xs text-ink-tertiary">{subtitle}</Text>}
      </View>
      {trailing && <Text className="text-sm font-semibold text-ink-secondary">{trailing}</Text>}
    </Pressable>
  );
}
