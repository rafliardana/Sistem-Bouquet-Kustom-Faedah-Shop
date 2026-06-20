import { queryAll, queryOne, query } from "./db.js";

// ─── Default Seed Data ──────────────────────────────────────

const COMMON_SIZES = [
  { id: "S", label: "Kecil", stems: "5–7 tangkai", priceMultiplier: 1 },
  { id: "M", label: "Sedang", stems: "10–15 tangkai", priceMultiplier: 1.7 },
  { id: "L", label: "Besar", stems: "20–25 tangkai", priceMultiplier: 2.4 },
  { id: "XL", label: "Extra Besar", stems: "30+ tangkai", priceMultiplier: 3.2 },
];

const COMMON_ADDONS = [
  { id: "vase", label: "Vas Bunga", price: 75000 },
  { id: "ribbon", label: "Pita Premium", price: 25000 },
  { id: "card", label: "Kartu Ucapan", price: 15000 },
  { id: "wrap", label: "Wrapping Mewah", price: 40000 },
];

const SEED_PRODUCTS = [
  {
    id: "p1",
    name: "Classic Rose Bouquet",
    description: "Rangkaian mawar klasik yang elegan dan mewah. Cocok untuk berbagai momen spesial seperti ulang tahun, anniversari, atau ungkapan rasa cinta.",
    basePrice: 150000,
    image: "https://images.unsplash.com/photo-1487530811176-3780de880c2d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=600",
    category: "Mawar",
    sizes: COMMON_SIZES,
    addons: COMMON_ADDONS,
  },
  {
    id: "p2",
    name: "Pink Romance",
    description: "Perpaduan mawar pink dan putih yang romantis, didekorasi dengan dedaunan hijau segar. Pilihan sempurna untuk mengungkapkan kasih sayang.",
    basePrice: 175000,
    image: "https://images.unsplash.com/photo-1523693916903-027d144a2b7d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=600",
    category: "Mawar",
    sizes: COMMON_SIZES,
    addons: COMMON_ADDONS,
  },
  {
    id: "p3",
    name: "Tropical Garden Mix",
    description: "Perpaduan bunga-bunga tropis berwarna-warni yang segar dan menawan. Tampilan unik yang membuatnya berbeda dari buket biasa.",
    basePrice: 130000,
    image: "https://images.unsplash.com/photo-1572454591674-2739f30d8c40?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=600",
    category: "Campur",
    sizes: COMMON_SIZES,
    addons: COMMON_ADDONS,
  },
  {
    id: "p4",
    name: "Dried Floral Collection",
    description: "Rangkaian bunga kering premium dengan tekstur unik dan nuansa bohemian. Tahan lama dan cocok sebagai dekorasi rumah.",
    basePrice: 140000,
    image: "https://images.unsplash.com/photo-1622658641561-fe2ca339b039?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=600",
    category: "Bunga Kering",
    sizes: [
      { id: "S", label: "Kecil", stems: "5–8 tangkai", priceMultiplier: 1 },
      { id: "M", label: "Sedang", stems: "12–15 tangkai", priceMultiplier: 1.6 },
      { id: "L", label: "Besar", stems: "20–25 tangkai", priceMultiplier: 2.3 },
      { id: "XL", label: "Extra Besar", stems: "30+ tangkai", priceMultiplier: 3 },
    ],
    addons: [
      { id: "frame", label: "Frame Gantung", price: 95000 },
      { id: "ribbon", label: "Pita Satin", price: 25000 },
      { id: "card", label: "Kartu Ucapan", price: 15000 },
      { id: "wrap", label: "Kraft Paper Wrap", price: 30000 },
    ],
  },
  {
    id: "p5",
    name: "Sunflower Joy",
    description: "Buket bunga matahari ceria yang memancarkan kehangatan dan kebahagiaan. Pilihan tepat untuk menyemangati orang-orang tersayang.",
    basePrice: 115000,
    image: "https://images.unsplash.com/photo-1601884928885-92a922f7962f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=600",
    category: "Bunga Matahari",
    sizes: COMMON_SIZES,
    addons: COMMON_ADDONS,
  },
  {
    id: "p6",
    name: "Tulip Garden",
    description: "Rangkaian tulip segar yang anggun dan minimalis. Tersedia dalam berbagai warna pilihan sesuai permintaanmu.",
    basePrice: 165000,
    image: "https://images.unsplash.com/photo-1586968295564-92fd7572718b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=600",
    category: "Tulip",
    sizes: [
      { id: "S", label: "Kecil", stems: "5–7 tangkai", priceMultiplier: 1 },
      { id: "M", label: "Sedang", stems: "10–12 tangkai", priceMultiplier: 1.6 },
      { id: "L", label: "Besar", stems: "18–20 tangkai", priceMultiplier: 2.2 },
      { id: "XL", label: "Extra Besar", stems: "25+ tangkai", priceMultiplier: 2.9 },
    ],
    addons: COMMON_ADDONS,
  },
];

const DEFAULT_PAYMENT_METHODS = [
  { id: "transfer_bca", label: "Transfer BCA", detail: "BCA 1234567890  •  a/n Faedah Shop", needsProof: true },
  { id: "transfer_mandiri", label: "Transfer Mandiri", detail: "Mandiri 0987654321  •  a/n Faedah Shop", needsProof: true },
  { id: "gopay", label: "GoPay", detail: "0812-3456-7890  •  (Faedah Shop)", needsProof: true },
  { id: "ovo", label: "OVO", detail: "0812-3456-7890  •  (Faedah Shop)", needsProof: true },
  { id: "cod", label: "COD (Bayar di Tempat)", detail: "Bayar tunai saat pesanan tiba", needsProof: false },
];

// ─── Seed Functions ──────────────────────────────────────

/**
 * Seed products if table is empty.
 */
export async function seedProducts() {
  const existing = await queryAll("SELECT id FROM products LIMIT 1");
  if (existing.length > 0) {
    console.log("  Products already seeded, skipping.");
    return;
  }
  for (const p of SEED_PRODUCTS) {
    await query(
      `INSERT INTO products (id, name, description, base_price, image, category, sizes, addons)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       ON CONFLICT (id) DO NOTHING`,
      [p.id, p.name, p.description, p.basePrice, p.image, p.category, JSON.stringify(p.sizes), JSON.stringify(p.addons)]
    );
  }
  console.log(`  ✅ Seeded ${SEED_PRODUCTS.length} products`);
}

/**
 * Seed payment methods if table is empty.
 */
export async function seedPaymentMethods() {
  const existing = await queryAll("SELECT id FROM payment_methods LIMIT 1");
  if (existing.length > 0) {
    console.log("  Payment methods already seeded, skipping.");
    return;
  }
  for (const m of DEFAULT_PAYMENT_METHODS) {
    await query(
      `INSERT INTO payment_methods (id, label, detail, needs_proof)
       VALUES ($1, $2, $3, $4)
       ON CONFLICT (id) DO NOTHING`,
      [m.id, m.label, m.detail, m.needsProof]
    );
  }
  console.log(`  ✅ Seeded ${DEFAULT_PAYMENT_METHODS.length} payment methods`);
}

/**
 * Run all seeds.
 */
export async function runSeeds() {
  console.log("🌱 Running database seeds...");
  await seedProducts();
  await seedPaymentMethods();
  console.log("🌱 Seeding complete.");
}
