import { useEffect, useState } from "react";
import { Button } from "../ui/Button";
import { Badge } from "../ui/Badge";
import { InputField } from "../ui/InputField";
import { TextareaField } from "../ui/TextareaField";
import { Loading } from "../../pages/Loading";
import { listProducts, createProduct, updateProduct, deleteProduct } from "../../lib/api";
import { Plus, Pencil, Trash2, X } from "lucide-react";
import type { Product, SizeOption, Addon } from "../types";

interface SizeRow { id: string; label: string; stems: string; priceMultiplier: string }
interface AddonRow { id: string; label: string; price: string }

interface FormState {
  id?: string;
  name: string;
  category: string;
  basePrice: string;
  image: string;
  description: string;
  sizes: SizeRow[];
  addons: AddonRow[];
}

const DEFAULT_SIZES: SizeRow[] = [
  { id: "S", label: "Kecil", stems: "5–7 tangkai", priceMultiplier: "1" },
  { id: "M", label: "Sedang", stems: "10–15 tangkai", priceMultiplier: "1.7" },
  { id: "L", label: "Besar", stems: "20–25 tangkai", priceMultiplier: "2.4" },
  { id: "XL", label: "Extra Besar", stems: "30+ tangkai", priceMultiplier: "3.2" },
];
const DEFAULT_ADDONS: AddonRow[] = [
  { id: "vase", label: "Vas Bunga", price: "75000" },
  { id: "ribbon", label: "Pita Premium", price: "25000" },
  { id: "card", label: "Kartu Ucapan", price: "15000" },
  { id: "wrap", label: "Wrapping Mewah", price: "40000" },
];

const EMPTY: FormState = {
  name: "", category: "Mawar", basePrice: "", image: "", description: "",
  sizes: DEFAULT_SIZES.map((s) => ({ ...s })),
  addons: DEFAULT_ADDONS.map((a) => ({ ...a })),
};

// Build a slug-ish id for a new size/addon from its label.
function slugId(label: string, fallback: string) {
  const slug = label.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
  return slug || fallback;
}

function ProductForm({ initial, onCancel, onSaved }: { initial: FormState; onCancel: () => void; onSaved: (p: Product) => void }) {
  const [form, setForm] = useState<FormState>(initial);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const isEdit = !!initial.id;
  const set = (k: keyof FormState, v: string) => setForm((f) => ({ ...f, [k]: v }));

  const updateSize = (i: number, k: keyof SizeRow, v: string) =>
    setForm((f) => ({ ...f, sizes: f.sizes.map((s, idx) => (idx === i ? { ...s, [k]: v } : s)) }));
  const removeSize = (i: number) => setForm((f) => ({ ...f, sizes: f.sizes.filter((_, idx) => idx !== i) }));
  const addSize = () => setForm((f) => ({ ...f, sizes: [...f.sizes, { id: "", label: "", stems: "", priceMultiplier: "1" }] }));

  const updateAddon = (i: number, k: keyof AddonRow, v: string) =>
    setForm((f) => ({ ...f, addons: f.addons.map((a, idx) => (idx === i ? { ...a, [k]: v } : a)) }));
  const removeAddon = (i: number) => setForm((f) => ({ ...f, addons: f.addons.filter((_, idx) => idx !== i) }));
  const addAddon = () => setForm((f) => ({ ...f, addons: [...f.addons, { id: "", label: "", price: "0" }] }));

  const handleSave = async () => {
    if (!form.name.trim() || !form.basePrice) {
      setError("Nama dan harga dasar wajib diisi.");
      return;
    }
    const sizes: SizeOption[] = form.sizes
      .filter((s) => s.label.trim())
      .map((s, i) => ({
        id: s.id.trim() || slugId(s.label, `size-${i + 1}`),
        label: s.label.trim(),
        stems: s.stems.trim(),
        priceMultiplier: Number(s.priceMultiplier) || 1,
      }));
    if (sizes.length === 0) {
      setError("Minimal satu ukuran wajib ada.");
      return;
    }
    const addons: Addon[] = form.addons
      .filter((a) => a.label.trim())
      .map((a, i) => ({
        id: a.id.trim() || slugId(a.label, `addon-${i + 1}`),
        label: a.label.trim(),
        price: Number(a.price) || 0,
      }));

    setSaving(true);
    setError(null);
    try {
      const payload = {
        name: form.name.trim(),
        category: form.category.trim() || "Campur",
        basePrice: Number(form.basePrice),
        image: form.image.trim(),
        description: form.description.trim(),
        sizes,
        addons,
      };
      const saved = isEdit ? await updateProduct(initial.id!, payload) : await createProduct(payload);
      onSaved(saved);
    } catch (e) {
      console.error("Failed to save product:", e);
      setError(e instanceof Error ? e.message : "Gagal menyimpan produk.");
      setSaving(false);
    }
  };

  return (
    <div className="bg-surface-bg rounded-corner-lg border border-border-selected p-4 flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h3 className="text-label font-semibold text-text-primary">{isEdit ? "Edit Produk" : "Produk Baru"}</h3>
        <Button variant="subtle" size="small" iconStart={<X size={16} />} onClick={onCancel} />
      </div>

      <InputField label="Nama Produk" placeholder="Mis. Classic Rose Bouquet" value={form.name} onChange={(v) => set("name", v)} />
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <InputField label="Kategori" placeholder="Mawar, Tulip, Campur…" value={form.category} onChange={(v) => set("category", v)} />
        <InputField label="Harga Dasar (Rp)" type="number" placeholder="150000" value={form.basePrice} onChange={(v) => set("basePrice", v)} />
      </div>
      <InputField label="URL Gambar" placeholder="https://…" value={form.image} onChange={(v) => set("image", v)} />
      {form.image && (
        <div className="rounded-corner-md overflow-hidden" style={{ height: "120px" }}>
          <img src={form.image} alt="Preview" className="w-full h-full object-cover" />
        </div>
      )}
      <TextareaField label="Deskripsi" placeholder="Deskripsi singkat produk…" rows={3} value={form.description} onChange={(v) => set("description", v)} />

      {/* Sizes editor */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <p className="text-label-sm font-semibold text-text-primary">Ukuran &amp; Harga</p>
          <Button variant="subtle" size="small" iconStart={<Plus size={14} />} onClick={addSize}>Tambah Ukuran</Button>
        </div>
        <p className="text-video-title text-text-tertiary">Harga ukuran = Harga Dasar × Pengali.</p>
        <div className="flex flex-col gap-2">
          {form.sizes.map((s, i) => (
            <div key={i} className="bg-bg-faint rounded-corner-md p-2 flex flex-wrap items-end gap-2">
              <div className="w-16"><InputField label="Kode" placeholder="S" value={s.id} onChange={(v) => updateSize(i, "id", v)} /></div>
              <div className="flex-1 min-w-[100px]"><InputField label="Label" placeholder="Sedang" value={s.label} onChange={(v) => updateSize(i, "label", v)} /></div>
              <div className="flex-1 min-w-[120px]"><InputField label="Tangkai" placeholder="10–15 tangkai" value={s.stems} onChange={(v) => updateSize(i, "stems", v)} /></div>
              <div className="w-20"><InputField label="Pengali" type="number" placeholder="1.7" value={s.priceMultiplier} onChange={(v) => updateSize(i, "priceMultiplier", v)} /></div>
              <Button variant="subtle" size="small" iconStart={<Trash2 size={14} />} onClick={() => removeSize(i)} className="text-[var(--status-danger)]" />
            </div>
          ))}
        </div>
      </div>

      {/* Addons editor */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <p className="text-label-sm font-semibold text-text-primary">Tambahan Opsional</p>
          <Button variant="subtle" size="small" iconStart={<Plus size={14} />} onClick={addAddon}>Tambah Opsi</Button>
        </div>
        <div className="flex flex-col gap-2">
          {form.addons.map((a, i) => (
            <div key={i} className="bg-bg-faint rounded-corner-md p-2 flex flex-wrap items-end gap-2">
              <div className="flex-1 min-w-[140px]"><InputField label="Nama Tambahan" placeholder="Vas Bunga" value={a.label} onChange={(v) => updateAddon(i, "label", v)} /></div>
              <div className="w-28"><InputField label="Harga (Rp)" type="number" placeholder="75000" value={a.price} onChange={(v) => updateAddon(i, "price", v)} /></div>
              <Button variant="subtle" size="small" iconStart={<Trash2 size={14} />} onClick={() => removeAddon(i)} className="text-[var(--status-danger)]" />
            </div>
          ))}
          {form.addons.length === 0 && <p className="text-video-title text-text-tertiary">Tidak ada tambahan untuk produk ini.</p>}
        </div>
      </div>

      {error && <p className="text-label-sm text-[var(--status-danger)]">{error}</p>}
      <div className="flex gap-2">
        <Button variant="primary" onClick={handleSave} disabled={saving}>{saving ? "Menyimpan…" : "Simpan"}</Button>
        <Button variant="subtle" onClick={onCancel}>Batal</Button>
      </div>
    </div>
  );
}

export function AdminProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editing, setEditing] = useState<FormState | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    listProducts()
      .then((list) => active && setProducts(list))
      .catch((e) => {
        console.error("Failed to load products:", e);
        if (active) setError(e instanceof Error ? e.message : "Gagal memuat produk");
      })
      .finally(() => active && setLoading(false));
    return () => { active = false; };
  }, []);

  const handleSaved = (saved: Product) => {
    setProducts((prev) => {
      const exists = prev.some((p) => p.id === saved.id);
      return exists ? prev.map((p) => (p.id === saved.id ? saved : p)) : [...prev, saved];
    });
    setEditing(null);
  };

  const handleDelete = async (id: string) => {
    setDeletingId(id);
    try {
      await deleteProduct(id);
      setProducts((prev) => prev.filter((p) => p.id !== id));
    } catch (e) {
      console.error("Failed to delete product:", e);
    } finally {
      setDeletingId(null);
    }
  };

  const toForm = (p: Product): FormState => ({
    id: p.id,
    name: p.name,
    category: p.category,
    basePrice: String(p.basePrice),
    image: p.image,
    description: p.description,
    sizes: p.sizes.map((s) => ({ id: s.id, label: s.label, stems: s.stems, priceMultiplier: String(s.priceMultiplier) })),
    addons: p.addons.map((a) => ({ id: a.id, label: a.label, price: String(a.price) })),
  });

  if (loading) return <Loading label="Memuat produk…" />;

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-4 gap-2">
        <div>
          <h1 className="text-title text-text-primary">Kelola Produk</h1>
          <p className="text-label-sm text-text-secondary mt-1">{products.length} produk di katalog</p>
        </div>
        {!editing && (
          <Button variant="primary" iconStart={<Plus size={16} />} onClick={() => setEditing({ ...EMPTY, sizes: DEFAULT_SIZES.map((s) => ({ ...s })), addons: DEFAULT_ADDONS.map((a) => ({ ...a })) })}>Tambah Produk</Button>
        )}
      </div>

      {error && <p className="text-label-sm text-[var(--status-danger)] mb-3">{error}</p>}

      {editing && (
        <div className="mb-4">
          <ProductForm initial={editing} onCancel={() => setEditing(null)} onSaved={handleSaved} />
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {products.map((product) => (
          <div key={product.id} className="bg-surface-bg rounded-corner-lg border border-border-primary overflow-hidden flex flex-col">
            <div className="h-36 overflow-hidden bg-bg-faint">
              {product.image && <img src={product.image} alt={product.name} className="w-full h-full object-cover" />}
            </div>
            <div className="p-3 flex flex-col gap-2 flex-1">
              <div className="flex items-start justify-between gap-2">
                <p className="text-label font-semibold text-text-primary">{product.name}</p>
                <Badge label={product.category} variant="secondary" />
              </div>
              <p className="text-label-sm font-semibold text-brand-primary">Rp {product.basePrice.toLocaleString("id-ID")}</p>
              <p className="text-video-title text-text-tertiary">{product.sizes.length} ukuran • {product.addons.length} tambahan</p>
              <p className="text-video-title text-text-tertiary" style={{ display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
                {product.description}
              </p>
              <div className="flex gap-2 mt-auto pt-1">
                <Button variant="neutral" size="small" iconStart={<Pencil size={14} />} onClick={() => setEditing(toForm(product))}>
                  Edit
                </Button>
                <Button
                  variant="subtle"
                  size="small"
                  iconStart={<Trash2 size={14} />}
                  disabled={deletingId === product.id}
                  onClick={() => handleDelete(product.id)}
                  className="text-[var(--status-danger)]"
                >
                  {deletingId === product.id ? "Menghapus…" : "Hapus"}
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
