export type OrderStatus = 'menunggu_konfirmasi' | 'dalam_proses' | 'pesanan_siap' | 'selesai';

export interface SizeOption {
  id: string;
  label: string;
  stems: string;
  priceMultiplier: number;
}

export interface Addon {
  id: string;
  label: string;
  price: number;
}

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

export interface Customization {
  sizeId: string;
  description: string;
  referenceImagePreview: string | null;
  selectedAddonIds: string[];
}

export interface Order {
  id: string;
  orderNumber: string;
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

export interface PaymentMethod {
  id: string;
  label: string;
  detail: string;
  needsProof: boolean;
}

export type UserRole = 'owner' | 'admin' | 'customer';

export interface UserProfile {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  createdAt: string;
}

export interface SalesStats {
  totalOrders: number;
  totalRevenue: number;
  statusCounts: Record<OrderStatus, number>;
  revenueByDay: { date: string; revenue: number; orders: number }[];
  topProducts: { name: string; count: number }[];
}
