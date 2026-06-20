import { useEffect } from "react";
import { Outlet, useLocation, useNavigate } from "react-router";
import { Button } from "../ui/Button";
import { Badge } from "../ui/Badge";
import { Flower2, LayoutDashboard, ClipboardList, Package, Users, LogOut, Store, CreditCard } from "lucide-react";
import { useAuth } from "../../lib/auth";
import { Loading } from "../../pages/Loading";

interface NavItem {
  label: string;
  path: string;
  icon: React.ReactNode;
  ownerOnly?: boolean;
}

const NAV: NavItem[] = [
  { label: "Dashboard", path: "/admin", icon: <LayoutDashboard size={18} />, ownerOnly: true },
  { label: "Pesanan", path: "/admin/orders", icon: <ClipboardList size={18} /> },
  { label: "Produk", path: "/admin/products", icon: <Package size={18} /> },
  { label: "Pembayaran", path: "/admin/payments", icon: <CreditCard size={18} /> },
  { label: "Kelola Admin", path: "/admin/accounts", icon: <Users size={18} />, ownerOnly: true },
];

export function AdminLayout() {
  const { profile, loading, signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const isStaff = profile?.role === "admin" || profile?.role === "owner";

  useEffect(() => {
    if (!loading && !isStaff) {
      navigate("/admin/login", { replace: true });
    }
  }, [loading, isStaff, navigate]);

  if (loading) return <Loading label="Memuat…" />;
  if (!profile || !isStaff) return <Loading label="Mengarahkan…" />;

  const isOwner = profile.role === "owner";
  const items = NAV.filter((n) => !n.ownerOnly || isOwner);

  const isActive = (path: string) =>
    path === "/admin" ? location.pathname === "/admin" : location.pathname.startsWith(path);

  const handleSignOut = async () => {
    await signOut();
    navigate("/admin/login", { replace: true });
  };

  return (
    <div className="min-h-screen bg-brand-tertiary font-sans flex flex-col md:flex-row">
      {/* Sidebar */}
      <aside className="md:w-64 md:min-h-screen bg-surface-bg border-b md:border-b-0 md:border-r border-border-primary flex md:flex-col">
        <div className="p-4 flex-1 md:flex-none">
          <div className="flex items-center gap-2 mb-1">
            <div className="w-9 h-9 rounded-corner-full bg-brand-primary flex items-center justify-center flex-shrink-0">
              <Flower2 className="w-5 h-5 text-on-brand" />
            </div>
            <div>
              <p className="text-label font-semibold text-text-primary" style={{ lineHeight: "1.2" }}>Faedah Admin</p>
              <Badge label={isOwner ? "Owner" : "Admin"} variant={isOwner ? "brand" : "secondary"} />
            </div>
          </div>
        </div>

        <nav className="hidden md:flex flex-col gap-1 px-3">
          {items.map((item) => (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className={[
                "flex items-center gap-2 px-3 py-2 rounded-corner-md text-label-sm transition-colors text-left",
                isActive(item.path)
                  ? "bg-brand-secondary text-brand-primary"
                  : "text-text-secondary hover:bg-bg-hover",
              ].join(" ")}
            >
              <span className="flex-shrink-0">{item.icon}</span>
              {item.label}
            </button>
          ))}
        </nav>

        <div className="hidden md:flex flex-col gap-1 mt-auto p-3 border-t border-border-primary">
          <p className="text-video-title text-text-tertiary px-3 truncate">{profile.email}</p>
          <button
            onClick={() => navigate("/")}
            className="flex items-center gap-2 px-3 py-2 rounded-corner-md text-label-sm text-text-secondary hover:bg-bg-hover transition-colors text-left"
          >
            <Store size={18} /> Lihat Toko
          </button>
          <button
            onClick={handleSignOut}
            className="flex items-center gap-2 px-3 py-2 rounded-corner-md text-label-sm text-text-secondary hover:bg-bg-hover transition-colors text-left"
          >
            <LogOut size={18} /> Keluar
          </button>
        </div>
      </aside>

      {/* Mobile nav */}
      <nav className="md:hidden bg-surface-bg border-b border-border-primary px-3 py-2 flex gap-1 overflow-x-auto">
        {items.map((item) => (
          <Button
            key={item.path}
            variant={isActive(item.path) ? "neutral" : "subtle"}
            size="small"
            iconStart={item.icon}
            onClick={() => navigate(item.path)}
            className={isActive(item.path) ? "text-brand-primary" : ""}
          >
            {item.label}
          </Button>
        ))}
        <Button variant="subtle" size="small" iconStart={<LogOut size={16} />} onClick={handleSignOut} />
      </nav>

      {/* Content */}
      <main className="flex-1 min-w-0">
        <Outlet />
      </main>
    </div>
  );
}
