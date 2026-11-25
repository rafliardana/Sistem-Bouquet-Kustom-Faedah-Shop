/**
 * types/index.ts
 * ------------------------------------------------------------------
 * Tipe domain aplikasi mobile. Struktur dibuat IDENTIK dengan
 * src/app/components/types.ts versi web dan respons REST API
 * Express (server/server.js) agar data dapat dipakai bersama
 * tanpa transformasi tambahan.
 */

/** Status pesanan sesuai kolom `orders.status` di PostgreSQL */
export type OrderStatus =
  | "menunggu_konfirmasi"
  | "dalam_proses"
  | "pesanan_siap"
  | "selesai";

/** Pilihan ukuran buket (S/M/L/XL) beserta pengali harga */
export interface SizeOption {
  id: string;
  label: string;
  stems: string;
  priceMultiplier: number;
}

/** Tambahan (addons) seperti pita, kartu ucapan, vas */
export interface Addon {
  id: string;
  label: string;
  price: number;
}

/** Produk buket pada katalog */
export interface Product {
  id: string;
  name: string;
  description: string;
  basePrice: number;
  image: string;
  category: string;
  sizes: SizeOption[];
  addons: Addon[];
}

/** Detail kustomisasi yang tersimpan pada pesanan */
export interface Customization {
  sizeId: string;
  description: string;
  referenceImagePreview: string | null;
  selectedAddonIds: string[];
}

/** Pesanan (hasil hydrateOrder di backend) */
export interface Order {
  id: string;
  orderNumber: string; // format FLR-XXXXXX
  userId: string;
  customerEmail: string;
  product: Product;
  customization: Customization;
  totalPrice: number;
  status: OrderStatus;
  createdAt: string;
  customerName: string;
  customerPhone: string;
  customerAddress: string;
  paymentMethod: string;
  paymentMethodLabel?: string;
  paymentProofPreview: string | null;
}

/** Metode pembayaran (BCA, Mandiri, OVO, GoPay, COD) */
export interface PaymentMethod {
  id: string;
  label: string;
  detail: string;
  needsProof: boolean;
}

export type UserRole = "owner" | "admin" | "customer";

/** Profil pengguna yang login */
export interface UserProfile {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  createdAt: string;
}

// ─── Tipe khusus mobile ─────────────────────────────────────────

/** Gambar hasil Expo Image Picker yang siap diunggah (multipart) */
export interface PickedImage {
  uri: string;
  mimeType: string;
  fileName: string;
}

/** Draf pesanan dari halaman Kustomisasi → dibawa ke Checkout */
export interface OrderDraft {
  productId: string;
  sizeId: string;
  selectedAddonIds: string[];
  description: string;
  referenceImage: PickedImage | null;
}
