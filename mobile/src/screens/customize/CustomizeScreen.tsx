/**
 * screens/customize/CustomizeScreen.tsx
 * ------------------------------------------------------------------
 * Halaman Kustomisasi Buket Real-time (Tab ke-2 Pelanggan).
 * Fitur:
 *   - Menerima `productId` dari Katalog (atau memilih cepat dari daftar produk)
 *   - Memilih ukuran buket (S / M / L / XL) beserta jumlah tangkai & pengali harga
 *   - Memilih addons (Vas Bunga, Pita Premium, Kartu Ucapan, Wrapping Mewah)
 *   - Menulis catatan khusus / pesan kartu ucapan
 *   - Mengunggah foto referensi buket dari Galeri atau Kamera (expo-image-picker)
 *   - Kalkulasi harga otomatis secara real-time pada sticky footer
 *   - Membawa draf pesanan (OrderDraft) menuju layar Checkout
 */
import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import React, { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import EmptyState from "../../components/EmptyState";
import ImageUploadBox from "../../components/ImageUploadBox";
import { useProducts } from "../../hooks/useProducts";
import type { CustomerTabScreenProps } from "../../navigation/types";
import { colors } from "../../theme/colors";
import { shadows } from "../../theme/shadows";
import type { PickedImage } from "../../types";
import { formatRupiah } from "../../utils/format";
import { computeOrderPrice } from "../../utils/pricing";

export default function CustomizeScreen({
  route,
  navigation,
}: CustomerTabScreenProps<"Kustomisasi">) {
  const insets = useSafeAreaInsets();
  const { products, loading, error, retry } = useProducts();

  // Produk terpilih: prioritas dari parameter navigasi, fallback produk pertama
  const [selectedProductId, setSelectedProductId] = useState<string | undefined>(
    route.params?.productId,
  );
  const [sizeId, setSizeId] = useState<string>("M");
  const [selectedAddonIds, setSelectedAddonIds] = useState<string[]>([]);
  const [description, setDescription] = useState<string>("");
  const [referenceImage, setReferenceImage] = useState<PickedImage | null>(null);

  // Sinkronkan produk jika pengguna mengetuk produk baru dari tab Katalog
  useEffect(() => {
    if (route.params?.productId) {
      setSelectedProductId(route.params.productId);
    }
  }, [route.params?.productId]);

  const product = useMemo(() => {
    if (products.length === 0) return undefined;
    return products.find((p) => p.id === selectedProductId) ?? products[0];
  }, [products, selectedProductId]);

  // Reset ukuran & addons yang tidak cocok ketika produk berganti
  useEffect(() => {
    if (!product) return;
    const defaultSize = product.sizes.find((s) => s.id === "M")?.id ?? product.sizes[0]?.id ?? "S";
    setSizeId(defaultSize);
    setSelectedAddonIds([]);
  }, [product?.id]);

  // Kalkulasi harga real-time (basePrice * priceMultiplier + total addons)
  const price = useMemo(() => {
    if (!product) return { flowerPrice: 0, addonTotal: 0, totalPrice: 0 };
    return computeOrderPrice(product, sizeId, selectedAddonIds);
  }, [product, sizeId, selectedAddonIds]);

  const toggleAddon = (addonId: string) => {
    setSelectedAddonIds((prev) =>
      prev.includes(addonId) ? prev.filter((id) => id !== addonId) : [...prev, addonId],
    );
  };

  const handleContinueCheckout = () => {
    if (!product) return;
    navigation.navigate("Checkout", {
      draft: {
        productId: product.id,
        sizeId,
        selectedAddonIds,
        description: description.trim(),
        referenceImage,
      },
    });
  };

  // Status loading / error saat produk belum tersedia
  if (loading && !product) {
    return (
      <View className="flex-1 items-center justify-center bg-surface-secondary">
        <ActivityIndicator size="large" color={colors.brand} />
      </View>
    );
  }

  if (!product) {
    return (
      <View className="flex-1 justify-center bg-surface-secondary p-5">
        <EmptyState
          emoji="💐"
          title="Belum Ada Produk"
          message={error ?? "Pilih produk dari katalog untuk mulai mengkustomisasi buket."}
          actionLabel={error ? "Coba Lagi" : "Buka Katalog"}
          onAction={error ? retry : () => navigation.navigate("Katalog")}
        />
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      className="flex-1 bg-surface-secondary"
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      keyboardVerticalOffset={90}
    >
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingBottom: 24 }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Pemilih cepat produk (memudahkan ganti buket tanpa kembali ke katalog) */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerClassName="gap-2 px-5 pt-4 pb-2"
        >
          {products.map((p) => {
            const active = p.id === product.id;
            return (
              <Pressable
                key={p.id}
                onPress={() => setSelectedProductId(p.id)}
                className={`rounded-full border px-3.5 py-1.5 ${
                  active ? "border-brand bg-brand" : "border-line bg-surface"
                }`}
              >
                <Text className={`text-[12px] font-semibold ${active ? "text-white" : "text-ink-secondary"}`}>
                  {p.name}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>

        <View className="gap-4 px-5 pt-2">
          {/* Kartu ringkasan produk terpilih */}
          <View className="overflow-hidden rounded-card bg-surface" style={shadows.card}>
            <Image
              source={{ uri: product.image }}
              style={{ width: "100%", height: 200 }}
              contentFit="cover"
              cachePolicy="memory-disk"
              transition={200}
            />
            <View className="p-4">
              <View className="flex-row items-center justify-between">
                <Text className="flex-1 text-[18px] font-extrabold text-ink">{product.name}</Text>
                <View className="rounded-full bg-brand-tertiary px-2.5 py-1">
                  <Text className="text-[11px] font-bold text-brand">{product.category}</Text>
                </View>
              </View>
              <Text className="mt-1 text-[13px] leading-5 text-ink-secondary">
                {product.description}
              </Text>
            </View>
          </View>

          {/* 1. Pilih Ukuran Buket */}
          <View className="rounded-card bg-surface p-4" style={shadows.card}>
            <Text className="text-[15px] font-bold text-ink">1. Pilih Ukuran Buket</Text>
            <Text className="mt-0.5 text-[12px] text-ink-secondary">
              Harga menyesuaikan jumlah tangkai bunga.
            </Text>
            <View className="mt-3 flex-row flex-wrap gap-2.5">
              {product.sizes.map((size) => {
                const active = size.id === sizeId;
                const sizePrice = Math.round(product.basePrice * size.priceMultiplier);
                return (
                  <Pressable
                    key={size.id}
                    onPress={() => setSizeId(size.id)}
                    accessibilityRole="radio"
                    accessibilityState={{ selected: active }}
                    style={{ width: "48%" }}
                    className={`rounded-2xl border p-3 ${
                      active
                        ? "border-brand bg-brand-muted"
                        : "border-line bg-surface"
                    }`}
                  >
                    <View className="flex-row items-center justify-between">
                      <Text className={`text-[14px] font-extrabold ${active ? "text-brand" : "text-ink"}`}>
                        {size.id} — {size.label}
                      </Text>
                      {active && <Ionicons name="checkmark-circle" size={18} color={colors.brand} />}
                    </View>
                    <Text className="mt-0.5 text-[11px] text-ink-secondary">{size.stems}</Text>
                    <Text className="mt-1.5 text-[13px] font-bold text-brand">
                      {formatRupiah(sizePrice)}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          </View>

          {/* 2. Tambahan (Addons: Pita, Kartu Ucapan, Vas, Wrapping) */}
          <View className="rounded-card bg-surface p-4" style={shadows.card}>
            <Text className="text-[15px] font-bold text-ink">2. Tambahan (Addons)</Text>
            <Text className="mt-0.5 text-[12px] text-ink-secondary">
              Pilih aksesori pelengkap sesuai keinginanmu (boleh lebih dari satu).
            </Text>
            <View className="mt-3 gap-2">
              {product.addons.map((addon) => {
                const checked = selectedAddonIds.includes(addon.id);
                return (
                  <Pressable
                    key={addon.id}
                    onPress={() => toggleAddon(addon.id)}
                    accessibilityRole="checkbox"
                    accessibilityState={{ checked }}
                    className={`flex-row items-center justify-between rounded-xl border px-3.5 py-3 ${
                      checked ? "border-brand bg-brand-muted" : "border-line bg-surface"
                    }`}
                  >
                    <View className="flex-row items-center gap-2.5">
                      <Ionicons
                        name={checked ? "checkbox" : "square-outline"}
                        size={20}
                        color={checked ? colors.brand : colors.textTertiary}
                      />
                      <Text className="text-[14px] font-semibold text-ink">{addon.label}</Text>
                    </View>
                    <Text className="text-[13px] font-bold text-brand">
                      +{formatRupiah(addon.price)}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          </View>

          {/* 3. Catatan Khusus & Pesan Kartu Ucapan */}
          <View className="rounded-card bg-surface p-4" style={shadows.card}>
            <Text className="text-[15px] font-bold text-ink">3. Catatan Khusus</Text>
            <Text className="mt-0.5 text-[12px] text-ink-secondary">
              Tuliskan nuansa warna kertas, isi kartu ucapan, atau permintaan khusus.
            </Text>
            <TextInput
              value={description}
              onChangeText={setDescription}
              placeholder="Contoh: Bungkus warna krem pastel, kartu bertuliskan 'Selamat Wisuda!'"
              placeholderTextColor={colors.textTertiary}
              multiline
              numberOfLines={3}
              textAlignVertical="top"
              className="mt-3 min-h-[88px] rounded-xl border border-line bg-surface-secondary p-3 text-[14px] text-ink"
            />
          </View>

          {/* 4. Unggah Foto Referensi Buket (Galeri / Kamera) */}
          <View className="rounded-card bg-surface p-4" style={shadows.card}>
            <ImageUploadBox
              label="4. Foto Referensi Buket"
              hint="Punya contoh warna atau model rangkaian favorit? Unggah foto dari galeri atau potret langsung."
              filePrefix="reference"
              value={referenceImage}
              onChange={setReferenceImage}
            />
          </View>
        </View>
      </ScrollView>

      {/* Sticky Footer: Rincian Harga Real-time & Tombol Lanjut ke Checkout */}
      <View
        className="border-t border-line bg-surface px-5 pt-3"
        style={{ paddingBottom: Math.max(insets.bottom, 12) }}
      >
        <View className="flex-row items-center justify-between">
          <View>
            <Text className="text-[11px] text-ink-secondary">
              Buket {formatRupiah(price.flowerPrice)}
              {price.addonTotal > 0 ? ` + Addons ${formatRupiah(price.addonTotal)}` : ""}
            </Text>
            <Text className="text-[20px] font-extrabold text-brand">
              {formatRupiah(price.totalPrice)}
            </Text>
          </View>

          <Pressable
            onPress={handleContinueCheckout}
            accessibilityRole="button"
            className="flex-row items-center gap-2 rounded-full bg-brand px-5 py-3.5 active:opacity-85"
            style={shadows.raised}
          >
            <Text className="text-[14px] font-bold text-white">Checkout</Text>
            <Ionicons name="arrow-forward" size={16} color={colors.white} />
          </Pressable>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}
