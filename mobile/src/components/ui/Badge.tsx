// Label kecil berwarna untuk kategori produk dan status pesanan.
import { Text, View } from "react-native";

export type BadgeVariant = "default" | "brand" | "success" | "warning" | "danger";

const STYLES: Record<BadgeVariant, { box: string; text: string }> = {
  default: { box: "bg-surface-secondary", text: "text-ink-secondary" },
  brand: { box: "bg-brand-tertiary", text: "text-brand-dark" },
  success: { box: "bg-success-soft", text: "text-success" },
  warning: { box: "bg-warning-soft", text: "text-warning" },
  danger: { box: "bg-danger-soft", text: "text-danger" },
};

export function Badge({ label, variant = "default" }: { label: string; variant?: BadgeVariant }) {
  const s = STYLES[variant];
  return (
    <View className={`self-start rounded-full px-2.5 py-1 ${s.box}`}>
      <Text className={`text-xs font-semibold ${s.text}`}>{label}</Text>
    </View>
  );
}
