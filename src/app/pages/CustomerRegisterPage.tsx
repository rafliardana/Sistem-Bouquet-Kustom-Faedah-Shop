import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router";
import { Button } from "../components/ui/Button";
import { InputField } from "../components/ui/InputField";
import { Flower2, ArrowLeft } from "lucide-react";
import { useAuth } from "../lib/auth";

export function CustomerRegisterPage() {
  const { signUp } = useAuth();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const redirect = params.get("redirect") || "/";

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const isValid = name.trim() && email.trim() && password.length >= 6;

  const handleSubmit = async () => {
    if (!isValid) return;
    setSubmitting(true);
    setError(null);
    try {
      await signUp(email.trim(), password, name.trim());
      navigate(redirect, { replace: true });
    } catch (e) {
      console.error("Customer registration failed:", e);
      setError(e instanceof Error ? e.message : "Gagal mendaftar. Coba lagi.");
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
            <h1 className="text-title text-text-primary">Daftar Akun</h1>
            <p className="text-label-sm text-text-secondary">Buat akun untuk memesan & melacak pesananmu</p>
          </div>

          <InputField label="Nama Lengkap" placeholder="Nama kamu" value={name} onChange={setName} />
          <InputField label="Email" type="email" placeholder="email@contoh.com" value={email} onChange={setEmail} />
          <InputField label="Password" description="Minimal 6 karakter" type="password" placeholder="••••••••" value={password} onChange={setPassword} />

          {error && <p className="text-label-sm text-[var(--status-danger)]">{error}</p>}

          <Button variant="primary" onClick={handleSubmit} disabled={!isValid || submitting} className="w-full">
            {submitting ? "Memproses…" : "Daftar"}
          </Button>

          <p className="text-label-sm text-text-secondary text-center">
            Sudah punya akun?{" "}
            <Link to={`/login${redirect !== "/" ? `?redirect=${redirect}` : ""}`} className="text-brand-primary font-semibold">
              Masuk
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
