/**
 * screens/admin/AdminDashboardScreen.tsx
 * ------------------------------------------------------------------
 * Halaman Dashboard Admin sederhana (khusus role admin / owner).
 * Fitur:
 *   - Ringkasan jumlah pesanan & chip filter berdasarkan status
 *   - Melihat detail pemesan, kustomisasi buket, foto referensi & bukti transfer
 *   - Mengubah status pesanan secara langsung via PATCH /api/admin/orders/:id/status:
 *     Menunggu Konfirmasi → Dalam Proses → Pesanan Siap → Selesai
 *   - Pull-to-refresh untuk memantau pesanan masuk secara real-time
 */
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect } from "@react-navigation/native";
import { Image } from "expo-image";
import React, { useCallback, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Pressable,
  RefreshControl,
  ScrollView,
  Text,
  View,
} from "react-native";

import EmptyState from "../../components/EmptyState";
import StatusBadge from "../../components/StatusBadge";
import {
  ORDER_STATUS_FLOW,
  ORDER_STATUS_META,
  getNextOrderStatus,
} from "../../constants/orderStatus";
import { fetchOrders, updateOrderStatus } from "../../services/orderService";
import { colors } from "../../theme/colors";
import { shadows } from "../../theme/shadows";
import type { Order, OrderStatus } from "../../types";
import { formatRupiah, formatTanggal } from "../../utils/format";

type StatusFilter = "semua" | OrderStatus;

export default function AdminDashboardScreen() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [filter, setFilter] = useState<StatusFilter>("semua");
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const loadOrders = useCallback(async (mode: "initial" | "refresh") => {
    if (mode === "refresh") setRefreshing(true);
    else setLoading(true);
    setError(null);
    try {
      setOrders(await fetchOrders());
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal memuat pesanan admin");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadOrders("initial");
    }, [loadOrders]),
  );

  // Hitung jumlah pesanan per status untuk ringkasan admin
  const counts = useMemo(() => {
    const map: Record<StatusFilter, number> = {
      semua: orders.length,
      menunggu_konfirmasi: 0,
      dalam_proses: 0,
      pesanan_siap: 0,
      selesai: 0,
    };
    for (const o of orders) {
      map[o.status] = (map[o.status] ?? 0) + 1;
    }
    return map;
  }, [orders]);

  const filteredOrders = useMemo(
    () => (filter === "semua" ? orders : orders.filter((o) => o.status === filter)),
    [orders, filter],
  );

  /** Kirim perubahan status ke backend dan sinkronkan daftar lokal */
  const handleChangeStatus = async (order: Order, nextStatus: OrderStatus) => {
    setUpdatingId(order.id);
    try {
      const updated = await updateOrderStatus(order.id, nextStatus);
      setOrders((prev) => prev.map((o) => (o.id === updated.id ? updated : o)));
    } catch (err) {
      Alert.alert(
        "Gagal Memperbarui Status",
        err instanceof Error ? err.message : "Terjadi kesalahan saat mengubah status.",
      );
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <View className="flex-1 bg-surface-secondary">
      {/* Bar filter status pesanan */}
      <View className="border-b border-line-subtle bg-surface py-3">
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerClassName="gap-2 px-5"
        >
          {(["semua", ...ORDER_STATUS_FLOW] as StatusFilter[]).map((key) => {
            const active = filter === key;
            const label = key === "semua" ? "Semua" : ORDER_STATUS_META[key].shortLabel;
            return (
              <Pressable
                key={key}
                onPress={() => setFilter(key)}
                className={`flex-row items-center gap-1.5 rounded-full border px-3.5 py-2 ${
                  active ? "border-brand bg-brand" : "border-line bg-surface"
                }`}
              >
                <Text className={`text-[12px] font-bold ${active ? "text-white" : "text-ink-secondary"}`}>
                  {label}
                </Text>
                <View
                  className={`rounded-full px-1.5 py-0.5 ${
                    active ? "bg-white/25" : "bg-surface-secondary"
                  }`}
                >
                  <Text className={`text-[10px] font-bold ${active ? "text-white" : "text-ink"}`}>
                    {counts[key]}
                  </Text>
                </View>
              </Pressable>
            );
          })}
        </ScrollView>
      </View>

      {loading && orders.length === 0 ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color={colors.brand} />
        </View>
      ) : (
        <FlatList
          data={filteredOrders}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ padding: 20, gap: 14, paddingBottom: 32 }}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => loadOrders("refresh")}
              tintColor={colors.brand}
              colors={[colors.brand]}
            />
          }
          ListEmptyComponent={
            <EmptyState
              emoji={error ? "📡" : "✅"}
              title={error ? "Gagal Memuat Pesanan" : "Tidak Ada Pesanan"}
              message={error ?? "Belum ada pesanan pada kategori status ini."}
              actionLabel={error ? "Coba Lagi" : undefined}
              onAction={error ? () => loadOrders("initial") : undefined}
            />
          }
          renderItem={({ item }) => (
            <AdminOrderCard
              order={item}
              updating={updatingId === item.id}
              onChangeStatus={(next) => handleChangeStatus(item, next)}
            />
          )}
        />
      )}
    </View>
  );
}

/** Kartu manajemen pesanan untuk Admin */
function AdminOrderCard({
  order,
  updating,
  onChangeStatus,
}: {
  order: Order;
  updating: boolean;
  onChangeStatus: (status: OrderStatus) => void;
}) {
  const [showDetail, setShowDetail] = useState(false);
  const nextStatus = getNextOrderStatus(order.status);
  const selectedSize = order.product.sizes.find((s) => s.id === order.customization.sizeId);
  const addonLabels = order.customization.selectedAddonIds
    .map((id) => order.product.addons.find((a) => a.id === id)?.label)
    .filter(Boolean);

  return (
    <View className="overflow-hidden rounded-card border border-line-subtle bg-surface p-4" style={shadows.card}>
      {/* Header pesanan */}
      <View className="flex-row items-start justify-between gap-2">
        <View className="flex-1 gap-1">
          <View className="flex-row items-center gap-2">
            <Text className="text-[13px] font-extrabold text-brand">{order.orderNumber}</Text>
            <Text className="text-[11px] text-ink-tertiary">• {formatTanggal(order.createdAt)}</Text>
          </View>
          <Text className="text-[15px] font-bold text-ink">{order.product.name}</Text>
          <Text className="text-[12px] text-ink-secondary">
            {order.customerName} • {order.customerPhone}
          </Text>
          <Text className="text-[14px] font-extrabold text-ink">
            {formatRupiah(order.totalPrice)}{" "}
            <Text className="text-[11px] font-normal text-ink-tertiary">
              ({order.paymentMethodLabel ?? order.paymentMethod})
            </Text>
          </Text>
        </View>
        <StatusBadge status={order.status} />
      </View>

      {/* Tombol tampil/sembunyikan detail kustomisasi & bukti bayar */}
      <Pressable
        onPress={() => setShowDetail((v) => !v)}
        className="mt-3 flex-row items-center gap-1 self-start"
      >
        <Text className="text-[12px] font-semibold text-brand">
          {showDetail ? "Sembunyikan Detail" : "Lihat Detail & Bukti Bayar"}
        </Text>
        <Ionicons
          name={showDetail ? "chevron-up" : "chevron-down"}
          size={14}
          color={colors.brand}
        />
      </Pressable>

      {showDetail && (
        <View className="mt-2.5 gap-2 rounded-xl bg-surface-secondary p-3">
          <Text className="text-[12px] text-ink-secondary">
            Ukuran: {selectedSize ? `${selectedSize.id} (${selectedSize.label})` : order.customization.sizeId}
          </Text>
          {addonLabels.length > 0 && (
            <Text className="text-[12px] text-ink-secondary">
              Tambahan: {addonLabels.join(", ")}
            </Text>
          )}
          {order.customization.description.length > 0 && (
            <Text className="text-[12px] text-ink-secondary">
              Catatan: {order.customization.description}
            </Text>
          )}
          <Text className="text-[12px] text-ink-secondary">Alamat: {order.customerAddress}</Text>

          {(order.customization.referenceImagePreview || order.paymentProofPreview) && (
            <View className="mt-1 flex-row gap-2.5">
              {order.customization.referenceImagePreview && (
                <View className="flex-1 gap-1">
                  <Text className="text-[11px] font-semibold text-ink-tertiary">Referensi</Text>
                  <Image
                    source={{ uri: order.customization.referenceImagePreview }}
                    style={{ width: "100%", height: 96, borderRadius: 10 }}
                    contentFit="cover"
                  />
                </View>
              )}
              {order.paymentProofPreview && (
                <View className="flex-1 gap-1">
                  <Text className="text-[11px] font-semibold text-ink-tertiary">Bukti Transfer</Text>
                  <Image
                    source={{ uri: order.paymentProofPreview }}
                    style={{ width: "100%", height: 96, borderRadius: 10 }}
                    contentFit="cover"
                  />
                </View>
              )}
            </View>
          )}
        </View>
      )}

      {/* Kontrol perubahan status: Menunggu → Diproses → Siap → Selesai */}
      <View className="mt-3.5 gap-2.5 border-t border-line-subtle pt-3">
        <Text className="text-[11px] font-semibold text-ink-tertiary">Ubah Status Pesanan:</Text>
        <View className="flex-row flex-wrap gap-1.5">
          {ORDER_STATUS_FLOW.map((st) => {
            const active = st === order.status;
            return (
              <Pressable
                key={st}
                disabled={updating || active}
                onPress={() => onChangeStatus(st)}
                className={`rounded-full border px-3 py-1.5 ${
                  active ? "border-brand bg-brand" : "border-line bg-surface active:opacity-75"
                }`}
              >
                <Text className={`text-[11px] font-bold ${active ? "text-white" : "text-ink-secondary"}`}>
                  {ORDER_STATUS_META[st].shortLabel}
                </Text>
              </Pressable>
            );
          })}
        </View>

        {/* Tombol aksi cepat ke tahap berikutnya */}
        {nextStatus && (
          <Pressable
            disabled={updating}
            onPress={() => onChangeStatus(nextStatus)}
            accessibilityRole="button"
            className="flex-row items-center justify-center gap-1.5 rounded-xl bg-brand py-2.5 active:opacity-85"
          >
            {updating ? (
              <ActivityIndicator size="small" color={colors.white} />
            ) : (
              <>
                <Text className="text-[13px] font-bold text-white">
                  Lanjut ke: {ORDER_STATUS_META[nextStatus].label}
                </Text>
                <Ionicons name="arrow-forward" size={15} color={colors.white} />
              </>
            )}
          </Pressable>
        )}
      </View>
    </View>
  );
}
