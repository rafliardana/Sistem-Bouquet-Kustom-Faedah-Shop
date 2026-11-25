// Layar Katalog Bouquet (pengganti Catalog.tsx + StorefrontPage.tsx web).
// - Pencarian nama/deskripsi dan filter kategori dihitung dengan useMemo.
// - FlatList 2 kolom: hanya item yang terlihat yang dirender (virtualisasi).
// - Tarik ke bawah (pull-to-refresh) untuk memuat ulang produk dari server.
import { useCallback, useEffect, useMemo, useState } from "react";
import { FlatList, RefreshControl, ScrollView, Text, TextInput, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { Screen } from "@/components/ui/Screen";
import { Chip } from "@/components/ui/Chip";
import { EmptyState, ErrorView, LoadingView } from "@/components/ui/StateViews";
import { ProductCard } from "@/components/ProductCard";
import { useStore } from "@/context/StoreContext";
import { useAuth } from "@/context/AuthContext";
import { colors } from "@/theme/colors";
import type { CatalogStackParamList } from "@/navigation/types";
import type { Product } from "@/types";

type Props = NativeStackScreenProps<CatalogStackParamList, "Catalog">;

const ALL = "Semua";

export function CatalogScreen({ navigation }: Props) {
  const { products, loading, error, loadProducts } = useStore();
  const { user } = useAuth();
  const [category, setCategory] = useState(ALL);
  const [query, setQuery] = useState("");

  useEffect(() => {
    loadProducts();
  }, [loadProducts]);

  // Daftar kategori diambil dari data produk agar selalu sinkron dengan server.
  const categories = useMemo(() => [ALL, ...Array.from(new Set(products.map((p) => p.category)))], [products]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return products.filter(
      (p) =>
        (category === ALL || p.category === category) &&
        (!q || p.name.toLowerCase().includes(q) || p.description.toLowerCase().includes(q)),
    );
  }, [products, category, query]);

  // useCallback menjaga referensi fungsi tetap sama sehingga ProductCard (memo) tidak render ulang.
  const openProduct = useCallback(
    (p: Product) => navigation.navigate("Customize", { productId: p.id }),
    [navigation],
  );

  if (loading && products.length === 0) return <LoadingView message="Memuat katalog..." />;
  if (error && products.length === 0) return <ErrorView message={error} onRetry={() => loadProducts(true)} />;

  const header = (
    <View className="pb-2">
      <Text className="text-xs font-semibold uppercase text-brand">Boutique Bunga Premium</Text>
      <Text className="mt-1 text-2xl font-bold text-ink">
        {user ? `Halo, ${user.name.split(" ")[0]} 🌸` : "Faedah Shop 🌸"}
      </Text>
      <Text className="mt-1 text-sm text-ink-secondary">Rangkai buket impianmu sesuai keinginan.</Text>

      <View className="mt-4 h-12 flex-row items-center rounded-xl border border-line bg-surface px-3">
        <Ionicons name="search" size={18} color={colors.inkTertiary} />
        <TextInput
          value={query}
          onChangeText={setQuery}
          placeholder="Cari bouquet favoritmu..."
          placeholderTextColor={colors.inkTertiary}
          className="ml-2 flex-1 text-base text-ink"
          returnKeyType="search"
          clearButtonMode="while-editing"
        />
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mt-3" contentContainerStyle={{ paddingVertical: 4 }}>
        {categories.map((c) => (
          <Chip key={c} label={c} active={c === category} onPress={() => setCategory(c)} />
        ))}
      </ScrollView>

      <Text className="mt-2 text-xs text-ink-tertiary">
        {filtered.length} produk ditemukan{category !== ALL ? ` di kategori "${category}"` : ""}
      </Text>
    </View>
  );

  return (
    <Screen>
      <FlatList
        data={filtered}
        keyExtractor={(p) => p.id}
        numColumns={2}
        columnWrapperStyle={{ gap: 12 }}
        contentContainerStyle={{ padding: 16, gap: 12, flexGrow: 1 }}
        ListHeaderComponent={header}
        renderItem={({ item }) => <ProductCard product={item} onPress={openProduct} />}
        ListEmptyComponent={
          <EmptyState icon="search-outline" title="Produk Tidak Ditemukan" message="Coba kata kunci atau kategori lain." />
        }
        refreshControl={
          <RefreshControl refreshing={loading} onRefresh={() => loadProducts(true)} tintColor={colors.brand} colors={[colors.brand]} />
        }
        keyboardShouldPersistTaps="handled"
        initialNumToRender={6}
        windowSize={7}
        removeClippedSubviews
      />
    </Screen>
  );
}
