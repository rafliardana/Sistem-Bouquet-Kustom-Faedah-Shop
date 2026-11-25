// Layar Dashboard Admin/Owner (pengganti AdminDashboard.tsx web).
// - Owner: data dari GET /api/admin/stats (dihitung server).
// - Admin: endpoint stats khusus owner, jadi statistik dihitung dari GET /api/orders.
// Menampilkan kartu ringkasan, grafik pendapatan 7 hari terakhir, jumlah per status, dan produk terlaris.
import { useCallback, useState } from "react";
import { RefreshControl, ScrollView, Text, View } from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { Screen } from "@/components/ui/Screen";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { ErrorView, LoadingView } from "@/components/ui/StateViews";
import { StatCard } from "@/components/StatCard";
import { BarChart } from "@/components/BarChart";
import { useAuth } from "@/context/AuthContext";
import { getStats, listOrders } from "@/api/services";
import { computeStats, shortRupiah } from "@/utils/stats";
import { formatRupiah } from "@/utils/format";
import { STATUS_FLOW, STATUS_META } from "@/utils/orderStatus";
import { colors } from "@/theme/colors";
import type { SalesStats } from "@/types";

export function AdminDashboardScreen() {
  const { user } = useAuth();
  const [stats, setStats] = useState<SalesStats | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    try {
      const data = user?.role === "owner" ? await getStats() : computeStats(await listOrders());
      setStats(data);
      setError(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Gagal memuat statistik");
    }
  }, [user?.role]);

  // Muat ulang setiap kali tab Dashboard dibuka agar angka selalu terbaru.
  useFocusEffect(
    useCallback(() => {
      load();
    }, [load]),
  );

  const onRefresh = async () => {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  };

  if (!stats && error) return <ErrorView message={error} onRetry={load} />;
  if (!stats) return <LoadingView message="Memuat statistik..." />;

  const last7 = stats.revenueByDay.slice(-7).map((d) => ({
    label: `${Number(d.date.slice(8, 10))}/${Number(d.date.slice(5, 7))}`,
    value: d.revenue,
    caption: shortRupiah(d.revenue),
  }));
  const maxTop = Math.max(1, ...stats.topProducts.map((p) => p.count));

  return (
    <Screen>
      <ScrollView
        contentContainerStyle={{ padding: 16, gap: 16 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.brand} colors={[colors.brand]} />}
      >
        <View>
          <Text className="text-2xl font-bold text-ink">Dashboard</Text>
          <Text className="mt-1 text-sm text-ink-secondary">Ringkasan penjualan Faedah Shop</Text>
        </View>

        <View className="flex-row gap-3">
          <StatCard icon="bag-handle-outline" label="Total Pesanan" value={String(stats.totalOrders)} accent />
          <StatCard icon="wallet-outline" label="Total Pendapatan" value={formatRupiah(stats.totalRevenue)} />
        </View>
        <View className="flex-row gap-3">
          <StatCard icon="checkmark-done-outline" label="Selesai" value={String(stats.statusCounts.selesai ?? 0)} />
          <StatCard icon="time-outline" label="Menunggu Konfirmasi" value={String(stats.statusCounts.menunggu_konfirmasi ?? 0)} />
        </View>

        <Card title="Pendapatan Harian" subtitle="7 hari terakhir yang memiliki transaksi">
          {last7.length ? <BarChart data={last7} /> : <Text className="py-8 text-center text-sm text-ink-tertiary">Belum ada data pendapatan.</Text>}
        </Card>

        <Card title="Status Pesanan">
          {STATUS_FLOW.map((s) => (
            <View key={s} className="mb-2 flex-row items-center justify-between">
              <Badge label={STATUS_META[s].label} variant={STATUS_META[s].variant} />
              <Text className="text-base font-bold text-ink">{stats.statusCounts[s] ?? 0}</Text>
            </View>
          ))}
        </Card>

        <Card title="Produk Terlaris">
          {stats.topProducts.length === 0 && <Text className="py-4 text-center text-sm text-ink-tertiary">Belum ada penjualan.</Text>}
          {stats.topProducts.map((p, i) => (
            <View key={p.name} className="mb-3">
              <View className="mb-1 flex-row justify-between">
                <Text className="flex-1 pr-2 text-sm text-ink" numberOfLines={1}>
                  {i + 1}. {p.name}
                </Text>
                <Text className="text-sm font-semibold text-ink-secondary">{p.count} pesanan</Text>
              </View>
              <View className="h-2 overflow-hidden rounded-full bg-surface-secondary">
                <View className="h-2 rounded-full bg-brand" style={{ width: `${(p.count / maxTop) * 100}%` }} />
              </View>
            </View>
          ))}
        </Card>
      </ScrollView>
    </Screen>
  );
}
