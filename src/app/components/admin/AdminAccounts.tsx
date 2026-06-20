import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { Button } from "../ui/Button";
import { InputField } from "../ui/InputField";
import { Loading } from "../../pages/Loading";
import { useAuth } from "../../lib/auth";
import { listAdminAccounts, createAdminAccount, deleteAdminAccount } from "../../lib/api";
import { Plus, Trash2, X, UserCog, Mail } from "lucide-react";
import type { UserProfile } from "../types";

export function AdminAccounts() {
  const { profile, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  const [accounts, setAccounts] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Owner-only guard.
  useEffect(() => {
    if (!authLoading && profile?.role !== "owner") {
      navigate("/admin/orders", { replace: true });
    }
  }, [authLoading, profile, navigate]);

  useEffect(() => {
    if (authLoading || profile?.role !== "owner") return;
    let active = true;
    listAdminAccounts()
      .then((list) => active && setAccounts(list))
      .catch((e) => {
        console.error("Failed to load admin accounts:", e);
        if (active) setError(e instanceof Error ? e.message : "Gagal memuat akun admin");
      })
      .finally(() => active && setLoading(false));
    return () => { active = false; };
  }, [authLoading, profile]);

  const handleCreate = async () => {
    if (!name.trim() || !email.trim() || password.length < 6) {
      setFormError("Lengkapi nama, email, dan password (min. 6 karakter).");
      return;
    }
    setSaving(true);
    setFormError(null);
    try {
      const account = await createAdminAccount(email.trim(), password, name.trim());
      setAccounts((prev) => [...prev, account]);
      setName(""); setEmail(""); setPassword(""); setShowForm(false);
    } catch (e) {
      console.error("Failed to create admin account:", e);
      setFormError(e instanceof Error ? e.message : "Gagal membuat akun admin.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    setDeletingId(id);
    try {
      await deleteAdminAccount(id);
      setAccounts((prev) => prev.filter((a) => a.id !== id));
    } catch (e) {
      console.error("Failed to delete admin account:", e);
    } finally {
      setDeletingId(null);
    }
  };

  if (authLoading || loading) return <Loading label="Memuat akun…" />;

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <div className="flex items-center justify-between mb-4 gap-2">
        <div>
          <h1 className="text-title text-text-primary">Kelola Admin</h1>
          <p className="text-label-sm text-text-secondary mt-1">{accounts.length} akun admin</p>
        </div>
        {!showForm && (
          <Button variant="primary" iconStart={<Plus size={16} />} onClick={() => setShowForm(true)}>Tambah Admin</Button>
        )}
      </div>

      {error && <p className="text-label-sm text-[var(--status-danger)] mb-3">{error}</p>}

      {showForm && (
        <div className="bg-surface-bg rounded-corner-lg border border-border-selected p-4 flex flex-col gap-3 mb-4">
          <div className="flex items-center justify-between">
            <h3 className="text-label font-semibold text-text-primary">Akun Admin Baru</h3>
            <Button variant="subtle" size="small" iconStart={<X size={16} />} onClick={() => setShowForm(false)} />
          </div>
          <InputField label="Nama" placeholder="Nama admin" value={name} onChange={setName} />
          <InputField label="Email" type="email" placeholder="admin@contoh.com" value={email} onChange={setEmail} />
          <InputField label="Password" description="Minimal 6 karakter" type="password" placeholder="••••••••" value={password} onChange={setPassword} />
          {formError && <p className="text-label-sm text-[var(--status-danger)]">{formError}</p>}
          <div className="flex gap-2">
            <Button variant="primary" onClick={handleCreate} disabled={saving}>{saving ? "Membuat…" : "Buat Akun"}</Button>
            <Button variant="subtle" onClick={() => setShowForm(false)}>Batal</Button>
          </div>
        </div>
      )}

      {accounts.length === 0 ? (
        <div className="bg-surface-bg rounded-corner-lg p-8 text-center">
          <p style={{ fontSize: "40px", lineHeight: "1" }}>👥</p>
          <p className="text-label-sm text-text-secondary mt-2">Belum ada akun admin. Tambahkan admin untuk membantu mengelola toko.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {accounts.map((acc) => (
            <div key={acc.id} className="bg-surface-bg rounded-corner-lg border border-border-primary p-4 flex items-center justify-between gap-2">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-9 h-9 rounded-corner-full bg-brand-secondary flex items-center justify-center flex-shrink-0">
                  <UserCog className="w-5 h-5 text-brand-primary" />
                </div>
                <div className="min-w-0">
                  <p className="text-label-sm font-semibold text-text-primary">{acc.name}</p>
                  <p className="text-video-title text-text-tertiary flex items-center gap-1 truncate">
                    <Mail size={12} /> {acc.email}
                  </p>
                </div>
              </div>
              <Button
                variant="subtle"
                size="small"
                iconStart={<Trash2 size={14} />}
                disabled={deletingId === acc.id}
                onClick={() => handleDelete(acc.id)}
                className="text-[var(--status-danger)] flex-shrink-0"
              >
                {deletingId === acc.id ? "Menghapus…" : "Hapus"}
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
