// Kartu produk di grid katalog. memo() mencegah render ulang item FlatList
// yang datanya tidak berubah (optimasi performa, CPMK113).
// expo-image menyimpan gambar di cache memori + disk dan menampilkan transisi halus.
import { memo } from "react";
import { Pressable, Text, View } from "react-native";
import { Image } from "expo-image";
import { Badge } from "./ui/Badge";
import { formatRupiah } from "@/utils/format";
import type { Product } from "@/types";

interface ProductCardProps {
  product: Product;
  onPress: (product: Product) => void;
}

function ProductCardBase({ product, onPress }: ProductCardProps) {
  return (
    <Pressable
      onPress={() => onPress(product)}
      accessibilityRole="button"
      accessibilityLabel={`${product.name}, mulai dari ${formatRupiah(product.basePrice)}`}
      className="flex-1 overflow-hidden rounded-2xl border border-line bg-surface active:opacity-80"
    >
      <Image
        source={{ uri: product.image }}
        style={{ width: "100%", aspectRatio: 1 }}
        contentFit="cover"
        transition={200}
        cachePolicy="memory-disk"
        recyclingKey={product.id}
        placeholder={{ blurhash: "L6PZfSi_.AyE_3t7t7R**0o#DgR4" }}
      />
      <View className="gap-1 p-3">
        <Badge label={product.category} variant="brand" />
        <Text numberOfLines={2} className="text-sm font-bold text-ink">
          {product.name}
        </Text>
        <Text className="text-xs text-ink-tertiary">Mulai dari</Text>
        <Text className="text-sm font-bold text-brand">{formatRupiah(product.basePrice)}</Text>
      </View>
    </Pressable>
  );
}

export const ProductCard = memo(ProductCardBase);
