import { SERVER_URL } from "./config";
import type { Order, Product, OrderStatus, UserProfile, SalesStats, PaymentMethod } from "../components/types";

// ── Token management ──
const TOKEN_KEY = "faedah_auth_token";

export function getStoredToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function setStoredToken(token: string): void {
  localStorage.setItem(TOKEN_KEY, token);
}

export function clearStoredToken(): void {
  localStorage.removeItem(TOKEN_KEY);
}

// Resolve the bearer token from localStorage.
function authHeader(): string {
  const token = getStoredToken();
  return token ? `Bearer ${token}` : "";
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string> | undefined),
  };
  const token = authHeader();
  if (token) {
    headers.Authorization = token;
  }
  let res: Response;
  try {
    res = await fetch(`${SERVER_URL}${path}`, { ...options, headers });
  } catch (e) {
    console.error(`Network error calling ${path}:`, e);
    throw new Error(`Tidak dapat terhubung ke server: ${e}`);
  }
  const text = await res.text();
  let body: any = {};
  try {
    body = text ? JSON.parse(text) : {};
  } catch {
    body = { raw: text };
  }
  if (!res.ok) {
    const message = body?.error ?? body?.raw ?? res.statusText;
    console.error(`Server error ${res.status} on ${path}: ${message}`);
    throw new Error(message);
  }
  return body as T;
}

// ── Auth / Login ──
export async function loginUser(email: string, password: string): Promise<{ token: string; profile: UserProfile }> {
  const result = await request<{ token: string; profile: UserProfile }>("/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
  setStoredToken(result.token);
  return result;
}

// ── Products ──
export async function listProducts(): Promise<Product[]> {
  const { products } = await request<{ products: Product[] }>("/products");
  return products;
}
export async function createProduct(product: Partial<Product>): Promise<Product> {
  const { product: created } = await request<{ product: Product }>("/admin/products", {
    method: "POST",
    body: JSON.stringify(product),
  });
  return created;
}
export async function updateProduct(id: string, product: Partial<Product>): Promise<Product> {
  const { product: updated } = await request<{ product: Product }>(`/admin/products/${id}`, {
    method: "PATCH",
    body: JSON.stringify(product),
  });
  return updated;
}
export async function deleteProduct(id: string): Promise<void> {
  await request(`/admin/products/${id}`, { method: "DELETE" });
}

// ── Orders ──
export interface CreateOrderInput {
  productId: string;
  sizeId: string;
  description: string;
  selectedAddonIds: string[];
  customerName: string;
  customerPhone: string;
  customerAddress: string;
  paymentMethod: string;
  referenceImageBase64?: string | null;
  paymentProofBase64?: string | null;
}
export async function createOrder(input: CreateOrderInput): Promise<Order> {
  const { order } = await request<{ order: Order }>("/orders", {
    method: "POST",
    body: JSON.stringify(input),
  });
  return order;
}
export async function listOrders(): Promise<Order[]> {
  const { orders } = await request<{ orders: Order[] }>("/orders");
  return orders;
}
export async function updateOrderStatus(id: string, status?: OrderStatus): Promise<Order> {
  const { order } = await request<{ order: Order }>(`/admin/orders/${id}/status`, {
    method: "PATCH",
    body: JSON.stringify(status ? { status } : {}),
  });
  return order;
}

// ── Auth / profile ──
export async function hasOwner(): Promise<boolean> {
  const { exists } = await request<{ exists: boolean }>("/has-owner");
  return exists;
}
export async function bootstrapOwner(email: string, password: string, name: string): Promise<UserProfile> {
  const { profile } = await request<{ profile: UserProfile }>("/bootstrap/owner", {
    method: "POST",
    body: JSON.stringify({ email, password, name }),
  });
  return profile;
}
export async function signupCustomer(email: string, password: string, name: string): Promise<UserProfile> {
  const { profile } = await request<{ profile: UserProfile }>("/signup", {
    method: "POST",
    body: JSON.stringify({ email, password, name }),
  });
  return profile;
}
export async function getProfile(): Promise<UserProfile> {
  const { profile } = await request<{ profile: UserProfile }>("/me");
  return profile;
}

// ── Payment methods ──
export async function listPaymentMethods(): Promise<PaymentMethod[]> {
  const { methods } = await request<{ methods: PaymentMethod[] }>("/payment-methods");
  return methods;
}
export async function savePaymentMethods(methods: PaymentMethod[]): Promise<PaymentMethod[]> {
  const { methods: saved } = await request<{ methods: PaymentMethod[] }>("/admin/payment-methods", {
    method: "PUT",
    body: JSON.stringify({ methods }),
  });
  return saved;
}

// ── Stats (owner) ──
export async function getStats(): Promise<SalesStats> {
  const { stats } = await request<{ stats: SalesStats }>("/admin/stats");
  return stats;
}

// ── Admin accounts (owner) ──
export async function listAdminAccounts(): Promise<UserProfile[]> {
  const { accounts } = await request<{ accounts: UserProfile[] }>("/admin/accounts");
  return accounts;
}
export async function createAdminAccount(email: string, password: string, name: string): Promise<UserProfile> {
  const { account } = await request<{ account: UserProfile }>("/admin/accounts", {
    method: "POST",
    body: JSON.stringify({ email, password, name }),
  });
  return account;
}
export async function deleteAdminAccount(id: string): Promise<void> {
  await request(`/admin/accounts/${id}`, { method: "DELETE" });
}
