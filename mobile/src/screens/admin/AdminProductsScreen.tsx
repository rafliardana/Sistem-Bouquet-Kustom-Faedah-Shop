// Layar Daftar Produk Admin (pengganti AdminProducts.tsx web, bagian tabel).
// Menampilkan semua produk dalam FlatList dengan gambar ter-cache, harga dasar, dan kategori.
// Ketuk produk untuk mengedit, atau tombol "+" untuk menambah produk baru.
import { useCallback, useEffect, useLayoutEffect } from "react";
import { FlatList, Pressable, RefreshControl, Text, View } from "react-native";
import { Image } from "expo-image";
import { Ionicons } from "@expo/vector-icons";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { Badge } from "@/components/ui/Badge";
import { EmptyState, ErrorView, LoadingView } from "@/components/ui/StateViews";
import { useStore } from "@/context/StoreContext";
import { formatRupiah } from "@/utils/format";
import { colors } from "@/theme/colors";
import type { AdminProductStackParamList } from "@/navigation/types";
import type { Product } from "@/types";

type Props = NativeStackScreenProps<AdminProductStackParamList, "ProductList">;

export function AdminProductsScreen({ navigation }: Props) {
  const { products, loading, error, loadProducts } = useStore();

  useEffect(() => {
    loadProducts();
  }, [loadProducts]);

  // Tombol tambah produk di header kanan.
  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <Pressable onPress={() => navigation.navigate("ProductForm")} hitSlop={10} accessibilityLabel="Tambah produk">
          <Ionicons name="add-circle" size={28} color={colors.brand} />
        </Pressable>
      ),
    });
  }, [navigation]);

  const renderItem = useCallback(
    ({ item }: { item: Product }) => (
      <Pressable
        onPress={() => navigation.navigate("ProductForm", { productId: item.id })}
        className="flex-row items-center rounded-2xl border border-line bg-surface p-3 active:opacity-80"
      >
        <Image source={{ uri: item.image }} style={{ width: 64, height: 64, borderRadius: 12 }} contentFit="cover" cachePolicy="memory-disk" recyclingKey={item.id} />
        <View className="ml-3 flex-1 gap-1">
          <Text className="text-sm font-bold text-ink" numberOfLines={1}>{item.name}</Text>
          <Badge label={item.category} variant="brand" />
          <Text className="text-xs text-ink-secondary">Harga dasar {formatRupiah(item.basePrice)}</Text>
        </View>
        <Ionicons name="create-outline" size={20} color={colors.inkTertiary} />
      </Pressable>
    ),
    [navigation],
  );

  if (loading && products.length === 0) return <LoadingView message="Memuat produk..." />;
  if (error && products.length === 0) return <ErrorView message={error} onRetry={() => loadProducts(true)} />;

  return (
    <FlatList
      data={products}
      keyExtractor={(p) => p.id}
      renderItem={renderItem}
      contentContainerStyle={{ padding: 16, gap: 10, flexGrow: 1 }}
      ListHeaderComponent={<Text className="mb-1 text-xs text-ink-tertiary">{products.length} produk terdaftar</Text>}
      ListEmptyComponent={
        <EmptyState title="Belum ada produk" actionLabel="Tambah Produk" onAction={() => navigation.navigate("ProductForm")} />
      }
      refreshControl={<RefreshControl refreshing={loading} onRefresh={() => loadProducts(true)} tintColor={colors.brand} colors={[colors.brand]} />}
    />
  );
}
