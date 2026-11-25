// Layar "Pesanan Saya": pelacak pesanan FLR-XXXXXX (pengganti MyOrdersPage + OrderTracker web).
// Status diperbarui otomatis setiap 10 detik (usePolling) selama layar dibuka,
// sehingga perubahan status oleh admin langsung terlihat customer.
import { useCallback, useMemo, useState } from "react";
import { FlatList, RefreshControl, Text, TextInput, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import type { BottomTabScreenProps } from "@react-navigation/bottom-tabs";
import { Screen } from "@/components/ui/Screen";
import { EmptyState, LoadingView } from "@/components/ui/StateViews";
import { OrderCard } from "@/components/OrderCard";
import { useAuth } from "@/context/AuthContext";
import { usePolling } from "@/hooks/usePolling";
import { listOrders } from "@/api/services";
import { colors } from "@/theme/colors";
import type { CustomerTabParamList } from "@/navigation/types";
import type { Order } from "@/types";

type Props = BottomTabScreenProps<CustomerTabParamList, "PesananTab">;

export function MyOrdersScreen({ route, navigation }: Props) {
  const { user } = useAuth();
  const [orders, setOrders] = useState<Order[] | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const newOrderId = route.params?.newOrderId;

  const fetchOrders = useCallback(async () => {
    if (!user) return;
    try {
      setOrders(await listOrders());
      setError(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Gagal memuat pesanan");
    }
  }, [user]);

  usePolling(fetchOrders, 10000);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchOrders();
    setRefreshing(false);
  };

  // Cari berdasarkan nomor pesanan (FLR-XXXXXX) atau nama produk.
  const filtered = useMemo(() => {
    const q = query.trim().toUpperCase();
    if (!orders || !q) return orders ?? [];
    return orders.filter((o) => o.orderNumber.toUpperCase().includes(q) || o.product.name.toUpperCase().includes(q));
  }, [orders, query]);

  if (!user) {
    return (
      <Screen>
        <EmptyState
          icon="receipt-outline"
          title="Masuk untuk melihat pesanan"
          message="Lacak status buketmu secara real-time setelah login."
          actionLabel="Masuk"
          onAction={() => navigation.getParent()?.navigate("Login")}
        />
      </Screen>
    );
  }
  if (!orders && !error) return <LoadingView message="Memuat pesanan..." />;

  return (
    <Screen>
      <FlatList
        data={filtered}
        keyExtractor={(o) => o.id}
        contentContainerStyle={{ padding: 16, gap: 12, flexGrow: 1 }}
        ListHeaderComponent={
          <View className="pb-1">
            <Text className="text-2xl font-bold text-ink">Pesanan Saya</Text>
            <View className="mt-1 flex-row items-center">
              <View className="mr-1.5 h-2 w-2 rounded-full bg-success" />
              <Text className="text-xs text-ink-tertiary">Status diperbarui otomatis</Text>
            </View>
            <View className="mt-3 h-11 flex-row items-center rounded-xl border border-line bg-surface px-3">
              <Ionicons name="search" size={16} color={colors.inkTertiary} />
              <TextInput
                value={query}
                onChangeText={setQuery}
                placeholder="Cari nomor pesanan (FLR-...)"
                placeholderTextColor={colors.inkTertiary}
                autoCapitalize="characters"
                className="ml-2 flex-1 text-sm text-ink"
              />
            </View>
            {error && <Text className="mt-2 text-xs text-danger">{error}</Text>}
          </View>
        }
        renderItem={({ item }) => <OrderCard order={item} highlighted={item.id === newOrderId} />}
        ListEmptyComponent={
          <EmptyState
            icon="receipt-outline"
            title={query ? "Pesanan tidak ditemukan" : "Belum ada pesanan"}
            message={query ? "Periksa kembali nomor pesanan." : "Yuk, pilih bouquet pertamamu di katalog!"}
            actionLabel={query ? undefined : "Lihat Katalog"}
            onAction={() => navigation.navigate("KatalogTab", { screen: "Catalog" })}
          />
        }
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.brand} colors={[colors.brand]} />}
      />
    </Screen>
  );
}
