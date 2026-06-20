import { Link } from "react-router";
import { Button } from "../components/ui/Button";
import { Home } from "lucide-react";

export function NotFound() {
  return (
    <div className="min-h-screen bg-brand-tertiary font-sans flex items-center justify-center p-6">
      <div className="bg-surface-bg rounded-corner-lg p-8 text-center max-w-sm">
        <p style={{ fontSize: "48px", lineHeight: "1" }}>🌷</p>
        <h1 className="text-title text-text-primary mt-3 mb-1">Halaman Tidak Ditemukan</h1>
        <p className="text-label-sm text-text-secondary mb-4">Halaman yang kamu cari tidak ada.</p>
        <Link to="/">
          <Button variant="primary" iconStart={<Home size={16} />}>Kembali ke Katalog</Button>
        </Link>
      </div>
    </div>
  );
}
