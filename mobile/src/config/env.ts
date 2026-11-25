// Menentukan alamat API Express yang dipakai aplikasi.
// Urutan prioritas:
//   1. EXPO_PUBLIC_API_URL dari file .env (paling eksplisit)
//   2. IP komputer yang menjalankan Metro (otomatis saat dev di HP fisik)
//   3. Fallback emulator: Android memakai 10.0.2.2, iOS memakai localhost
import Constants from "expo-constants";
import { Platform } from "react-native";

const SERVER_PORT = 3001;

function resolveApiUrl(): string {
  const fromEnv = process.env.EXPO_PUBLIC_API_URL;
  if (fromEnv) return fromEnv.replace(/\/$/, "");

  // hostUri berbentuk "192.168.1.10:8081" saat menjalankan `expo start`.
  const hostUri = Constants.expoConfig?.hostUri;
  const host = hostUri?.split(":")[0];
  if (host && host !== "localhost" && host !== "127.0.0.1") {
    return `http://${host}:${SERVER_PORT}/api`;
  }

  const fallbackHost = Platform.OS === "android" ? "10.0.2.2" : "localhost";
  return `http://${fallbackHost}:${SERVER_PORT}/api`;
}

export const API_URL = resolveApiUrl();
export const REQUEST_TIMEOUT_MS = 20000;
