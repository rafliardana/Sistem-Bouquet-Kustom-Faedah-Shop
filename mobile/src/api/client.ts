// HTTP client dasar untuk semua panggilan ke server Express.
// Tugasnya: menambahkan header Authorization (JWT), memasang timeout,
// mengubah body JSON / FormData, dan menerjemahkan error server ke Bahasa Indonesia.
import { API_URL, REQUEST_TIMEOUT_MS } from "@/config/env";
import { getToken } from "@/storage/tokenStorage";

export class ApiError extends Error {
  constructor(message: string, public status: number) {
    super(message);
    this.name = "ApiError";
  }
}

// Dipanggil AuthContext saat server membalas 401 (token kedaluwarsa).
let onUnauthorized: (() => void) | null = null;
export function setUnauthorizedHandler(handler: (() => void) | null) {
  onUnauthorized = handler;
}

type Method = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

interface RequestOptions {
  method?: Method;
  body?: unknown; // objek biasa -> JSON, FormData -> multipart
}

export async function apiRequest<T>(path: string, { method = "GET", body }: RequestOptions = {}): Promise<T> {
  const headers: Record<string, string> = { Accept: "application/json" };
  const token = await getToken();
  if (token) headers.Authorization = `Bearer ${token}`;

  let payload: BodyInit | undefined;
  if (body instanceof FormData) {
    // Jangan set Content-Type manual: fetch akan menambahkan boundary multipart sendiri.
    payload = body;
  } else if (body !== undefined) {
    headers["Content-Type"] = "application/json";
    payload = JSON.stringify(body);
  }

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  let res: Response;
  try {
    res = await fetch(`${API_URL}${path}`, { method, headers, body: payload, signal: controller.signal });
  } catch (e) {
    const aborted = e instanceof Error && e.name === "AbortError";
    throw new ApiError(
      aborted
        ? "Koneksi ke server terlalu lama. Coba lagi."
        : `Tidak dapat terhubung ke server (${API_URL}). Pastikan server berjalan dan HP satu jaringan.`,
      0,
    );
  } finally {
    clearTimeout(timer);
  }

  const text = await res.text();
  let data: any = {};
  try {
    data = text ? JSON.parse(text) : {};
  } catch {
    data = { error: text };
  }

  if (!res.ok) {
    if (res.status === 401 && token) onUnauthorized?.();
    throw new ApiError(data?.error ?? `Terjadi kesalahan (${res.status})`, res.status);
  }
  return data as T;
}
