/**
 * screens/tracking/TrackOrderScreen.tsx
 * ------------------------------------------------------------------
 * Halaman Lacak Pesanan (Tab ke-3 Pelanggan).
 * Fitur:
 *   - Pencarian cepat berdasarkan nomor pesanan (FLR-XXXXXX) atau nama produk
 *   - Muat otomatis saat tab dibuka (useFocusEffect) + pull-to-refresh
 *   - Kartu pesanan dengan timeline progres 4 tahap:
 *     Menunggu Konfirmasi → Dalam Proses → Pesanan Siap → Selesai
 *   - Detail kustomisasi, metode pembayaran, foto referensi & bukti transfer
 */
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect } from "@react-navigation/native";
import { Image } from "expo-image";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  RefreshControl,
  Text,
  View,
} from "react-native";

import EmptyState from "../../components/EmptyState";
import SearchBar from "../../components/SearchBar";
import StatusBadge from "../../components/StatusBadge";
import { ORDER_STATUS_FLOW, ORDER_STATUS_META } from "../../constants/orderStatus";
import { useAuth } from "../../context/AuthContext";
import type { CustomerTabScreenProps } from "../../navigation/types";
import { fetchOrders } from "../../services/orderService";
import { colors } from "../../theme/colors";
import { shadows } from "../../theme/shadows";
import type { Order } from "../../types";
import { formatRupiah, formatTanggal } from "../../utils/format";

export default function TrackOrderScreen({
  route,
  navigation,
}: CustomerTabScreenProps<"LacakPesanan">) {
  const { user } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [searchCode, setSearchCode] = useState(route.params?.orderNumber ?? "");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Jika datang dari Checkout, otomatis isi kolom pencarian dengan nomor FLR-XXXXXX baru
  useEffect(() => {
    if (route.params?.orderNumber) {
      setSearchCode(route.params.orderNumber);
    }
  }, [route.params?.orderNumber]);

  const loadOrders = useCallback(
    async (mode: "initial" | "refresh") => {
      if (!user) return;
      if (mode === "refresh") setRefreshing(true);
      else setLoading(true);
      setError(null);
      try {
        const list = await fetchOrders();
        setOrders(list);
        // Buka otomatis kartu pesanan terbaru atau yang dicari dari Checkout
        if (route.params?.orderNumber) {
          const found = list.find((o) => o.orderNumber === route.params?.orderNumber);
          if (found) setExpandedId(found.id);
        } else if (list[0] && !expandedId) {
          setExpandedId(list[0].id);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Gagal memuat daftar pesanan");
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [user, route.params?.orderNumber],
  );

  // Muat ulang setiap kali pengguna membuka tab Lacak Pesanan
  useFocusEffect(
    useCallback(() => {
      if (user) loadOrders("initial");
    }, [user, loadOrders]),
  );

  // Filter berdasarkan kode pesanan FLR-XXXXXX atau nama buket
  const filteredOrders = useMemo(() => {
    const q = searchCode.trim().toLowerCase();
    if (!q) return orders;
    return orders.filter(
      (o) =>
        o.orderNumber.toLowerCase().includes(q) ||
        o.product.name.toLowerCase().includes(q),
    );
  }, [orders, searchCode]);

  if (!user) {
    return (
      <View className="flex-1 justify-center bg-surface-secondary p-5">
        <EmptyState
          emoji="🔐"
          title="Masuk untuk Melacak Pesanan"
          message="Login dengan akun pelanggan Anda untuk melihat status pengerjaan buket (FLR-XXXXXX)."
          actionLabel="Masuk / Daftar"
          onAction={() => navigation.navigate("Profil")}
        />
      </View>
    );
  }

  return (
    <View className="flex-1 bg-surface-secondary">
      {/* Pencarian Nomor Pesanan FLR-XXXXXX */}
      <View className="bg-surface px-5 pb-3 pt-3">
        <SearchBar
          value={searchCode}
          onChangeText={setSearchCode}
          placeholder="Cari nomor pesanan (mis. FLR-123456)..."
        />
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
              emoji={error ? "📡" : "📦"}
              title={error ? "Gagal Memuat Pesanan" : "Belum Ada Pesanan"}
              message={
                error ??
                (searchCode
                  ? `Nomor pesanan "${searchCode}" tidak ditemukan.`
                  : "Yuk mulai pesan buket kustom pertamamu di tab Katalog!")
              }
              actionLabel={error ? "Coba Lagi" : searchCode ? "Reset Pencarian" : "Lihat Katalog"}
              onAction={
                error
                  ? () => loadOrders("initial")
                  : searchCode
                    ? () => setSearchCode("")
                    : () => navigation.navigate("Katalog")
              }
            />
          }
          renderItem={({ item }) => (
            <OrderTrackCard
              order={item}
              expanded={expandedId === item.id}
              onToggle={() => setExpandedId((prev) => (prev === item.id ? null : item.id))}
            />
          )}
        />
      )}
    </View>
  );
}

/** Kartu detail pesanan + timeline progres 4 tahap */
function OrderTrackCard({
  order,
  expanded,
  onToggle,
}: {
  order: Order;
  expanded: boolean;
  onToggle: () => void;
}) {
  const currentStepIdx = ORDER_STATUS_FLOW.indexOf(order.status);
  const selectedSize = order.product.sizes.find((s) => s.id === order.customization.sizeId);
  const addonLabels = order.customization.selectedAddonIds
    .map((id) => order.product.addons.find((a) => a.id === id)?.label)
    .filter(Boolean);

  return (
    <View className="overflow-hidden rounded-card border border-line-subtle bg-surface" style={shadows.card}>
      {/* Ringkasan kartu (tap untuk buka/tutup detail) */}
      <Pressable onPress={onToggle} className="flex-row items-start gap-3 p-4 active:opacity-80">
        <Image
          source={{ uri: order.product.image }}
          style={{ width: 60, height: 60, borderRadius: 12 }}
          contentFit="cover"
          cachePolicy="memory-disk"
        />
        <View className="flex-1 gap-1">
          <View className="flex-row items-center justify-between gap-2">
            <Text className="flex-1 text-[15px] font-bold text-ink" numberOfLines={1}>
              {order.product.name}
            </Text>
            <Ionicons
              name={expanded ? "chevron-up" : "chevron-down"}
              size={18}
              color={colors.textTertiary}
            />
          </View>
          <StatusBadge status={order.status} />
          <Text className="text-[11px] text-ink-tertiary">
            {order.orderNumber} • {formatTanggal(order.createdAt)}
          </Text>
          <Text className="text-[14px] font-extrabold text-brand">
            {formatRupiah(order.totalPrice)}
          </Text>
        </View>
      </Pressable>

      {/* Detail & Timeline Progres */}
      {expanded && (
        <View className="gap-4 border-t border-line-subtle px-4 pb-4 pt-3">
          {/* Timeline 4 Tahap */}
          <View className="gap-2.5">
            <Text className="text-[13px] font-bold text-ink">Progres Pesanan</Text>
            {ORDER_STATUS_FLOW.map((statusId, index) => {
              const meta = ORDER_STATUS_META[statusId];
              const isDone = index <= currentStepIdx;
              const isCurrent = index === currentStepIdx;
              return (
                <View key={statusId} className="flex-row items-start gap-3">
                  <View className="items-center">
                    <View
                      className="h-6 w-6 items-center justify-center rounded-full"
                      style={{
                        backgroundColor: isDone ? colors.brand : colors.surfaceSecondary,
                      }}
                    >
                      <Ionicons
                        name={isDone ? "checkmark" : meta.icon}
                        size={13}
                        color={isDone ? colors.white : colors.textTertiary}
                      />
                    </View>
                    {index < ORDER_STATUS_FLOW.length - 1 && (
                      <View
                        className="mt-0.5 h-5 w-0.5"
                        style={{
                          backgroundColor: index < currentStepIdx ? colors.brand : colors.border,
                        }}
                      />
                    )}
                  </View>
                  <View className="flex-1 pb-1">
                    <Text
                      className={`text-[13px] ${
                        isCurrent
                          ? "font-bold text-brand"
                          : isDone
                            ? "font-semibold text-ink"
                            : "text-ink-tertiary"
                      }`}
                    >
                      {meta.label}
                    </Text>
                    {isCurrent && (
                      <Text className="mt-0.5 text-[11px] leading-4 text-ink-secondary">
                        {meta.description}
                      </Text>
                    )}
                  </View>
                </View>
              );
            })}
          </View>

          {/* Rincian Kustomisasi & Pengiriman */}
          <View className="gap-1.5 rounded-xl bg-surface-secondary p-3">
            <Text className="text-[12px] font-bold text-ink">Detail Kustomisasi</Text>
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
            <Text className="text-[12px] text-ink-secondary">
              Pembayaran: {order.paymentMethodLabel ?? order.paymentMethod}
            </Text>
            <Text className="text-[12px] text-ink-secondary">
              Penerima: {order.customerName} ({order.customerPhone})
            </Text>
            <Text className="text-[12px] text-ink-secondary">Alamat: {order.customerAddress}</Text>
          </View>

          {/* Lampiran Foto Referensi & Bukti Transfer */}
          {(order.customization.referenceImagePreview || order.paymentProofPreview) && (
            <View className="flex-row gap-3">
              {order.customization.referenceImagePreview && (
                <View className="flex-1 gap-1">
                  <Text className="text-[11px] font-semibold text-ink-secondary">Foto Referensi</Text>
                  <Image
                    source={{ uri: order.customization.referenceImagePreview }}
                    style={{ width: "100%", height: 100, borderRadius: 10 }}
                    contentFit="cover"
                  />
                </View>
              )}
              {order.paymentProofPreview && (
                <View className="flex-1 gap-1">
                  <Text className="text-[11px] font-semibold text-ink-secondary">Bukti Transfer</Text>
                  <Image
                    source={{ uri: order.paymentProofPreview }}
                    style={{ width: "100%", height: 100, borderRadius: 10 }}
                    contentFit="cover"
                  />
                </View>
              )}
            </View>
          )}
        </View>
      )}
    </View>
  );
}
