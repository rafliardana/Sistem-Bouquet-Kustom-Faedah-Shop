/**
 * components/ProductCard.tsx
 * ------------------------------------------------------------------
 * Kartu produk pada grid katalog.
 * Optimasi performa:
 *   - expo-image dengan cachePolicy "memory-disk" → gambar dari Unsplash
 *     hanya diunduh sekali, berikutnya dibaca dari cache.
 *   - recyclingKey → aman dipakai ulang oleh FlatList (virtualisasi).
 *   - React.memo → kartu tidak di-render ulang jika props tidak berubah.
 */
import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import React, { memo } from "react";
import { Pressable, Text, View } from "react-native";

import { CATEGORY_COLORS, DEFAULT_CATEGORY_COLOR } from "../constants/catalog";
import { colors } from "../theme/colors";
import { shadows } from "../theme/shadows";
import type { Product } from "../types";
import { formatRupiah } from "../utils/format";

interface ProductCardProps {
  product: Product;
  width: number;
  onPress: (product: Product) => void;
}

function ProductCard({ product, width, onPress }: ProductCardProps) {
  const badge = CATEGORY_COLORS[product.category] ?? DEFAULT_CATEGORY_COLOR;

  return (
    <Pressable
      onPress={() => onPress(product)}
      accessibilityRole="button"
      accessibilityLabel={`${product.name}, mulai dari ${formatRupiah(product.basePrice)}`}
      className="overflow-hidden rounded-card border border-line-subtle bg-surface active:opacity-90"
      style={[{ width }, shadows.card]}
    >
      {/* Foto produk — rasio 1:1 agar grid rapi di semua ukuran layar */}
      <View>
        <Image
          source={{ uri: product.image }}
          style={{ width, height: width }}
          contentFit="cover"
          transition={250}
          cachePolicy="memory-disk"
          recyclingKey={product.id}
          placeholder={{ blurhash: "L6PZfSi_.AyE_3t7t7R**0o#DgR4" }}
          accessibilityIgnoresInvertColors
        />
        <View
          className="absolute left-2 top-2 rounded-full px-2.5 py-1"
          style={{ backgroundColor: badge.bg }}
        >
          <Text className="text-[10px] font-bold" style={{ color: badge.fg }}>
            {product.category}
          </Text>
        </View>
      </View>

      {/* Informasi produk */}
      <View className="gap-1 p-3">
        <Text className="text-[14px] font-bold text-ink" numberOfLines={1}>
          {product.name}
        </Text>
        <Text className="text-[12px] leading-4 text-ink-secondary" numberOfLines={2}>
          {product.description}
        </Text>

        {/* Ukuran tersedia (S/M/L/XL) */}
        <View className="mt-1 flex-row flex-wrap gap-1">
          {product.sizes.map((s) => (
            <View key={s.id} className="rounded-md bg-surface-secondary px-1.5 py-0.5">
              <Text className="text-[10px] font-semibold text-ink-tertiary">{s.id}</Text>
            </View>
          ))}
        </View>

        {/* Harga + tombol pesan */}
        <View className="mt-2 flex-row items-end justify-between">
          <View className="flex-1">
            <Text className="text-[10px] text-ink-tertiary">Mulai dari</Text>
            <Text className="text-[14px] font-extrabold text-brand" numberOfLines={1}>
              {formatRupiah(product.basePrice)}
            </Text>
          </View>
          <View className="h-8 w-8 items-center justify-center rounded-full bg-brand">
            <Ionicons name="arrow-forward" size={16} color={colors.white} />
          </View>
        </View>
      </View>
    </Pressable>
  );
}

export default memo(ProductCard);
