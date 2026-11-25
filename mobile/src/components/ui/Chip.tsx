// Tombol pilihan berbentuk pil (filter kategori, tema kartu, status).
import { Pressable, Text } from "react-native";

interface ChipProps {
  label: string;
  active?: boolean;
  onPress?: () => void;
}

export function Chip({ label, active, onPress }: ChipProps) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityState={{ selected: !!active }}
      className={`mr-2 rounded-full border px-4 py-2 active:opacity-70 ${
        active ? "border-brand bg-brand" : "border-line bg-surface"
      }`}
    >
      <Text className={`text-sm font-semibold ${active ? "text-white" : "text-ink-secondary"}`}>{label}</Text>
    </Pressable>
  );
}
