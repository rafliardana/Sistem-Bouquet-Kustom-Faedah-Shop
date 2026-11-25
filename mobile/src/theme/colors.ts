/**
 * colors.ts
 * ------------------------------------------------------------------
 * Re-export palette dengan tipe TypeScript.
 * Dipakai untuk properti yang tidak menerima className, misalnya
 * warna ikon, tab bar React Navigation, dan RefreshControl.
 */
import { palette } from "./palette";

export const colors = palette;
export type ColorName = keyof typeof colors;
