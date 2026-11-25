/**
 * theme/shadows.ts
 * ------------------------------------------------------------------
 * Bayangan (shadow) lintas platform.
 * React Native (New Architecture) mendukung properti `boxShadow`
 * bergaya CSS di Android & iOS, sehingga kartu tampil sama di kedua
 * platform (dulu iOS memakai shadow* dan Android memakai elevation).
 */
import type { ViewStyle } from "react-native";

export const shadows = {
  card: { boxShadow: "0px 2px 10px rgba(17, 17, 51, 0.06)" } as ViewStyle,
  raised: { boxShadow: "0px 6px 20px rgba(82, 80, 243, 0.25)" } as ViewStyle,
};
