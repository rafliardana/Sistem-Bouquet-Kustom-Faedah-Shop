/**
 * services/orderService.ts
 * ------------------------------------------------------------------
 * Komunikasi REST API untuk pesanan & metode pembayaran:
 *   GET   /api/payment-methods         → daftar metode bayar (BCA, Mandiri, GoPay, OVO, COD)
 *   POST  /api/orders                  → buat pesanan (multipart/form-data + gambar biner)
 *   GET   /api/orders                  → daftar pesanan (milik pelanggan atau semua untuk admin)
 *   PATCH /api/admin/orders/:id/status → ubah status pesanan (admin/owner)
 */
import { apiRequest, toFormDataFile } from "./apiClient";
import type { Order, OrderStatus, PaymentMethod, PickedImage } from "../types";

export interface CreateOrderInput {
  productId: string;
  sizeId: string;
  description: string;
  selectedAddonIds: string[];
  customerName: string;
  customerPhone: string;
  customerAddress: string;
  paymentMethod: string;
  referenceImage: PickedImage | null;
  paymentProof: PickedImage | null;
}

/** Mengambil metode pembayaran aktif dari backend */
export async function fetchPaymentMethods(): Promise<PaymentMethod[]> {
  const { methods } = await apiRequest<{ methods: PaymentMethod[] }>("/payment-methods");
  return methods;
}

/**
 * Membuat pesanan baru menggunakan multipart/form-data.
 * Gambar referensi & bukti transfer dikirim sebagai file biner (bukan base64)
 * sehingga lebih hemat kuota dan memori pada perangkat mobile.
 */
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

  if (input.referenceImage) {
    form.append("referenceImage", toFormDataFile(input.referenceImage));
  }
  if (input.paymentProof) {
    form.append("paymentProof", toFormDataFile(input.paymentProof));
  }

  const { order } = await apiRequest<{ order: Order }>("/orders", {
    method: "POST",
    body: form,
    timeoutMs: 30000, // upload gambar diberi batas waktu lebih longgar (30 detik)
  });
  return order;
}

/** Mengambil daftar pesanan (otomatis terfilter sesuai role JWT di backend) */
export async function fetchOrders(): Promise<Order[]> {
  const { orders } = await apiRequest<{ orders: Order[] }>("/orders");
  return orders;
}

/** Memperbarui status pesanan (khusus admin/owner) */
export async function updateOrderStatus(orderId: string, status: OrderStatus): Promise<Order> {
  const { order } = await apiRequest<{ order: Order }>(`/admin/orders/${orderId}/status`, {
    method: "PATCH",
    body: { status },
  });
  return order;
}
