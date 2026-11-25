/**
 * components/StatusBadge.tsx
 * ------------------------------------------------------------------
 * Lencana warna status pesanan (Menunggu / Diproses / Siap / Selesai)
 * agar konsisten antara halaman Lacak Pesanan & Dashboard Admin.
 */
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { Text, View } from "react-native";

import { ORDER_STATUS_META } from "../constants/orderStatus";
import type { OrderStatus } from "../types";

export default function StatusBadge({ status }: { status: OrderStatus }) {
  const meta = ORDER_STATUS_META[status];
  return (
    <View
      className="flex-row items-center gap-1 self-start rounded-full px-2.5 py-1"
      style={{ backgroundColor: meta.bg }}
    >
      <Ionicons name={meta.icon} size={12} color={meta.fg} />
      <Text className="text-[11px] font-bold" style={{ color: meta.fg }}>
        {meta.label}
      </Text>
    </View>
  );
}
