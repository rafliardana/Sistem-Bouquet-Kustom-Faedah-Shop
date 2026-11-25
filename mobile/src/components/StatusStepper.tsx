// Garis waktu status pesanan vertikal (Menunggu -> Diproses -> Siap -> Selesai).
// Langkah yang sudah lewat berwarna brand, langkah saat ini diberi deskripsi.
import type { ComponentProps } from "react";
import { Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { colors } from "@/theme/colors";
import { STATUS_FLOW, STATUS_META, statusIndex } from "@/utils/orderStatus";
import type { OrderStatus } from "@/types";

type IconName = ComponentProps<typeof Ionicons>["name"];

export function StatusStepper({ status }: { status: OrderStatus }) {
  const current = statusIndex(status);
  return (
    <View>
      {STATUS_FLOW.map((step, i) => {
        const done = i <= current;
        const meta = STATUS_META[step];
        const isLast = i === STATUS_FLOW.length - 1;
        return (
          <View key={step} className="flex-row">
            <View className="items-center">
              <View
                className={`h-8 w-8 items-center justify-center rounded-full ${done ? "bg-brand" : "bg-surface-secondary"}`}
              >
                <Ionicons name={meta.icon as IconName} size={16} color={done ? "#fff" : colors.inkTertiary} />
              </View>
              {!isLast && <View className={`w-0.5 flex-1 ${i < current ? "bg-brand" : "bg-line"}`} style={{ minHeight: 18 }} />}
            </View>
            <View className="ml-3 flex-1 pb-4">
              <Text className={`text-sm font-semibold ${done ? "text-ink" : "text-ink-tertiary"}`}>{meta.label}</Text>
              {i === current && <Text className="mt-0.5 text-xs text-ink-secondary">{meta.description}</Text>}
            </View>
          </View>
        );
      })}
    </View>
  );
}
