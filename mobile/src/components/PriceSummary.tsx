// Rincian harga yang diperbarui langsung setiap pilihan ukuran/addon berubah.
import { Text, View } from "react-native";
import { formatRupiah } from "@/utils/format";

interface Line {
  label: string;
  value: number;
}

export function PriceSummary({ lines, total, totalLabel = "Total" }: { lines: Line[]; total: number; totalLabel?: string }) {
  return (
    <View>
      {lines.map((l) => (
        <View key={l.label} className="mb-1.5 flex-row justify-between">
          <Text className="flex-1 pr-2 text-sm text-ink-secondary">{l.label}</Text>
          <Text className="text-sm text-ink">{formatRupiah(l.value)}</Text>
        </View>
      ))}
      <View className="my-2 h-px bg-line" />
      <View className="flex-row justify-between">
        <Text className="text-base font-bold text-ink">{totalLabel}</Text>
        <Text className="text-base font-bold text-brand">{formatRupiah(total)}</Text>
      </View>
    </View>
  );
}
