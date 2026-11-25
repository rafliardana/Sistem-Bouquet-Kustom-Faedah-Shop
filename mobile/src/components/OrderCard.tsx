// Kartu ringkasan pesanan yang bisa dibuka-tutup (pengganti OrderCard di OrderTracker.tsx web).
// Dipakai di "Pesanan Saya" (customer). Bagian bawah dapat diisi aksi tambahan lewat prop `footer`.
import { memo, useState, type ReactNode } from "react";
import { Pressable, Text, View } from "react-native";
import { Image } from "expo-image";
import { Ionicons } from "@expo/vector-icons";
import { Badge } from "./ui/Badge";
import { StatusStepper } from "./StatusStepper";
import { colors } from "@/theme/colors";
import { formatRupiah, formatTanggal } from "@/utils/format";
import { STATUS_META } from "@/utils/orderStatus";
import type { Order } from "@/types";

interface OrderCardProps {
  order: Order;
  highlighted?: boolean; // pesanan yang baru saja dibuat
  footer?: ReactNode;
}

function InfoRow({ icon, text }: { icon: keyof typeof Ionicons.glyphMap; text: string }) {
  return (
    <View className="mb-1.5 flex-row items-start">
      <Ionicons name={icon} size={14} color={colors.inkTertiary} style={{ marginTop: 2 }} />
      <Text className="ml-2 flex-1 text-xs text-ink-secondary">{text}</Text>
    </View>
  );
}

function OrderCardBase({ order, highlighted, footer }: OrderCardProps) {
  const [expanded, setExpanded] = useState(!!highlighted);
  const meta = STATUS_META[order.status];
  const size = order.product.sizes.find((s) => s.id === order.customization.sizeId);
  const addons = order.product.addons.filter((a) => order.customization.selectedAddonIds.includes(a.id));

  return (
    <View className={`overflow-hidden rounded-2xl bg-surface ${highlighted ? "border-2 border-brand" : "border border-line"}`}>
      {highlighted && (
        <View className="bg-brand px-4 py-2">
          <Text className="text-center text-xs font-semibold text-white">
            🎉 Pesanan berhasil dibuat! Tim kami akan segera menghubungimu.
          </Text>
        </View>
      )}

      <Pressable onPress={() => setExpanded((v) => !v)} className="flex-row p-4 active:opacity-80">
        <Image
          source={{ uri: order.product.image }}
          style={{ width: 60, height: 60, borderRadius: 12 }}
          contentFit="cover"
          cachePolicy="memory-disk"
        />
        <View className="ml-3 flex-1 gap-1">
          <Text className="text-sm font-bold text-ink" numberOfLines={1}>
            {order.product.name}
          </Text>
          <Text className="text-xs text-ink-tertiary">
            {order.orderNumber} • {formatTanggal(order.createdAt)}
          </Text>
          <View className="flex-row items-center justify-between">
            <Badge label={meta.label} variant={meta.variant} />
            <Text className="text-sm font-bold text-brand">{formatRupiah(order.totalPrice)}</Text>
          </View>
        </View>
        <Ionicons
          name={expanded ? "chevron-up" : "chevron-down"}
          size={18}
          color={colors.inkTertiary}
          style={{ marginLeft: 8, alignSelf: "center" }}
        />
      </Pressable>

      {expanded && (
        <View className="border-t border-line px-4 pb-4 pt-4">
          <StatusStepper status={order.status} />

          <Text className="mb-2 mt-1 text-xs font-bold uppercase text-ink-tertiary">Detail Pesanan</Text>
          <InfoRow icon="resize-outline" text={`Ukuran: ${size ? `${size.label} (${size.stems})` : order.customization.sizeId}`} />
          {addons.length > 0 && <InfoRow icon="gift-outline" text={`Tambahan: ${addons.map((a) => a.label).join(", ")}`} />}
          {!!order.customization.description && <InfoRow icon="create-outline" text={order.customization.description} />}
          <InfoRow icon="person-outline" text={order.customerName} />
          <InfoRow icon="call-outline" text={order.customerPhone} />
          <InfoRow icon="location-outline" text={order.customerAddress} />
          <InfoRow icon="card-outline" text={order.paymentMethodLabel ?? order.paymentMethod} />

          {(order.customization.referenceImagePreview || order.paymentProofPreview) && (
            <View className="mt-2 flex-row gap-3">
              {order.customization.referenceImagePreview && (
                <View className="flex-1">
                  <Text className="mb-1 text-xs text-ink-tertiary">Referensi</Text>
                  <Image source={{ uri: order.customization.referenceImagePreview }} style={{ width: "100%", height: 110, borderRadius: 10 }} contentFit="cover" cachePolicy="memory-disk" />
                </View>
              )}
              {order.paymentProofPreview && (
                <View className="flex-1">
                  <Text className="mb-1 text-xs text-ink-tertiary">Bukti pembayaran</Text>
                  <Image source={{ uri: order.paymentProofPreview }} style={{ width: "100%", height: 110, borderRadius: 10 }} contentFit="cover" cachePolicy="memory-disk" />
                </View>
              )}
            </View>
          )}
          {footer && <View className="mt-4">{footer}</View>}
        </View>
      )}
    </View>
  );
}

export const OrderCard = memo(OrderCardBase);
