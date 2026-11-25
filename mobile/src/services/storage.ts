/**
 * services/storage.ts
 * ------------------------------------------------------------------
 * Penyimpanan persisten berbasis AsyncStorage (pengganti localStorage
 * di web). Dipakai untuk menyimpan token JWT agar pengguna tetap login
 * walaupun aplikasi ditutup.
 */
import AsyncStorage from "@react-native-async-storage/async-storage";

const TOKEN_KEY = "faedah.auth.token";

/** Simpan token JWT setelah login berhasil */
export async function saveToken(token: string): Promise<void> {
  await AsyncStorage.setItem(TOKEN_KEY, token);
}

/** Ambil token JWT (null jika belum login) */
export async function getToken(): Promise<string | null> {
  return AsyncStorage.getItem(TOKEN_KEY);
}

/** Hapus token saat logout atau token kedaluwarsa */
export async function clearToken(): Promise<void> {
  await AsyncStorage.removeItem(TOKEN_KEY);
}
