/**
 * services/apiClient.ts
 * ------------------------------------------------------------------
 * Pembungkus (wrapper) fetch untuk seluruh komunikasi ke REST API
 * Express.js. Tanggung jawab:
 *   - Menambahkan header Authorization: Bearer <JWT> secara otomatis
 *   - Mengirim body JSON ATAU multipart/form-data (upload gambar)
 *   - Timeout request + pesan error berbahasa Indonesia yang jelas
 *   - Mengubah respons error backend ({ error: "..." }) menjadi ApiError
 */
import { API_BASE_URL, REQUEST_TIMEOUT_MS } from "../config/env";
import type { PickedImage } from "../types";

/** Error terstandar agar UI cukup menampilkan `error.message` */
export class ApiError extends Error {
  readonly status: number;
  constructor(message: string, status: number) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

// Token disimpan di memori agar tidak membaca AsyncStorage di setiap request.
// Nilainya diisi oleh AuthContext saat aplikasi dibuka / login / logout.
let authToken: string | null = null;

export function setAuthToken(token: string | null): void {
  authToken = token;
}

type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

interface RequestOptions {
  method?: HttpMethod;
  /** Objek biasa → dikirim sebagai JSON; FormData → dikirim sebagai multipart */
  body?: unknown;
  timeoutMs?: number;
}

/**
 * Melakukan request ke API dan mengembalikan JSON bertipe T.
 * Contoh: const { products } = await apiRequest<{ products: Product[] }>("/products");
 */
export async function apiRequest<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { method = "GET", body, timeoutMs = REQUEST_TIMEOUT_MS } = options;

  const headers: Record<string, string> = {
    Accept: "application/json",
    // Melewati halaman peringatan ngrok (versi gratis) agar respons tetap JSON
    "ngrok-skip-browser-warning": "true",
  };
  if (authToken) headers.Authorization = `Bearer ${authToken}`;

  let payload: FormData | string | undefined;
  if (body instanceof FormData) {
    // PENTING: jangan set Content-Type manual untuk multipart.
    // fetch akan menambahkan "multipart/form-data; boundary=..." secara otomatis.
    payload = body;
  } else if (body !== undefined) {
    headers["Content-Type"] = "application/json";
    payload = JSON.stringify(body);
  }

  // AbortController → membatalkan request jika melewati batas waktu
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  let response: Response;
  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      method,
      headers,
      body: payload,
      signal: controller.signal,
    });
  } catch (err) {
    const aborted = err instanceof Error && err.name === "AbortError";
    throw new ApiError(
      aborted
        ? "Koneksi ke server terlalu lama (timeout). Periksa jaringan Anda."
        : `Tidak dapat terhubung ke server (${API_BASE_URL}). Pastikan backend berjalan dan HP berada di jaringan Wi-Fi yang sama.`,
      0,
    );
  } finally {
    clearTimeout(timer);
  }

  // Backend selalu membalas JSON; jika gagal parse, gunakan objek kosong
  const data = (await response.json().catch(() => ({}))) as { error?: string };

  if (!response.ok) {
    throw new ApiError(data.error ?? `Terjadi kesalahan (HTTP ${response.status})`, response.status);
  }
  return data as T;
}

/**
 * Mengubah gambar hasil Expo Image Picker menjadi "file part" untuk FormData.
 * Di React Native, file dikirim sebagai objek { uri, name, type } —
 * bukan Blob seperti di browser.
 */
export function toFormDataFile(image: PickedImage): Blob {
  return {
    uri: image.uri,
    name: image.fileName,
    type: image.mimeType,
  } as unknown as Blob; // cast: tipe FormData DOM tidak mengenal format RN
}
