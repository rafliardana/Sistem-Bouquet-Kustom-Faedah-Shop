import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router";
import { Button } from "../components/ui/Button";
import { InputField } from "../components/ui/InputField";
import { Flower2, ArrowLeft, ShieldCheck } from "lucide-react";
import { useAuth } from "../lib/auth";
import { hasOwner, bootstrapOwner } from "../lib/api";
import { Loading } from "./Loading";

export function AdminLoginPage() {
  const { signIn, profile, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  const [checking, setChecking] = useState(true);
  const [ownerExists, setOwnerExists] = useState(true);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // If already a staff member, skip to the panel.
  useEffect(() => {
    if (!authLoading && (profile?.role === "admin" || profile?.role === "owner")) {
      navigate(profile.role === "owner" ? "/admin" : "/admin/orders", { replace: true });
    }
  }, [authLoading, profile, navigate]);

  useEffect(() => {
    let active = true;
    hasOwner()
      .then((exists) => active && setOwnerExists(exists))
      .catch((e) => {
        console.error("Failed to check owner existence:", e);
        if (active) setOwnerExists(true);
      })
      .finally(() => active && setChecking(false));
    return () => {
      active = false;
    };
  }, []);

  const handleLogin = async () => {
    if (!email.trim() || !password) return;
    setSubmitting(true);
    setError(null);
    try {
      const p = await signIn(email.trim(), password);
      if (p.role !== "admin" && p.role !== "owner") {
        setError("Akun ini bukan admin/owner.");
        setSubmitting(false);
        return;
      }
      navigate(p.role === "owner" ? "/admin" : "/admin/orders", { replace: true });
    } catch (e) {
      console.error("Admin login failed:", e);
      setError("Email atau password salah.");
      setSubmitting(false);
    }
  };

  const handleBootstrap = async () => {
    if (!name.trim() || !email.trim() || password.length < 6) return;
    setSubmitting(true);
    setError(null);
    try {
      await bootstrapOwner(email.trim(), password, name.trim());
      const p = await signIn(email.trim(), password);
      navigate(p.role === "owner" ? "/admin" : "/admin/orders", { replace: true });
    } catch (e) {
      console.error("Owner bootstrap failed:", e);
      setError(e instanceof Error ? e.message : "Gagal membuat owner.");
      setSubmitting(false);
    }
  };

  if (checking || authLoading) return <Loading label="Memuat…" />;

  const setupMode = !ownerExists;

  return (
    <div className="min-h-screen bg-brand-tertiary font-sans flex items-center justify-center p-6">
      <div className="w-full max-w-sm flex flex-col gap-4">
        <Link to="/" className="self-start">
          <Button variant="subtle" size="small" iconStart={<ArrowLeft size={14} />}>Kembali ke Toko</Button>
        </Link>
        <div className="bg-surface-bg rounded-corner-lg p-6 flex flex-col gap-4">
          <div className="flex flex-col items-center gap-2 text-center">
            <div className="w-11 h-11 rounded-corner-full bg-brand-primary flex items-center justify-center">
              {setupMode ? <ShieldCheck className="w-6 h-6 text-on-brand" /> : <Flower2 className="w-6 h-6 text-on-brand" />}
            </div>
            <h1 className="text-title text-text-primary">{setupMode ? "Setup Owner" : "Login Admin"}</h1>
            <p className="text-label-sm text-text-secondary">
              {setupMode
                ? "Belum ada owner. Buat akun owner pertama untuk mengelola toko."
                : "Masuk sebagai admin atau owner Faedah Shop"}
            </p>
          </div>

          {setupMode && (
            <InputField label="Nama" placeholder="Nama owner" value={name} onChange={setName} />
          )}
          <InputField label="Email" type="email" placeholder="email@contoh.com" value={email} onChange={setEmail} />
          <InputField
            label="Password"
            description={setupMode ? "Minimal 6 karakter" : undefined}
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={setPassword}
          />

          {error && <p className="text-label-sm text-[var(--status-danger)]">{error}</p>}

          {setupMode ? (
            <Button
              variant="primary"
              onClick={handleBootstrap}
              disabled={!name.trim() || !email.trim() || password.length < 6 || submitting}
              className="w-full"
            >
              {submitting ? "Memproses…" : "Buat Owner & Masuk"}
            </Button>
          ) : (
            <Button
              variant="primary"
              onClick={handleLogin}
              disabled={!email.trim() || !password || submitting}
              className="w-full"
            >
              {submitting ? "Memproses…" : "Masuk"}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
