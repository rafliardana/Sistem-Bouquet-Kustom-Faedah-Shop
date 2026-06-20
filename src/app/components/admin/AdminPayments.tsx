import { useEffect, useState } from "react";
import { Button } from "../ui/Button";
import { InputField } from "../ui/InputField";
import { Checkbox } from "../ui/Checkbox";
import { Loading } from "../../pages/Loading";
import { listPaymentMethods, savePaymentMethods } from "../../lib/api";
import { Plus, Trash2, Save } from "lucide-react";
import type { PaymentMethod } from "../types";

interface Row { id: string; label: string; detail: string; needsProof: boolean }

function slugId(label: string, fallback: string) {
  const slug = label.toLowerCase().trim().replace(/[^a-z0-9]+/g, "_").replace(/^_|_$/g, "");
  return slug || fallback;
}

export function AdminPayments() {
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    let active = true;
    listPaymentMethods()
      .then((list) => active && setRows(list.map((m) => ({ id: m.id, label: m.label, detail: m.detail, needsProof: m.needsProof }))))
      .catch((e) => {
        console.error("Failed to load payment methods:", e);
        if (active) setError(e instanceof Error ? e.message : "Gagal memuat metode pembayaran");
      })
      .finally(() => active && setLoading(false));
    return () => { active = false; };
  }, []);

  const update = (i: number, k: keyof Row, v: string | boolean) =>
    setRows((prev) => prev.map((r, idx) => (idx === i ? { ...r, [k]: v } : r)));
  const remove = (i: number) => setRows((prev) => prev.filter((_, idx) => idx !== i));
  const add = () => setRows((prev) => [...prev, { id: "", label: "", detail: "", needsProof: true }]);

  const handleSave = async () => {
    const methods: PaymentMethod[] = rows
      .filter((r) => r.label.trim())
      .map((r, i) => ({
        id: r.id.trim() || slugId(r.label, `metode_${i + 1}`),
        label: r.label.trim(),
        detail: r.detail.trim(),
        needsProof: r.needsProof,
      }));
    if (methods.length === 0) {
      setError("Minimal satu metode pembayaran wajib ada.");
      return;
    }
    setSaving(true);
    setError(null);
    setSaved(false);
    try {
      const result = await savePaymentMethods(methods);
      setRows(result.map((m) => ({ id: m.id, label: m.label, detail: m.detail, needsProof: m.needsProof })));
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (e) {
      console.error("Failed to save payment methods:", e);
      setError(e instanceof Error ? e.message : "Gagal menyimpan metode pembayaran.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <Loading label="Memuat metode pembayaran…" />;

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <div className="flex items-center justify-between mb-4 gap-2">
        <div>
          <h1 className="text-title text-text-primary">Metode Pembayaran</h1>
          <p className="text-label-sm text-text-secondary mt-1">Atur metode yang muncul di halaman checkout</p>
        </div>
        <Button variant="subtle" size="small" iconStart={<Plus size={16} />} onClick={add}>Tambah Metode</Button>
      </div>

      {error && <p className="text-label-sm text-[var(--status-danger)] mb-3">{error}</p>}

      <div className="flex flex-col gap-3">
        {rows.map((r, i) => (
          <div key={i} className="bg-surface-bg rounded-corner-lg border border-border-primary p-4 flex flex-col gap-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <InputField label="Nama Metode" placeholder="Transfer BCA" value={r.label} onChange={(v) => update(i, "label", v)} />
              <InputField label="Detail / Nomor Rekening" placeholder="BCA 1234567890 • a/n Faedah Shop" value={r.detail} onChange={(v) => update(i, "detail", v)} />
            </div>
            <div className="flex items-center justify-between gap-2">
              <Checkbox
                label="Butuh bukti pembayaran"
                description="Pelanggan wajib upload bukti transfer untuk metode ini"
                checked={r.needsProof}
                onChange={(v) => update(i, "needsProof", v)}
              />
              <Button variant="subtle" size="small" iconStart={<Trash2 size={14} />} onClick={() => remove(i)} className="text-[var(--status-danger)] flex-shrink-0">
                Hapus
              </Button>
            </div>
          </div>
        ))}
        {rows.length === 0 && (
          <div className="bg-surface-bg rounded-corner-lg p-8 text-center">
            <p style={{ fontSize: "40px", lineHeight: "1" }}>💳</p>
            <p className="text-label-sm text-text-secondary mt-2">Belum ada metode pembayaran. Tambahkan satu agar pelanggan bisa checkout.</p>
          </div>
        )}
      </div>

      <div className="flex items-center gap-3 mt-4">
        <Button variant="primary" iconStart={<Save size={16} />} onClick={handleSave} disabled={saving}>
          {saving ? "Menyimpan…" : "Simpan Perubahan"}
        </Button>
        {saved && <span className="text-label-sm text-[var(--status-success)]">Tersimpan ✓</span>}
      </div>
    </div>
  );
}
