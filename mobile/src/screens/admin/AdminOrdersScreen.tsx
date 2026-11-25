// Layar Manajemen Pesanan Admin (pengganti AdminOrders.tsx web).
// - Filter berdasarkan status (chip horizontal) dan pencarian nomor FLR / nama pelanggan.
// - Tombol "Ubah ke ..." memajukan status: Menunggu -> Diproses -> Siap -> Selesai
//   via PATCH /api/admin/orders/:id/status, dengan konfirmasi sebelum dikirim.
// - Daftar diperbarui otomatis setiap 15 detik selama layar aktif (pesanan baru langsung muncul).
import { useCallback, useMemo, useState } from "react";
import { Alert, FlatList, RefreshControl, ScrollView, Text, TextInput, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Screen } from "@/components/ui/Screen";
import { Chip } from "@/components/ui/Chip";
import { Button } from "@/components/ui/Button";
import { EmptyState, LoadingView } from "@/components/ui/StateViews";
import { OrderCard } from "@/components/OrderCard";
import { usePolling } from "@/hooks/usePolling";
import { listOrders, updateOrderStatus } from "@/api/services";
import { STATUS_FLOW, STATUS_META, nextStatus } from "@/utils/orderStatus";
import { colors } from "@/theme/colors";
import type { Order, OrderStatus } from "@/types";

type Filter = OrderStatus | "semua";

export function AdminOrdersScreen() {
  const [orders, setOrders] = useState<Order[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<Filter>("semua");
  const [query, setQuery] = useState("");
  const [refreshing, setRefreshing] = useState(false);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const fetchOrders = useCallback(async () => {
    try {
      setOrders(await listOrders());
      setError(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Gagal memuat pesanan");
    }
  }, []);

  usePolling(fetchOrders, 15000);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchOrders();
    setRefreshing(false);
  };

  // Jumlah pesanan per status untuk label chip, mis. "Menunggu (3)".
  const counts = useMemo(() => {
    const c: Record<Filter, number> = { semua: 0, menunggu_konfirmasi: 0, dalam_proses: 0, pesanan_siap: 0, selesai: 0 };
    for (const o of orders ?? []) {
      c[o.status] += 1;
      c.semua += 1;
    }
    return c;
  }, [orders]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return (orders ?? []).filter(
      (o) =>
        (filter === "semua" || o.status === filter) &&
        (!q || o.orderNumber.toLowerCase().includes(q) || o.customerName.toLowerCase().includes(q)),
    );
  }, [orders, filter, query]);

  const advance = useCallback((order: Order) => {
    const next = nextStatus(order.status);
    if (!next) return;
    Alert.alert("Ubah Status", `Ubah ${order.orderNumber} menjadi "${STATUS_META[next].label}"?`, [
      { text: "Batal", style: "cancel" },
      {
        text: "Ubah",
        onPress: async () => {
          setUpdatingId(order.id);
          try {
            const updated = await updateOrderStatus(order.id, next);
            // Ganti item yang berubah saja, tanpa memuat ulang seluruh daftar.
            setOrders((prev) => prev?.map((o) => (o.id === updated.id ? updated : o)) ?? null);
          } catch (e) {
            Alert.alert("Gagal", e instanceof Error ? e.message : "Status tidak dapat diubah");
          } finally {
            setUpdatingId(null);
          }
        },
      },
    ]);
  }, []);

  if (!orders && !error) return <LoadingView message="Memuat pesanan..." />;

  const filters: Filter[] = ["semua", ...STATUS_FLOW];

  return (
    <Screen>
      <FlatList
        data={filtered}
        keyExtractor={(o) => o.id}
        contentContainerStyle={{ padding: 16, gap: 12, flexGrow: 1 }}
        ListHeaderComponent={
          <View>
            <Text className="text-2xl font-bold text-ink">Kelola Pesanan</Text>
            <View className="mt-3 h-11 flex-row items-center rounded-xl border border-line bg-surface px-3">
              <Ionicons name="search" size={16} color={colors.inkTertiary} />
              <TextInput
                value={query}
                onChangeText={setQuery}
                placeholder="Cari nomor FLR atau nama pelanggan"
                placeholderTextColor={colors.inkTertiary}
                className="ml-2 flex-1 text-sm text-ink"
              />
            </View>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mt-3" contentContainerStyle={{ paddingVertical: 4 }}>
              {filters.map((f) => (
                <Chip
                  key={f}
                  label={`${f === "semua" ? "Semua" : STATUS_META[f].short} (${counts[f]})`}
                  active={f === filter}
                  onPress={() => setFilter(f)}
                />
              ))}
            </ScrollView>
            {error && <Text className="mt-2 text-xs text-danger">{error}</Text>}
          </View>
        }
        renderItem={({ item }) => {
          const next = nextStatus(item.status);
          return (
            <OrderCard
              order={item}
              footer={
                next ? (
                  <Button
                    label={`Ubah ke "${STATUS_META[next].label}"`}
                    icon="arrow-forward-circle-outline"
                    loading={updatingId === item.id}
                    onPress={() => advance(item)}
                  />
                ) : (
                  <Text className="text-center text-xs text-success">✓ Pesanan sudah selesai</Text>
                )
              }
            />
          );
        }}
        ListEmptyComponent={<EmptyState icon="file-tray-outline" title="Tidak ada pesanan" message="Belum ada pesanan pada filter ini." />}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.brand} colors={[colors.brand]} />}
        keyboardShouldPersistTaps="handled"
        initialNumToRender={8}
        windowSize={7}
      />
    </Screen>
  );
}
