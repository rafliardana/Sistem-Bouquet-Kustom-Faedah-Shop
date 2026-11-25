/**
 * config/env.ts
 * ------------------------------------------------------------------
 * Menentukan alamat REST API backend Express.js.
 *
 * Masalah utama di mobile: `localhost` pada HP/emulator menunjuk ke
 * perangkat itu sendiri, BUKAN ke laptop tempat backend berjalan.
 * Karena itu alamat API ditentukan dengan urutan prioritas:
 *
 *   1. EXPO_PUBLIC_API_URL  (file .env) — mis. URL ngrok atau IP LAN manual
 *   2. IP LAN laptop yang dideteksi otomatis dari Expo dev server (hostUri)
 *   3. Fallback emulator: 10.0.2.2 (Android Emulator) / localhost (iOS Simulator)
 */
import Constants from "expo-constants";
import { Platform } from "react-native";

/** Port default backend Express (server/.env → PORT=3001) */
const API_PORT = 3001;

function resolveServerUrl(): string {
  // 1) Konfigurasi eksplisit dari .env (prefix EXPO_PUBLIC_ wajib agar terbaca di app)
  const fromEnv = process.env.EXPO_PUBLIC_API_URL?.trim();
  if (fromEnv) return fromEnv.replace(/\/+$/, "").replace(/\/api$/, "");

  // 2) hostUri berisi "IP_LAPTOP:8081" saat app dibuka lewat Expo Go / dev build
  const hostUri = Constants.expoConfig?.hostUri ?? "";
  const host = hostUri.split(":")[0];
  const isTunnel = host.endsWith(".exp.direct"); // mode --tunnel tidak membuka port 3001
  if (host && !isTunnel && host !== "localhost" && host !== "127.0.0.1") {
    return `http://${host}:${API_PORT}`;
  }

  // 3) Fallback untuk emulator/simulator
  return Platform.OS === "android"
    ? `http://10.0.2.2:${API_PORT}` // alias localhost laptop dari Android Emulator
    : `http://localhost:${API_PORT}`; // iOS Simulator berbagi jaringan dengan Mac
}

/** URL dasar server, mis. http://192.168.1.10:3001 */
export const SERVER_URL = resolveServerUrl();

/** URL dasar REST API, mis. http://192.168.1.10:3001/api */
export const API_BASE_URL = `${SERVER_URL}/api`;

/** Batas waktu request (ms) agar UI tidak menggantung saat jaringan buruk */
export const REQUEST_TIMEOUT_MS = 15000;
