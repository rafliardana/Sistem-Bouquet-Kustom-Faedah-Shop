/**
 * navigation/types.ts
 * ------------------------------------------------------------------
 * Definisi tipe parameter setiap layar (type-safe navigation).
 * TypeScript akan memberi error jika kita menavigasi ke layar yang
 * tidak ada atau mengirim parameter yang salah.
 */
import type { BottomTabScreenProps } from "@react-navigation/bottom-tabs";
import type { CompositeScreenProps, NavigatorScreenParams } from "@react-navigation/native";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import type { OrderDraft } from "../types";

/** Tab bawah untuk Pelanggan */
export type CustomerTabParamList = {
  Katalog: undefined;
  Kustomisasi: { productId?: string } | undefined;
  LacakPesanan: { orderNumber?: string } | undefined;
  Profil: undefined;
};

/** Stack utama: membungkus tab + layar penuh (Checkout, Admin) */
export type RootStackParamList = {
  MainTabs: NavigatorScreenParams<CustomerTabParamList> | undefined;
  Checkout: { draft: OrderDraft };
  AdminDashboard: undefined;
};

/** Props layar di dalam stack */
export type RootStackScreenProps<T extends keyof RootStackParamList> = NativeStackScreenProps<
  RootStackParamList,
  T
>;

/** Props layar tab — digabung dengan stack agar bisa navigate ke Checkout/Admin */
export type CustomerTabScreenProps<T extends keyof CustomerTabParamList> = CompositeScreenProps<
  BottomTabScreenProps<CustomerTabParamList, T>,
  RootStackScreenProps<keyof RootStackParamList>
>;

// Registrasi global agar useNavigation() otomatis ter-type
declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace ReactNavigation {
    // eslint-disable-next-line @typescript-eslint/no-empty-object-type
    interface RootParamList extends RootStackParamList {}
  }
}
