import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Cell,
} from "recharts";
import { Loading } from "../../pages/Loading";
import { useAuth } from "../../lib/auth";
import { getStats } from "../../lib/api";
import { ShoppingBag, Wallet, CheckCircle2, Clock } from "lucide-react";
import type { SalesStats, OrderStatus } from "../types";

const STATUS_LABELS: Record<OrderStatus, string> = {
  menunggu_konfirmasi: "Menunggu",
  dalam_proses: "Diproses",
  pesanan_siap: "Siap",
  selesai: "Selesai",
};

function StatCard({ icon, label, value, accent }: { icon: React.ReactNode; label: string; value: string; accent?: boolean }) {
  return (
    <div className="bg-surface-bg rounded-corner-lg border border-border-primary p-4 flex items-center gap-3">
      <div className={`w-11 h-11 rounded-corner-md flex items-center justify-center flex-shrink-0 ${accent ? "bg-brand-primary text-on-brand" : "bg-bg-faint text-text-secondary"}`}>
        {icon}
      </div>
      <div className="min-w-0">
        <p className="text-video-title text-text-tertiary">{label}</p>
        <p className="text-heading text-text-primary truncate">{value}</p>
      </div>
    </div>
  );
}

function ChartCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-surface-bg rounded-corner-lg border border-border-primary p-4">
      <h3 className="text-label font-semibold text-text-primary mb-3">{title}</h3>
      {children}
    </div>
  );
}

export function AdminDashboard() {
  const { profile, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState<SalesStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && profile?.role !== "owner") {
      navigate("/admin/orders", { replace: true });
    }
  }, [authLoading, profile, navigate]);

  useEffect(() => {
    if (authLoading || profile?.role !== "owner") return;
    let active = true;
    getStats()
      .then((s) => active && setStats(s))
      .catch((e) => {
        console.error("Failed to load stats:", e);
        if (active) setError(e instanceof Error ? e.message : "Gagal memuat statistik");
      })
      .finally(() => active && setLoading(false));
    return () => { active = false; };
  }, [authLoading, profile]);

  if (authLoading || loading) return <Loading label="Memuat statistik…" />;
  if (error || !stats) {
    return (
      <div className="p-6 max-w-5xl mx-auto">
        <h1 className="text-title text-text-primary mb-2">Dashboard</h1>
        <p className="text-label-sm text-[var(--status-danger)]">{error ?? "Statistik tidak tersedia"}</p>
      </div>
    );
  }

  const revenueData = stats.revenueByDay.map((d) => ({
    ...d,
    label: new Date(d.date).toLocaleDateString("id-ID", { day: "numeric", month: "short" }),
  }));
  const statusData = (Object.keys(STATUS_LABELS) as OrderStatus[]).map((s) => ({
    name: STATUS_LABELS[s],
    value: stats.statusCounts[s] ?? 0,
  }));
  const statusColors = ["var(--status-warning)", "var(--brand-primary)", "var(--status-success)", "var(--text-tertiary)"];

  return (
    <div className="p-6 max-w-5xl mx-auto flex flex-col gap-4">
      <div>
        <h1 className="text-title text-text-primary">Dashboard</h1>
        <p className="text-label-sm text-text-secondary mt-1">Ringkasan penjualan Faedah Shop</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard icon={<ShoppingBag size={20} />} label="Total Pesanan" value={String(stats.totalOrders)} accent />
        <StatCard icon={<Wallet size={20} />} label="Total Pendapatan" value={`Rp ${stats.totalRevenue.toLocaleString("id-ID")}`} />
        <StatCard icon={<CheckCircle2 size={20} />} label="Selesai" value={String(stats.statusCounts.selesai ?? 0)} />
        <StatCard icon={<Clock size={20} />} label="Menunggu Konfirmasi" value={String(stats.statusCounts.menunggu_konfirmasi ?? 0)} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
        <div className="lg:col-span-2">
          <ChartCard title="Pendapatan Harian">
            {revenueData.length === 0 ? (
              <p className="text-label-sm text-text-tertiary py-12 text-center">Belum ada data pendapatan.</p>
            ) : (
              <ResponsiveContainer width="100%" height={260}>
                <AreaChart data={revenueData} margin={{ top: 8, right: 8, left: 8, bottom: 0 }}>
                  <defs>
                    <linearGradient id="rev" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="var(--brand-primary)" stopOpacity={0.35} />
                      <stop offset="100%" stopColor="var(--brand-primary)" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border-secondary)" vertical={false} />
                  <XAxis dataKey="label" tick={{ fontSize: 11, fill: "var(--text-tertiary)" }} stroke="var(--border-primary)" />
                  <YAxis tick={{ fontSize: 11, fill: "var(--text-tertiary)" }} stroke="var(--border-primary)" tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} width={40} />
                  <Tooltip
                    formatter={(v: number) => [`Rp ${v.toLocaleString("id-ID")}`, "Pendapatan"]}
                    contentStyle={{ background: "var(--surface-bg)", border: "1px solid var(--border-primary)", borderRadius: 8, fontSize: 12 }}
                  />
                  <Area type="monotone" dataKey="revenue" stroke="var(--brand-primary)" strokeWidth={2} fill="url(#rev)" />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </ChartCard>
        </div>

        <ChartCard title="Status Pesanan">
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={statusData} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border-secondary)" vertical={false} />
              <XAxis dataKey="name" tick={{ fontSize: 11, fill: "var(--text-tertiary)" }} stroke="var(--border-primary)" />
              <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: "var(--text-tertiary)" }} stroke="var(--border-primary)" />
              <Tooltip
                cursor={{ fill: "var(--bg-hover)" }}
                contentStyle={{ background: "var(--surface-bg)", border: "1px solid var(--border-primary)", borderRadius: 8, fontSize: 12 }}
              />
              <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                {statusData.map((_, i) => (
                  <Cell key={i} fill={statusColors[i]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      <ChartCard title="Produk Terlaris">
        {stats.topProducts.length === 0 ? (
          <p className="text-label-sm text-text-tertiary py-6 text-center">Belum ada penjualan.</p>
        ) : (
          <div className="flex flex-col gap-2">
            {stats.topProducts.map((p, i) => {
              const max = stats.topProducts[0].count || 1;
              return (
                <div key={p.name} className="flex items-center gap-3">
                  <span className="text-label-sm text-text-tertiary w-5 flex-shrink-0">{i + 1}</span>
                  <span className="text-label-sm text-text-primary w-40 flex-shrink-0 truncate">{p.name}</span>
                  <div className="flex-1 h-2.5 bg-bg-faint rounded-corner-full overflow-hidden">
                    <div className="h-full bg-brand-primary rounded-corner-full" style={{ width: `${(p.count / max) * 100}%` }} />
                  </div>
                  <span className="text-label-sm font-semibold text-text-secondary w-8 text-right flex-shrink-0">{p.count}</span>
                </div>
              );
            })}
          </div>
        )}
      </ChartCard>
    </div>
  );
}
