/**
 * screens/catalog/CatalogScreen.tsx
 * ------------------------------------------------------------------
 * Halaman Katalog Interaktif (tab pertama Pelanggan).
 * Fitur:
 *   - Banner sapaan & keunggulan Faedah Shop
 *   - Pencarian real-time (nama & deskripsi)
 *   - Filter kategori berbentuk chip yang dapat digeser
 *   - Grid produk responsif: 2 kolom (ponsel) / 3 kolom (tablet)
 *   - Pull-to-refresh, skeleton loading, status kosong & error
 *   - Tap produk → langsung ke tab Kustomisasi dengan productId
 */
import React, { useCallback, useDeferredValue, useMemo, useState } from "react";
import {
  FlatList,
  Platform,
  RefreshControl,
  Text,
  View,
  useWindowDimensions,
  type ListRenderItem,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import CategoryChips from "../../components/CategoryChips";
import EmptyState from "../../components/EmptyState";
import ProductCard from "../../components/ProductCard";
import ProductCardSkeleton from "../../components/ProductCardSkeleton";
import SearchBar from "../../components/SearchBar";
import { ALL_CATEGORIES, SHOP_HIGHLIGHTS } from "../../constants/catalog";
import { useAuth } from "../../context/AuthContext";
import { useProducts } from "../../hooks/useProducts";
import type { CustomerTabScreenProps } from "../../navigation/types";
import { colors } from "../../theme/colors";
import { shadows } from "../../theme/shadows";
import type { Product } from "../../types";

/** Jarak tepi layar & jarak antar kartu (dp) */
const H_PADDING = 20;
const GAP = 14;
/** Lebar minimum layar untuk dianggap tablet */
const TABLET_BREAKPOINT = 768;

export default function CatalogScreen({ navigation }: CustomerTabScreenProps<"Katalog">) {
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions(); // otomatis update saat rotasi layar
  const { user } = useAuth();
  const { products, loading, refreshing, error, refresh, retry } = useProducts();

  const [category, setCategory] = useState<string>(ALL_CATEGORIES);
  const [query, setQuery] = useState("");
  // useDeferredValue (React 19): input tetap responsif, filter dihitung belakangan
  const deferredQuery = useDeferredValue(query);

  // ── Layout responsif ───────────────────────────────────────────
  const numColumns = width >= TABLET_BREAKPOINT ? 3 : 2;
  const cardWidth = Math.floor((width - H_PADDING * 2 - GAP * (numColumns - 1)) / numColumns);

  // ── Data turunan (di-memo agar tidak dihitung ulang setiap render) ──
  const categories = useMemo(
    () => [ALL_CATEGORIES, ...Array.from(new Set(products.map((p) => p.category)))],
    [products],
  );

  const filteredProducts = useMemo(() => {
    const q = deferredQuery.trim().toLowerCase();
    return products.filter((p) => {
      const matchCategory = category === ALL_CATEGORIES || p.category === category;
      const matchQuery =
        q.length === 0 || p.name.toLowerCase().includes(q) || p.description.toLowerCase().includes(q);
      return matchCategory && matchQuery;
    });
  }, [products, category, deferredQuery]);

  // ── Handler ───────────────────────────────────────────────────
  const handleSelectProduct = useCallback(
    (product: Product) => navigation.navigate("Kustomisasi", { productId: product.id }),
    [navigation],
  );

  const resetFilter = useCallback(() => {
    setQuery("");
    setCategory(ALL_CATEGORIES);
  }, []);

  const renderItem = useCallback<ListRenderItem<Product>>(
    ({ item }) => <ProductCard product={item} width={cardWidth} onPress={handleSelectProduct} />,
    [cardWidth, handleSelectProduct],
  );

  // ── Header daftar: sapaan, banner, pencarian, kategori ──────────
  const listHeader = (
    <View style={{ paddingTop: insets.top + 12 }} className="gap-4 pb-4">
      {/* Sapaan */}
      <View className="flex-row items-center justify-between px-5">
        <View className="flex-1">
          <Text className="text-[13px] text-ink-secondary">
            Halo, {user?.name?.split(" ")[0] ?? "Pelanggan"} 👋
          </Text>
          <Text className="text-[22px] font-extrabold text-ink">Faedah Shop</Text>
        </View>
        <View className="h-11 w-11 items-center justify-center rounded-full bg-brand-tertiary">
          <Text className="text-xl">💐</Text>
        </View>
      </View>

      {/* Banner promosi */}
      <View className="mx-5 rounded-card bg-brand p-5" style={shadows.raised}>
        <View className="self-start rounded-full bg-white/20 px-3 py-1">
          <Text className="text-[11px] font-bold text-white">Boutique Bunga Premium</Text>
        </View>
        <Text className="mt-3 text-[19px] font-extrabold leading-6 text-white">
          Rangkaian Bunga Spesial untuk Momen Istimewa
        </Text>
        <Text className="mt-1 text-[12px] leading-5 text-white/80">
          Pilih desain favoritmu, sesuaikan ukuran & tambahan, lalu kami rangkai dengan penuh cinta.
        </Text>
        <View className="mt-3 flex-row flex-wrap gap-2">
          {SHOP_HIGHLIGHTS.map((h) => (
            <View key={h.label} className="flex-row items-center gap-1 rounded-full bg-white/15 px-2.5 py-1">
              <Text className="text-[11px]">{h.icon}</Text>
              <Text className="text-[11px] font-semibold text-white">{h.label}</Text>
            </View>
          ))}
        </View>
      </View>

      {/* Pencarian */}
      <View className="px-5">
        <SearchBar value={query} onChangeText={setQuery} />
      </View>

      {/* Filter kategori */}
      {products.length > 0 && (
        <CategoryChips categories={categories} selected={category} onSelect={setCategory} />
      )}

      {/* Judul & jumlah hasil */}
      {!loading && products.length > 0 && (
        <View className="px-5">
          <Text className="text-[17px] font-bold text-ink">Katalog Produk</Text>
          <Text className="mt-0.5 text-[12px] text-ink-secondary">
            {filteredProducts.length} produk ditemukan
            {category !== ALL_CATEGORIES ? ` di kategori "${category}"` : ""}
          </Text>
        </View>
      )}

      {/* Error ringan saat refresh gagal tetapi data lama masih ada */}
      {error && products.length > 0 && (
        <View className="mx-5 rounded-xl bg-danger-bg px-3 py-2">
          <Text className="text-[12px] text-danger">{error}</Text>
        </View>
      )}
    </View>
  );

  // ── Konten saat daftar kosong: skeleton / error / tidak ditemukan ──
  const listEmpty = loading ? (
    <View className="flex-row flex-wrap px-5" style={{ gap: GAP }}>
      {Array.from({ length: numColumns * 2 }).map((_, i) => (
        <ProductCardSkeleton key={i} width={cardWidth} />
      ))}
    </View>
  ) : error ? (
    <View className="px-5">
      <EmptyState emoji="📡" title="Gagal Memuat Katalog" message={error} actionLabel="Coba Lagi" onAction={retry} />
    </View>
  ) : (
    <View className="px-5">
      <EmptyState
        emoji="🥀"
        title="Produk Tidak Ditemukan"
        message="Coba kata kunci lain atau pilih kategori yang berbeda."
        actionLabel="Reset Filter"
        onAction={resetFilter}
      />
    </View>
  );

  return (
    <View className="flex-1 bg-surface-secondary">
      <FlatList
        // key berubah saat jumlah kolom berubah (syarat FlatList numColumns)
        key={`grid-${numColumns}`}
        data={filteredProducts}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        numColumns={numColumns}
        columnWrapperStyle={{ gap: GAP, paddingHorizontal: H_PADDING }}
        ItemSeparatorComponent={RowSeparator}
        ListHeaderComponent={listHeader}
        ListEmptyComponent={listEmpty}
        contentContainerStyle={{ paddingBottom: 24 }}
        // UX: keyboard tertutup saat menggulir, tap kartu tetap berfungsi
        keyboardDismissMode="on-drag"
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        // Optimasi virtualisasi daftar
        initialNumToRender={6}
        maxToRenderPerBatch={6}
        windowSize={7}
        removeClippedSubviews={Platform.OS === "android"}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={refresh}
            tintColor={colors.brand} // iOS
            colors={[colors.brand]} // Android
            progressViewOffset={insets.top}
          />
        }
      />
    </View>
  );
}

/** Jarak vertikal antar baris grid */
function RowSeparator() {
  return <View style={{ height: GAP }} />;
}
