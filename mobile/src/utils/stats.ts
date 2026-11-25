// Menghitung statistik dari daftar pesanan di sisi aplikasi.
// Dipakai bila akun ber-role "admin": endpoint /api/admin/stats khusus owner (403 untuk admin),
// sehingga admin tetap mendapat ringkasan dari GET /api/orders. Logika sama dengan server.
import type { Order, SalesStats } from "@/types";

export function computeStats(orders: Order[]): SalesStats {
  const statusCounts: SalesStats["statusCounts"] = {
    menunggu_konfirmasi: 0, dalam_proses: 0, pesanan_siap: 0, selesai: 0,
  };
  const dayMap: Record<string, { revenue: number; orders: number }> = {};
  const productMap: Record<string, number> = {};
  let totalRevenue = 0;

  for (const o of orders) {
    statusCounts[o.status] += 1;
    totalRevenue += o.totalPrice;
    const day = new Date(o.createdAt).toISOString().slice(0, 10);
    dayMap[day] = dayMap[day] ?? { revenue: 0, orders: 0 };
    dayMap[day].revenue += o.totalPrice;
    dayMap[day].orders += 1;
    const name = o.product?.name ?? "Lainnya";
    productMap[name] = (productMap[name] ?? 0) + 1;
  }

  return {
    totalOrders: orders.length,
    totalRevenue,
    statusCounts,
    revenueByDay: Object.entries(dayMap)
      .map(([date, v]) => ({ date, ...v }))
      .sort((a, b) => (a.date < b.date ? -1 : 1)),
    topProducts: Object.entries(productMap)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5),
  };
}

// Ringkas angka besar untuk label grafik: 1.250.000 -> "1,3 jt".
export function shortRupiah(value: number): string {
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1).replace(".", ",")} jt`;
  if (value >= 1_000) return `${Math.round(value / 1_000)} rb`;
  return String(value);
}
