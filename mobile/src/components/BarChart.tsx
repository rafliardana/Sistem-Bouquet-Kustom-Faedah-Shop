// Grafik batang sederhana berbasis View (pengganti recharts di web).
// Tanpa library chart tambahan agar bundle tetap kecil dan render cepat di kedua platform.
import { Text, View } from "react-native";

export interface BarDatum {
  label: string;
  value: number;
  caption?: string; // teks di atas batang, mis. nilai yang diformat
}

export function BarChart({ data, height = 140 }: { data: BarDatum[]; height?: number }) {
  const max = Math.max(1, ...data.map((d) => d.value));
  return (
    <View className="flex-row items-end gap-2" style={{ height: height + 36 }}>
      {data.map((d) => (
        <View key={d.label} className="flex-1 items-center justify-end">
          {d.caption && (
            <Text numberOfLines={1} className="mb-1 text-[9px] text-ink-tertiary">
              {d.caption}
            </Text>
          )}
          <View className="w-full rounded-t-md bg-brand" style={{ height: Math.max(4, (d.value / max) * height) }} />
          <Text numberOfLines={1} className="mt-1 text-[10px] text-ink-secondary">
            {d.label}
          </Text>
        </View>
      ))}
    </View>
  );
}
