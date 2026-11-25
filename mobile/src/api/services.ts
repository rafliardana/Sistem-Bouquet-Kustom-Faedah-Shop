// Kumpulan fungsi per endpoint REST server/server.js.
// Layar tidak memanggil fetch langsung; semua lewat fungsi di sini
// sehingga perubahan API cukup diubah di satu tempat.
import { apiRequest } from "./client";
import type {
  Order, OrderStatus, PaymentMethod, PickedImage, Product, SalesStats, UserProfile,
} from "@/types";

// ── Autentikasi ──
export const login = (email: string, password: string) =>
  apiRequest<{ token: string; profile: UserProfile }>("/auth/login", {
    method: "POST",
    body: { email, password },
  });

export const signup = (name: string, email: string, password: string) =>
  apiRequest<{ profile: UserProfile }>("/signup", { method: "POST", body: { name, email, password } });

export const getMe = () => apiRequest<{ profile: UserProfile }>("/me").then((r) => r.profile);

// ── Produk & metode pembayaran (publik) ──
export const listProducts = () => apiRequest<{ products: Product[] }>("/products").then((r) => r.products);

export const listPaymentMethods = () =>
  apiRequest<{ methods: PaymentMethod[] }>("/payment-methods").then((r) => r.methods);

// ── Pesanan ──
export interface CreateOrderInput {
  productId: string;
  sizeId: string;
  description: string;
  selectedAddonIds: string[];
  customerName: string;
  customerPhone: string;
  customerAddress: string;
  paymentMethod: string;
  referenceImage?: PickedImage | null;
  paymentProof?: PickedImage | null;
}

// Mengubah gambar lokal menjadi "file part" FormData versi React Native.
function appendImage(form: FormData, field: string, image?: PickedImage | null) {
  if (!image) return;
  form.append(field, { uri: image.uri, name: image.name, type: image.mimeType } as unknown as Blob);
}

// Membuat pesanan via multipart/form-data (field file: referenceImage, paymentProof).
export async function createOrder(input: CreateOrderInput): Promise<Order> {
  const form = new FormData();
  form.append("productId", input.productId);
  form.append("sizeId", input.sizeId);
  form.append("description", input.description);
  form.append("selectedAddonIds", JSON.stringify(input.selectedAddonIds));
  form.append("customerName", input.customerName);
  form.append("customerPhone", input.customerPhone);
  form.append("customerAddress", input.customerAddress);
  form.append("paymentMethod", input.paymentMethod);
  appendImage(form, "referenceImage", input.referenceImage);
  appendImage(form, "paymentProof", input.paymentProof);
  const { order } = await apiRequest<{ order: Order }>("/orders", { method: "POST", body: form });
  return order;
}

// Customer: hanya pesanan miliknya. Admin/owner: semua pesanan.
export const listOrders = () => apiRequest<{ orders: Order[] }>("/orders").then((r) => r.orders);

// ── Admin / Owner ──
export const updateOrderStatus = (id: string, status: OrderStatus) =>
  apiRequest<{ order: Order }>(`/admin/orders/${encodeURIComponent(id)}/status`, {
    method: "PATCH",
    body: { status },
  }).then((r) => r.order);

export type ProductInput = Pick<Product, "name" | "description" | "basePrice" | "image" | "category">;

export const createProduct = (input: ProductInput) =>
  apiRequest<{ product: Product }>("/admin/products", { method: "POST", body: input }).then((r) => r.product);

export const updateProduct = (id: string, input: Partial<ProductInput>) =>
  apiRequest<{ product: Product }>(`/admin/products/${encodeURIComponent(id)}`, {
    method: "PATCH",
    body: input,
  }).then((r) => r.product);

// Khusus owner; admin biasa akan mendapat 403.
export const getStats = () => apiRequest<{ stats: SalesStats }>("/admin/stats").then((r) => r.stats);
