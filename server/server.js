import "dotenv/config";
import express from "express";
import cors from "cors";
import crypto from "crypto";
import { mkdirSync, writeFileSync, existsSync } from "fs";
import { join, extname } from "path";
import { fileURLToPath } from "url";
import { dirname } from "path";

import { initDatabase, query, queryOne, queryAll } from "./db.js";
import { hashPassword, verifyPassword, generateToken, authMiddleware } from "./auth.js";
import { runSeeds } from "./seed.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const PORT = process.env.PORT || 3001;
const UPLOAD_DIR = process.env.UPLOAD_DIR || "./uploads";

// Ensure upload directory exists
const uploadPath = join(__dirname, UPLOAD_DIR);
mkdirSync(uploadPath, { recursive: true });

const app = express();

// ─── Middleware ──────────────────────────────────────────
app.use(cors({
  origin: "*",
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
}));
app.use(express.json({ limit: "15mb" })); // large limit for base64 image uploads
app.use(authMiddleware);

// Serve uploaded files statically
app.use("/uploads", express.static(uploadPath));

// Request logger
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} ${req.method} ${req.path}`);
  next();
});

// ─── Helpers ────────────────────────────────────────────

const STATUS_ORDER = ["menunggu_konfirmasi", "dalam_proses", "pesanan_siap", "selesai"];

/**
 * Upload a base64 data URL to disk. Returns the filename or null.
 */
function uploadDataUrl(dataUrl, keyHint) {
  if (!dataUrl || !dataUrl.startsWith("data:")) return null;
  try {
    const match = dataUrl.match(/^data:(.+?);base64,(.*)$/);
    if (!match) return null;
    const contentType = match[1];
    const buffer = Buffer.from(match[2], "base64");
    const ext = contentType.split("/")[1]?.split("+")[0] ?? "bin";
    const filename = `${keyHint}-${crypto.randomUUID()}.${ext}`;
    // Sanitize filename to remove path separators
    const safeFilename = filename.replace(/[/\\]/g, "-");
    writeFileSync(join(uploadPath, safeFilename), buffer);
    return safeFilename;
  } catch (e) {
    console.error(`Upload error (${keyHint}):`, e.message);
    return null;
  }
}

/**
 * Build a full URL for an uploaded file.
 */
function fileUrl(req, filename) {
  if (!filename) return null;
  return `${req.protocol}://${req.get("host")}/uploads/${filename}`;
}

/**
 * Convert a DB order row into the client-facing order shape.
 */
function hydrateOrder(req, row) {
  return {
    id: row.id,
    orderNumber: row.order_number,
    userId: row.user_id,
    customerEmail: row.customer_email,
    customerName: row.customer_name,
    customerPhone: row.customer_phone,
    customerAddress: row.customer_address,
    product: row.product,
    customization: {
      sizeId: row.customization.sizeId,
      description: row.customization.description ?? "",
      selectedAddonIds: row.customization.selectedAddonIds ?? [],
      referenceImagePreview: fileUrl(req, row.customization.referenceImagePath),
    },
    totalPrice: row.total_price,
    status: row.status,
    createdAt: row.created_at,
    paymentMethod: row.payment_method,
    paymentMethodLabel: row.payment_method_label ?? row.payment_method,
    paymentProofPreview: fileUrl(req, row.payment_proof_path),
  };
}

function computeTotal(product, sizeId, selectedAddonIds) {
  const size = product.sizes.find((s) => s.id === sizeId);
  const multiplier = size?.priceMultiplier ?? 1;
  const flowerPrice = Math.round(product.basePrice * multiplier);
  const addonTotal = (selectedAddonIds ?? []).reduce((sum, id) => {
    const addon = product.addons.find((a) => a.id === id);
    return sum + (addon?.price ?? 0);
  }, 0);
  return flowerPrice + addonTotal;
}

/**
 * Get the authenticated user's full profile from DB.
 * Returns null if not authenticated or profile not found.
 */
async function getAuthProfile(req) {
  if (!req.user?.id) return null;
  const row = await queryOne("SELECT * FROM users WHERE id = $1", [req.user.id]);
  if (!row) return null;
  return {
    id: row.id,
    email: row.email,
    name: row.name,
    role: row.role,
    createdAt: row.created_at,
  };
}

// ─── Routes ─────────────────────────────────────────────

// Health check
app.get("/api/health", (req, res) => {
  res.json({ status: "ok" });
});

// ─── Auth Routes ────────────────────────────────────────

// Login
app.post("/api/auth/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: "Email dan password wajib diisi" });
    }
    const user = await queryOne("SELECT * FROM users WHERE email = $1", [email.toLowerCase()]);
    if (!user) {
      return res.status(401).json({ error: "Email atau password salah" });
    }
    const valid = await verifyPassword(password, user.password_hash);
    if (!valid) {
      return res.status(401).json({ error: "Email atau password salah" });
    }
    const token = generateToken(user);
    const profile = { id: user.id, email: user.email, name: user.name, role: user.role, createdAt: user.created_at };
    return res.json({ token, profile });
  } catch (e) {
    console.error("Login error:", e.message);
    return res.status(500).json({ error: `Login gagal: ${e.message}` });
  }
});

// Check if owner exists
app.get("/api/has-owner", async (req, res) => {
  try {
    const owner = await queryOne("SELECT id FROM users WHERE role = 'owner' LIMIT 1");
    return res.json({ exists: !!owner });
  } catch (e) {
    console.error("Check owner error:", e.message);
    return res.status(500).json({ error: `Gagal cek owner: ${e.message}` });
  }
});

// Bootstrap owner (only works if no owner exists)
app.post("/api/bootstrap/owner", async (req, res) => {
  try {
    const { email, password, name } = req.body;
    if (!email || !password || !name) {
      return res.status(400).json({ error: "Email, password, dan nama wajib diisi untuk bootstrap owner" });
    }
    const existing = await queryOne("SELECT id FROM users WHERE role = 'owner' LIMIT 1");
    if (existing) {
      return res.status(409).json({ error: "Owner sudah ada. Bootstrap hanya bisa dilakukan sekali." });
    }
    const passwordHash = await hashPassword(password);
    const result = await queryOne(
      `INSERT INTO users (email, password_hash, name, role) VALUES ($1, $2, $3, 'owner') RETURNING *`,
      [email.toLowerCase(), passwordHash, name]
    );
    const profile = { id: result.id, email: result.email, name: result.name, role: result.role, createdAt: result.created_at };
    return res.json({ profile });
  } catch (e) {
    console.error("Bootstrap owner error:", e.message);
    return res.status(500).json({ error: `Bootstrap owner gagal: ${e.message}` });
  }
});

// Customer signup
app.post("/api/signup", async (req, res) => {
  try {
    const { email, password, name } = req.body;
    if (!email || !password || !name) {
      return res.status(400).json({ error: "Email, password, dan nama wajib diisi" });
    }
    const existingUser = await queryOne("SELECT id FROM users WHERE email = $1", [email.toLowerCase()]);
    if (existingUser) {
      return res.status(400).json({ error: "Email sudah terdaftar" });
    }
    const passwordHash = await hashPassword(password);
    const result = await queryOne(
      `INSERT INTO users (email, password_hash, name, role) VALUES ($1, $2, $3, 'customer') RETURNING *`,
      [email.toLowerCase(), passwordHash, name]
    );
    const profile = { id: result.id, email: result.email, name: result.name, role: result.role, createdAt: result.created_at };
    return res.json({ profile });
  } catch (e) {
    console.error("Signup error:", e.message);
    return res.status(500).json({ error: `Pendaftaran gagal: ${e.message}` });
  }
});

// Get current user profile
app.get("/api/me", async (req, res) => {
  const profile = await getAuthProfile(req);
  if (!profile) return res.status(401).json({ error: "Unauthorized" });
  return res.json({ profile });
});

// ─── Products ───────────────────────────────────────────

app.get("/api/products", async (req, res) => {
  try {
    const rows = await queryAll("SELECT * FROM products ORDER BY created_at ASC");
    const products = rows.map((r) => ({
      id: r.id,
      name: r.name,
      description: r.description,
      basePrice: r.base_price,
      image: r.image,
      category: r.category,
      sizes: r.sizes,
      addons: r.addons,
    }));
    return res.json({ products });
  } catch (e) {
    console.error("List products error:", e.message);
    return res.status(500).json({ error: `Gagal memuat produk: ${e.message}` });
  }
});

// ─── Payment Methods ────────────────────────────────────

app.get("/api/payment-methods", async (req, res) => {
  try {
    const rows = await queryAll("SELECT * FROM payment_methods ORDER BY id ASC");
    const methods = rows.map((r) => ({
      id: r.id,
      label: r.label,
      detail: r.detail,
      needsProof: r.needs_proof,
    }));
    return res.json({ methods });
  } catch (e) {
    console.error("List payment methods error:", e.message);
    return res.status(500).json({ error: `Gagal memuat metode pembayaran: ${e.message}` });
  }
});

app.put("/api/admin/payment-methods", async (req, res) => {
  try {
    const profile = await getAuthProfile(req);
    if (!profile || (profile.role !== "admin" && profile.role !== "owner")) {
      return res.status(403).json({ error: "Forbidden: hanya admin/owner" });
    }
    const incoming = Array.isArray(req.body.methods) ? req.body.methods : [];
    const methods = incoming
      .filter((m) => m && m.id && m.label)
      .map((m) => ({
        id: String(m.id),
        label: String(m.label),
        detail: String(m.detail ?? ""),
        needsProof: !!m.needsProof,
      }));
    if (methods.length === 0) {
      return res.status(400).json({ error: "Minimal satu metode pembayaran wajib ada" });
    }
    // Replace all: delete existing, insert new
    await query("DELETE FROM payment_methods");
    for (const m of methods) {
      await query(
        `INSERT INTO payment_methods (id, label, detail, needs_proof) VALUES ($1, $2, $3, $4)`,
        [m.id, m.label, m.detail, m.needsProof]
      );
    }
    return res.json({ methods });
  } catch (e) {
    console.error("Save payment methods error:", e.message);
    return res.status(500).json({ error: `Gagal menyimpan metode pembayaran: ${e.message}` });
  }
});

// ─── Orders ─────────────────────────────────────────────

// Create order (customer)
app.post("/api/orders", async (req, res) => {
  try {
    const profile = await getAuthProfile(req);
    if (!profile) return res.status(401).json({ error: "Unauthorized: silakan login untuk membuat pesanan" });

    const { productId, sizeId, description, selectedAddonIds, customerName, customerPhone, customerAddress, paymentMethod, referenceImageBase64, paymentProofBase64 } = req.body;

    // Fetch product
    const productRow = await queryOne("SELECT * FROM products WHERE id = $1", [productId]);
    if (!productRow) return res.status(400).json({ error: `Produk tidak ditemukan: ${productId}` });

    if (!sizeId || !customerName || !customerPhone || !customerAddress || !paymentMethod) {
      return res.status(400).json({ error: "Data pesanan tidak lengkap" });
    }

    // Rebuild product object for snapshot
    const product = {
      id: productRow.id,
      name: productRow.name,
      description: productRow.description,
      basePrice: productRow.base_price,
      image: productRow.image,
      category: productRow.category,
      sizes: productRow.sizes,
      addons: productRow.addons,
    };

    const totalPrice = computeTotal(product, sizeId, selectedAddonIds ?? []);
    const referenceImagePath = uploadDataUrl(referenceImageBase64, `reference-${profile.id}`);
    const paymentProofPath = uploadDataUrl(paymentProofBase64, `proof-${profile.id}`);

    // Get payment method label
    const pmRow = await queryOne("SELECT label FROM payment_methods WHERE id = $1", [paymentMethod]);
    const paymentMethodLabel = pmRow?.label ?? paymentMethod;

    const id = `${Date.now()}-${crypto.randomUUID().slice(0, 8)}`;
    const orderNumber = `FLR-${Date.now().toString().slice(-6)}`;
    const customization = {
      sizeId,
      description: description ?? "",
      selectedAddonIds: selectedAddonIds ?? [],
      referenceImagePath,
    };

    await query(
      `INSERT INTO orders (id, order_number, user_id, customer_email, customer_name, customer_phone, customer_address, product, customization, total_price, status, payment_method, payment_method_label, payment_proof_path)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, 'menunggu_konfirmasi', $11, $12, $13)`,
      [id, orderNumber, profile.id, profile.email, customerName, customerPhone, customerAddress, JSON.stringify(product), JSON.stringify(customization), totalPrice, paymentMethod, paymentMethodLabel, paymentProofPath]
    );

    const orderRow = await queryOne("SELECT * FROM orders WHERE id = $1", [id]);
    return res.json({ order: hydrateOrder(req, orderRow) });
  } catch (e) {
    console.error("Create order error:", e.message);
    return res.status(500).json({ error: `Gagal membuat pesanan: ${e.message}` });
  }
});

// List orders
app.get("/api/orders", async (req, res) => {
  try {
    const profile = await getAuthProfile(req);
    if (!profile) return res.status(401).json({ error: "Unauthorized" });

    let rows;
    if (profile.role === "customer") {
      rows = await queryAll("SELECT * FROM orders WHERE user_id = $1 ORDER BY created_at DESC", [profile.id]);
    } else {
      rows = await queryAll("SELECT * FROM orders ORDER BY created_at DESC");
    }
    const orders = rows.map((r) => hydrateOrder(req, r));
    return res.json({ orders });
  } catch (e) {
    console.error("List orders error:", e.message);
    return res.status(500).json({ error: `Gagal memuat pesanan: ${e.message}` });
  }
});

// Update order status (admin/owner)
app.patch("/api/admin/orders/:id/status", async (req, res) => {
  try {
    const profile = await getAuthProfile(req);
    if (!profile || (profile.role !== "admin" && profile.role !== "owner")) {
      return res.status(403).json({ error: "Forbidden: hanya admin/owner" });
    }
    const { id } = req.params;
    const orderRow = await queryOne("SELECT * FROM orders WHERE id = $1", [id]);
    if (!orderRow) return res.status(404).json({ error: "Pesanan tidak ditemukan" });

    let nextStatus;
    if (req.body.status && STATUS_ORDER.includes(req.body.status)) {
      nextStatus = req.body.status;
    } else {
      const idx = STATUS_ORDER.indexOf(orderRow.status);
      nextStatus = STATUS_ORDER[Math.min(idx + 1, STATUS_ORDER.length - 1)];
    }

    await query("UPDATE orders SET status = $1 WHERE id = $2", [nextStatus, id]);
    const updated = await queryOne("SELECT * FROM orders WHERE id = $1", [id]);
    return res.json({ order: hydrateOrder(req, updated) });
  } catch (e) {
    console.error("Update order status error:", e.message);
    return res.status(500).json({ error: `Gagal memperbarui status: ${e.message}` });
  }
});

// ─── Admin Products ─────────────────────────────────────

app.post("/api/admin/products", async (req, res) => {
  try {
    const profile = await getAuthProfile(req);
    if (!profile || (profile.role !== "admin" && profile.role !== "owner")) {
      return res.status(403).json({ error: "Forbidden: hanya admin/owner" });
    }
    const body = req.body;
    const id = body.id || `p-${crypto.randomUUID().slice(0, 8)}`;
    const name = body.name;
    if (!name) return res.status(400).json({ error: "Nama produk wajib diisi" });

    const COMMON_SIZES_DEFAULT = [
      { id: "S", label: "Kecil", stems: "5–7 tangkai", priceMultiplier: 1 },
      { id: "M", label: "Sedang", stems: "10–15 tangkai", priceMultiplier: 1.7 },
      { id: "L", label: "Besar", stems: "20–25 tangkai", priceMultiplier: 2.4 },
      { id: "XL", label: "Extra Besar", stems: "30+ tangkai", priceMultiplier: 3.2 },
    ];
    const COMMON_ADDONS_DEFAULT = [
      { id: "vase", label: "Vas Bunga", price: 75000 },
      { id: "ribbon", label: "Pita Premium", price: 25000 },
      { id: "card", label: "Kartu Ucapan", price: 15000 },
      { id: "wrap", label: "Wrapping Mewah", price: 40000 },
    ];

    const sizes = body.sizes?.length ? body.sizes : COMMON_SIZES_DEFAULT;
    const addons = body.addons?.length ? body.addons : COMMON_ADDONS_DEFAULT;

    await query(
      `INSERT INTO products (id, name, description, base_price, image, category, sizes, addons)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       ON CONFLICT (id) DO UPDATE SET name=$2, description=$3, base_price=$4, image=$5, category=$6, sizes=$7, addons=$8`,
      [id, name, body.description ?? "", Number(body.basePrice) || 0, body.image ?? "", body.category ?? "Campur", JSON.stringify(sizes), JSON.stringify(addons)]
    );
    const product = {
      id, name, description: body.description ?? "", basePrice: Number(body.basePrice) || 0,
      image: body.image ?? "", category: body.category ?? "Campur", sizes, addons,
    };
    return res.json({ product });
  } catch (e) {
    console.error("Create product error:", e.message);
    return res.status(500).json({ error: `Gagal membuat produk: ${e.message}` });
  }
});

app.patch("/api/admin/products/:id", async (req, res) => {
  try {
    const profile = await getAuthProfile(req);
    if (!profile || (profile.role !== "admin" && profile.role !== "owner")) {
      return res.status(403).json({ error: "Forbidden: hanya admin/owner" });
    }
    const { id } = req.params;
    const existing = await queryOne("SELECT * FROM products WHERE id = $1", [id]);
    if (!existing) return res.status(404).json({ error: "Produk tidak ditemukan" });

    const body = req.body;
    const name = body.name ?? existing.name;
    const description = body.description ?? existing.description;
    const basePrice = body.basePrice !== undefined ? Number(body.basePrice) : existing.base_price;
    const image = body.image ?? existing.image;
    const category = body.category ?? existing.category;
    const sizes = body.sizes ?? existing.sizes;
    const addons = body.addons ?? existing.addons;

    await query(
      `UPDATE products SET name=$1, description=$2, base_price=$3, image=$4, category=$5, sizes=$6, addons=$7 WHERE id=$8`,
      [name, description, basePrice, image, category, JSON.stringify(sizes), JSON.stringify(addons), id]
    );

    const product = { id, name, description, basePrice, image, category, sizes, addons };
    return res.json({ product });
  } catch (e) {
    console.error("Update product error:", e.message);
    return res.status(500).json({ error: `Gagal memperbarui produk: ${e.message}` });
  }
});

app.delete("/api/admin/products/:id", async (req, res) => {
  try {
    const profile = await getAuthProfile(req);
    if (!profile || (profile.role !== "admin" && profile.role !== "owner")) {
      return res.status(403).json({ error: "Forbidden: hanya admin/owner" });
    }
    const { id } = req.params;
    await query("DELETE FROM products WHERE id = $1", [id]);
    return res.json({ ok: true });
  } catch (e) {
    console.error("Delete product error:", e.message);
    return res.status(500).json({ error: `Gagal menghapus produk: ${e.message}` });
  }
});

// ─── Stats (owner only) ─────────────────────────────────

app.get("/api/admin/stats", async (req, res) => {
  try {
    const profile = await getAuthProfile(req);
    if (!profile || profile.role !== "owner") {
      return res.status(403).json({ error: "Forbidden: hanya owner" });
    }

    const orders = await queryAll("SELECT * FROM orders");
    const statusCounts = { menunggu_konfirmasi: 0, dalam_proses: 0, pesanan_siap: 0, selesai: 0 };
    let totalRevenue = 0;
    const dayMap = {};
    const productMap = {};

    for (const o of orders) {
      statusCounts[o.status] = (statusCounts[o.status] ?? 0) + 1;
      totalRevenue += o.total_price ?? 0;
      const day = (o.created_at ? new Date(o.created_at).toISOString() : "").slice(0, 10);
      if (day) {
        dayMap[day] = dayMap[day] ?? { revenue: 0, orders: 0 };
        dayMap[day].revenue += o.total_price ?? 0;
        dayMap[day].orders += 1;
      }
      const pname = o.product?.name ?? "Lainnya";
      productMap[pname] = (productMap[pname] ?? 0) + 1;
    }

    const revenueByDay = Object.entries(dayMap)
      .map(([date, v]) => ({ date, revenue: v.revenue, orders: v.orders }))
      .sort((a, b) => (a.date < b.date ? -1 : 1));
    const topProducts = Object.entries(productMap)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    return res.json({
      stats: { totalOrders: orders.length, totalRevenue, statusCounts, revenueByDay, topProducts },
    });
  } catch (e) {
    console.error("Stats error:", e.message);
    return res.status(500).json({ error: `Gagal memuat statistik: ${e.message}` });
  }
});

// ─── Admin Accounts (owner only) ────────────────────────

app.get("/api/admin/accounts", async (req, res) => {
  try {
    const profile = await getAuthProfile(req);
    if (!profile || profile.role !== "owner") {
      return res.status(403).json({ error: "Forbidden: hanya owner" });
    }
    const rows = await queryAll("SELECT id, email, name, role, created_at FROM users WHERE role = 'admin' ORDER BY created_at ASC");
    const accounts = rows.map((r) => ({
      id: r.id, email: r.email, name: r.name, role: r.role, createdAt: r.created_at,
    }));
    return res.json({ accounts });
  } catch (e) {
    console.error("List admin accounts error:", e.message);
    return res.status(500).json({ error: `Gagal memuat akun admin: ${e.message}` });
  }
});

app.post("/api/admin/accounts", async (req, res) => {
  try {
    const profile = await getAuthProfile(req);
    if (!profile || profile.role !== "owner") {
      return res.status(403).json({ error: "Forbidden: hanya owner" });
    }
    const { email, password, name } = req.body;
    if (!email || !password || !name) {
      return res.status(400).json({ error: "Email, password, dan nama wajib diisi" });
    }
    const existingUser = await queryOne("SELECT id FROM users WHERE email = $1", [email.toLowerCase()]);
    if (existingUser) {
      return res.status(400).json({ error: "Email sudah terdaftar" });
    }
    const passwordHash = await hashPassword(password);
    const result = await queryOne(
      `INSERT INTO users (email, password_hash, name, role) VALUES ($1, $2, $3, 'admin') RETURNING *`,
      [email.toLowerCase(), passwordHash, name]
    );
    const account = { id: result.id, email: result.email, name: result.name, role: result.role, createdAt: result.created_at };
    return res.json({ account });
  } catch (e) {
    console.error("Create admin account error:", e.message);
    return res.status(500).json({ error: `Gagal membuat akun admin: ${e.message}` });
  }
});

app.delete("/api/admin/accounts/:id", async (req, res) => {
  try {
    const profile = await getAuthProfile(req);
    if (!profile || profile.role !== "owner") {
      return res.status(403).json({ error: "Forbidden: hanya owner" });
    }
    const { id } = req.params;
    const target = await queryOne("SELECT * FROM users WHERE id = $1 AND role = 'admin'", [id]);
    if (!target) return res.status(404).json({ error: "Akun admin tidak ditemukan" });
    await query("DELETE FROM users WHERE id = $1", [id]);
    return res.json({ ok: true });
  } catch (e) {
    console.error("Delete admin account error:", e.message);
    return res.status(500).json({ error: `Gagal menghapus akun admin: ${e.message}` });
  }
});

// ─── Start Server ───────────────────────────────────────

async function start() {
  try {
    await initDatabase();
    await runSeeds();
    app.listen(PORT, () => {
      console.log(`\n🚀 Faedah Shop Server running at http://localhost:${PORT}`);
      console.log(`   API base: http://localhost:${PORT}/api`);
      console.log(`   Uploads:  http://localhost:${PORT}/uploads/\n`);
    });
  } catch (err) {
    console.error("Failed to start server:", err.message);
    process.exit(1);
  }
}

start();
