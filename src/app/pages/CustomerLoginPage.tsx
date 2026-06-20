import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router";
import { Button } from "../components/ui/Button";
import { InputField } from "../components/ui/InputField";
import { Flower2, ArrowLeft } from "lucide-react";
import { useAuth } from "../lib/auth";

export function CustomerLoginPage() {
  const { signIn } = useAuth();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const redirect = params.get("redirect") || "/";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!email.trim() || !password) return;
    setSubmitting(true);
    setError(null);
    try {
      await signIn(email.trim(), password);
      navigate(redirect, { replace: true });
    } catch (e) {
      console.error("Customer login failed:", e);
      setError("Email atau password salah. Coba lagi.");
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-brand-tertiary font-sans flex items-center justify-center p-6">
      <div className="w-full max-w-sm flex flex-col gap-4">
        <Link to="/" className="self-start">
          <Button variant="subtle" size="small" iconStart={<ArrowLeft size={14} />}>Kembali ke Katalog</Button>
        </Link>
        <div className="bg-surface-bg rounded-corner-lg p-6 flex flex-col gap-4">
          <div className="flex flex-col items-center gap-2 text-center">
            <div className="w-11 h-11 rounded-corner-full bg-brand-primary flex items-center justify-center">
              <Flower2 className="w-6 h-6 text-on-brand" />
            </div>
            <h1 className="text-title text-text-primary">Masuk</h1>
            <p className="text-label-sm text-text-secondary">Masuk untuk menyelesaikan pesanan & melihat riwayat</p>
          </div>

          <InputField label="Email" type="email" placeholder="email@contoh.com" value={email} onChange={setEmail} />
          <InputField label="Password" type="password" placeholder="••••••••" value={password} onChange={setPassword} />

          {error && <p className="text-label-sm text-[var(--status-danger)]">{error}</p>}

          <Button variant="primary" onClick={handleSubmit} disabled={!email.trim() || !password || submitting} className="w-full">
            {submitting ? "Memproses…" : "Masuk"}
          </Button>

          <p className="text-label-sm text-text-secondary text-center">
            Belum punya akun?{" "}
            <Link to={`/register${redirect !== "/" ? `?redirect=${redirect}` : ""}`} className="text-brand-primary font-semibold">
              Daftar
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
