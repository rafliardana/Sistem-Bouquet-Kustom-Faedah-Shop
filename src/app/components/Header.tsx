import { useState } from "react";
import { useNavigate, useLocation } from "react-router";
import { Button } from "./ui/Button";
import { Flower2, ClipboardList, Menu, X, LogIn, LogOut, User, LayoutDashboard } from "lucide-react";
import { useAuth } from "../lib/auth";

export function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { profile, signOut } = useAuth();

  const isActive = (path: string) =>
    path === "/" ? location.pathname === "/" : location.pathname.startsWith(path);

  const go = (path: string) => {
    navigate(path);
    setMenuOpen(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleSignOut = async () => {
    await signOut();
    setMenuOpen(false);
    navigate("/");
  };

  return (
    <header className="bg-surface-bg border-b border-border-primary sticky top-0 z-50 font-sans">
      <div className="max-w-6xl mx-auto px-6 py-3 flex items-center justify-between">
        <button onClick={() => go("/")} className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-corner-full bg-brand-primary flex items-center justify-center">
            <Flower2 className="w-5 h-5 text-on-brand" />
          </div>
          <div className="text-left">
            <p className="text-label font-semibold text-text-primary" style={{ lineHeight: "1.2" }}>
              Faedah Shop
            </p>
            <p className="text-video-title text-text-tertiary">Rangkaian Bunga Premium</p>
          </div>
        </button>

        <nav className="hidden md:flex items-center gap-1.5">
          <Button variant="subtle" onClick={() => go("/")} className={isActive("/") ? "text-brand-primary" : ""}>
            Katalog
          </Button>
          <Button
            variant="subtle"
            onClick={() => go("/pesanan-saya")}
            iconStart={<ClipboardList size={16} />}
            className={isActive("/pesanan-saya") ? "text-brand-primary" : ""}
          >
            Pesanan Saya
          </Button>
          {profile && (profile.role === "admin" || profile.role === "owner") && (
            <Button
              variant="subtle"
              onClick={() => go("/admin")}
              iconStart={<LayoutDashboard size={16} />}
              className={isActive("/admin") ? "text-brand-primary" : ""}
            >
              Panel {profile.role === "owner" ? "Owner" : "Admin"}
            </Button>
          )}
          {profile ? (
            <div className="flex items-center gap-2 pl-2">
              <span className="flex items-center gap-1.5 text-label-sm text-text-secondary">
                <User size={16} className="text-text-tertiary" />
                {profile.name}
              </span>
              <Button variant="neutral" size="small" onClick={handleSignOut} iconStart={<LogOut size={14} />}>
                Keluar
              </Button>
            </div>
          ) : (
            <Button variant="primary" size="small" onClick={() => go("/login")} iconStart={<LogIn size={14} />}>
              Masuk
            </Button>
          )}
        </nav>

        <Button
          variant="subtle"
          className="md:hidden"
          onClick={() => setMenuOpen(!menuOpen)}
          iconStart={menuOpen ? <X size={16} /> : <Menu size={16} />}
        />
      </div>

      {menuOpen && (
        <div className="md:hidden bg-surface-bg border-t border-border-primary px-6 py-3 flex flex-col gap-1.5">
          <Button variant="subtle" onClick={() => go("/")}>Katalog</Button>
          <Button variant="subtle" onClick={() => go("/pesanan-saya")} iconStart={<ClipboardList size={16} />}>
            Pesanan Saya
          </Button>
          {profile && (profile.role === "admin" || profile.role === "owner") && (
            <Button
              variant="subtle"
              onClick={() => go("/admin")}
              iconStart={<LayoutDashboard size={16} />}
            >
              Panel {profile.role === "owner" ? "Owner" : "Admin"}
            </Button>
          )}
          {profile ? (
            <>
              <span className="flex items-center gap-1.5 text-label-sm text-text-secondary px-3 py-1.5">
                <User size={16} className="text-text-tertiary" />
                {profile.name}
              </span>
              <Button variant="neutral" size="small" onClick={handleSignOut} iconStart={<LogOut size={14} />}>
                Keluar
              </Button>
            </>
          ) : (
            <Button variant="primary" size="small" onClick={() => go("/login")} iconStart={<LogIn size={14} />}>
              Masuk
            </Button>
          )}
        </div>
      )}
    </header>
  );
}
