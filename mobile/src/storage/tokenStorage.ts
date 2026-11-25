// Persistensi JWT menggunakan AsyncStorage (pengganti localStorage di web).
// Token tetap tersimpan setelah aplikasi ditutup, sehingga pengguna tidak
// perlu login ulang selama token belum kedaluwarsa (7 hari dari server).
import AsyncStorage from "@react-native-async-storage/async-storage";

const TOKEN_KEY = "faedah_auth_token";

export async function getToken(): Promise<string | null> {
  return AsyncStorage.getItem(TOKEN_KEY);
}

export async function setToken(token: string): Promise<void> {
  await AsyncStorage.setItem(TOKEN_KEY, token);
}

export async function clearToken(): Promise<void> {
  await AsyncStorage.removeItem(TOKEN_KEY);
}
