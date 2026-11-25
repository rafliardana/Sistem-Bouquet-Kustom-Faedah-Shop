// Definisi tipe parameter setiap route. Dengan ini TypeScript memeriksa
// bahwa navigate("Customize", { productId }) selalu membawa parameter yang benar.
import type { NavigatorScreenParams } from "@react-navigation/native";

// Stack di dalam tab Katalog: Katalog -> Kustomisasi -> Checkout
export type CatalogStackParamList = {
  Catalog: undefined;
  Customize: { productId: string };
  Checkout: undefined;
};

export type CustomerTabParamList = {
  KatalogTab: NavigatorScreenParams<CatalogStackParamList>;
  PesananTab: { newOrderId?: string } | undefined;
  AkunTab: undefined;
};

// Stack di dalam tab Produk (admin): Daftar Produk -> Form Tambah/Edit
export type AdminProductStackParamList = {
  ProductList: undefined;
  ProductForm: { productId?: string } | undefined; // tanpa productId = tambah baru
};

export type AdminTabParamList = {
  DashboardTab: undefined;
  OrdersTab: undefined;
  ProductsTab: NavigatorScreenParams<AdminProductStackParamList>;
  AdminAccountTab: undefined;
};

// Navigator paling luar. Login & Register tampil sebagai modal di atas tab.
// CustomerMain dan AdminMain dipilih berdasarkan role pengguna.
export type RootStackParamList = {
  CustomerMain: NavigatorScreenParams<CustomerTabParamList>;
  AdminMain: NavigatorScreenParams<AdminTabParamList>;
  Login: undefined;
  Register: undefined;
};

// Registrasi global agar useNavigation() otomatis bertipe RootStackParamList.
declare global {
  namespace ReactNavigation {
    interface RootParamList extends RootStackParamList {}
  }
}
