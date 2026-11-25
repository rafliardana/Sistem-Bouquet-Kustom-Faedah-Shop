/**
 * screens/checkout/CheckoutScreen.tsx
 * ------------------------------------------------------------------
 * Halaman Checkout & Unggah Bukti Transfer (layar penuh di Native Stack).
 * Fitur:
 *   - Ringkasan buket & rincian harga dari OrderDraft
 *   - Form data pengiriman (Nama, No. WhatsApp, Alamat)
 *   - Pilihan metode pembayaran dari GET /api/payment-methods
 *     (Transfer BCA, Transfer Mandiri, GoPay, OVO, COD)
 *   - Unggah bukti transfer via expo-image-picker (wajib bila needsProof = true)
 *   - Pengiriman data & gambar ke POST /api/orders memakai multipart/form-data
 *   - Setelah berhasil: tampilkan nomor pesanan FLR-XXXXXX → pindah ke Lacak Pesanan
 */
import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import React, { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
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
import { useAuth } from "../../context/AuthContext";
import { getCachedProduct, useProducts } from "../../hooks/useProducts";
import type { RootStackScreenProps } from "../../navigation/types";
import { createOrder, fetchPaymentMethods } from "../../services/orderService";
import { colors } from "../../theme/colors";
import { shadows } from "../../theme/shadows";
import type { PaymentMethod, PickedImage } from "../../types";
import { formatRupiah } from "../../utils/format";
import { computeOrderPrice } from "../../utils/pricing";

export default function CheckoutScreen({ route, navigation }: RootStackScreenProps<"Checkout">) {
  const { draft } = route.params;
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const { products } = useProducts();

  const product = useMemo(
    () => getCachedProduct(draft.productId) ?? products.find((p) => p.id === draft.productId),
    [draft.productId, products],
  );

  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [loadingMethods, setLoadingMethods] = useState(true);

  // State form pengiriman & pembayaran
  const [customerName, setCustomerName] = useState(user?.name ?? "");
  const [customerPhone, setCustomerPhone] = useState("");
  const [customerAddress, setCustomerAddress] = useState("");
  const [paymentMethodId, setPaymentMethodId] = useState<string>("");
  const [paymentProof, setPaymentProof] = useState<PickedImage | null>(null);

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Isi nama otomatis bila user baru saja login
  useEffect(() => {
    if (user?.name && !customerName) setCustomerName(user.name);
  }, [user?.name]);

  // Muat daftar metode pembayaran aktif dari backend
  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const methods = await fetchPaymentMethods();
        if (active) {
          setPaymentMethods(methods);
          if (methods[0]) setPaymentMethodId(methods[0].id);
        }
      } catch (err) {
        if (active) {
          setError(err instanceof Error ? err.message : "Gagal memuat metode pembayaran");
        }
      } finally {
        if (active) setLoadingMethods(false);
      }
    })();
    return () => {
      active = false;
    };
  }, []);

  const selectedMethod = paymentMethods.find((m) => m.id === paymentMethodId);
  const needsProof = selectedMethod?.needsProof ?? false;

  const price = useMemo(() => {
    if (!product) return { flowerPrice: 0, addonTotal: 0, totalPrice: 0 };
    return computeOrderPrice(product, draft.sizeId, draft.selectedAddonIds);
  }, [product, draft.sizeId, draft.selectedAddonIds]);

  const selectedSize = product?.sizes.find((s) => s.id === draft.sizeId);
  const selectedAddons =
    product?.addons.filter((a) => draft.selectedAddonIds.includes(a.id)) ?? [];

  const canSubmit =
    !!user &&
    !!product &&
    customerName.trim().length > 0 &&
    customerPhone.trim().length > 0 &&
    customerAddress.trim().length > 0 &&
    paymentMethodId.length > 0 &&
    (!needsProof || paymentProof !== null) &&
    !submitting;

  const handleSubmitOrder = async () => {
    if (!product || !canSubmit) return;
    setSubmitting(true);
    setError(null);
    try {
      const order = await createOrder({
        productId: product.id,
        sizeId: draft.sizeId,
        description: draft.description,
        selectedAddonIds: draft.selectedAddonIds,
        customerName: customerName.trim(),
        customerPhone: customerPhone.trim(),
        customerAddress: customerAddress.trim(),
        paymentMethod: paymentMethodId,
        referenceImage: draft.referenceImage,
        paymentProof: needsProof ? paymentProof : null,
      });

      Alert.alert(
        "Pesanan Berhasil Dibuat! 🎉",
        `Nomor pesanan Anda: ${order.orderNumber}\nTim Faedah Shop akan segera memverifikasi pesanan Anda.`,
        [
          {
            text: "Lacak Pesanan",
            onPress: () =>
              navigation.navigate("MainTabs", {
                screen: "LacakPesanan",
                params: { orderNumber: order.orderNumber },
              }),
          },
        ],
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal membuat pesanan. Silakan coba lagi.");
    } finally {
      setSubmitting(false);
    }
  };

  if (!product) {
    return (
      <View className="flex-1 justify-center bg-surface-secondary p-5">
        <EmptyState
          emoji="🥀"
          title="Data Produk Tidak Ditemukan"
          message="Silakan pilih kembali produk dari katalog."
          actionLabel="Kembali"
          onAction={() => navigation.goBack()}
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
        contentContainerStyle={{ padding: 20, gap: 16, paddingBottom: 32 }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Peringatan jika belum login (endpoint POST /api/orders wajib JWT) */}
        {!user && (
          <View className="rounded-card border border-warning bg-warning-bg p-4">
            <Text className="text-[14px] font-bold text-ink">Silakan Login Terlebih Dahulu</Text>
            <Text className="mt-1 text-[12px] leading-4 text-ink-secondary">
              Masuk atau daftar akun pelanggan agar pesanan & status pelacakan tersimpan ke akunmu.
            </Text>
            <Pressable
              onPress={() => navigation.navigate("MainTabs", { screen: "Profil" })}
              className="mt-3 self-start rounded-full bg-brand px-4 py-2 active:opacity-80"
            >
              <Text className="text-[12px] font-bold text-white">Ke Halaman Login</Text>
            </Pressable>
          </View>
        )}

        {/* 1. Ringkasan Pesanan */}
        <View className="rounded-card bg-surface p-4" style={shadows.card}>
          <Text className="text-[15px] font-bold text-ink">Ringkasan Buket</Text>
          <View className="mt-3 flex-row gap-3">
            <Image
              source={{ uri: product.image }}
              style={{ width: 68, height: 68, borderRadius: 12 }}
              contentFit="cover"
              cachePolicy="memory-disk"
            />
            <View className="flex-1 gap-0.5">
              <Text className="text-[15px] font-bold text-ink">{product.name}</Text>
              <Text className="text-[12px] text-ink-secondary">
                Ukuran: {selectedSize ? `${selectedSize.id} (${selectedSize.label} • ${selectedSize.stems})` : draft.sizeId}
              </Text>
              {selectedAddons.length > 0 && (
                <Text className="text-[12px] text-ink-secondary" numberOfLines={2}>
                  Tambahan: {selectedAddons.map((a) => a.label).join(", ")}
                </Text>
              )}
              {draft.description.length > 0 && (
                <Text className="text-[12px] italic text-ink-tertiary" numberOfLines={2}>
                  "{draft.description}"
                </Text>
              )}
            </View>
          </View>

          <View className="mt-3 flex-row items-center justify-between border-t border-line-subtle pt-3">
            <Text className="text-[13px] font-semibold text-ink-secondary">Total Pembayaran</Text>
            <Text className="text-[18px] font-extrabold text-brand">
              {formatRupiah(price.totalPrice)}
            </Text>
          </View>
        </View>

        {/* 2. Data Penerima & Alamat Pengiriman */}
        <View className="gap-3 rounded-card bg-surface p-4" style={shadows.card}>
          <Text className="text-[15px] font-bold text-ink">Data Penerima</Text>

          <View className="gap-1">
            <Text className="text-[12px] font-semibold text-ink-secondary">Nama Lengkap *</Text>
            <TextInput
              value={customerName}
              onChangeText={setCustomerName}
              placeholder="Nama penerima buket"
              placeholderTextColor={colors.textTertiary}
              className="h-11 rounded-xl border border-line bg-surface-secondary px-3 text-[14px] text-ink"
            />
          </View>

          <View className="gap-1">
            <Text className="text-[12px] font-semibold text-ink-secondary">Nomor WhatsApp *</Text>
            <TextInput
              value={customerPhone}
              onChangeText={setCustomerPhone}
              placeholder="08xxxxxxxxxx"
              placeholderTextColor={colors.textTertiary}
              keyboardType="phone-pad"
              className="h-11 rounded-xl border border-line bg-surface-secondary px-3 text-[14px] text-ink"
            />
          </View>

          <View className="gap-1">
            <Text className="text-[12px] font-semibold text-ink-secondary">Alamat Pengiriman *</Text>
            <TextInput
              value={customerAddress}
              onChangeText={setCustomerAddress}
              placeholder="Jalan, nomor rumah, kelurahan, patokan..."
              placeholderTextColor={colors.textTertiary}
              multiline
              numberOfLines={3}
              textAlignVertical="top"
              className="min-h-[80px] rounded-xl border border-line bg-surface-secondary p-3 text-[14px] text-ink"
            />
          </View>
        </View>

        {/* 3. Pilih Metode Pembayaran (BCA, Mandiri, GoPay, OVO, COD) */}
        <View className="gap-3 rounded-card bg-surface p-4" style={shadows.card}>
          <Text className="text-[15px] font-bold text-ink">Metode Pembayaran</Text>

          {loadingMethods ? (
            <ActivityIndicator color={colors.brand} />
          ) : (
            <View className="gap-2">
              {paymentMethods.map((method) => {
                const active = method.id === paymentMethodId;
                return (
                  <Pressable
                    key={method.id}
                    onPress={() => setPaymentMethodId(method.id)}
                    accessibilityRole="radio"
                    accessibilityState={{ selected: active }}
                    className={`flex-row items-start gap-3 rounded-xl border p-3 ${
                      active ? "border-brand bg-brand-muted" : "border-line bg-surface"
                    }`}
                  >
                    <Ionicons
                      name={active ? "radio-button-on" : "radio-button-off"}
                      size={20}
                      color={active ? colors.brand : colors.textTertiary}
                    />
                    <View className="flex-1">
                      <Text className="text-[14px] font-bold text-ink">{method.label}</Text>
                      <Text className="mt-0.5 text-[12px] text-ink-secondary">{method.detail}</Text>
                    </View>
                  </Pressable>
                );
              })}
            </View>
          )}

          {/* 4. Unggah Bukti Transfer (otomatis tampil untuk metode non-COD) */}
          {needsProof && (
            <View className="mt-2 border-t border-line-subtle pt-3">
              <ImageUploadBox
                label="Bukti Transfer"
                hint={`Transfer tepat ${formatRupiah(price.totalPrice)} ke ${selectedMethod?.detail ?? "rekening di atas"}, lalu unggah tangkapan layar/foto struk.`}
                filePrefix="proof"
                required
                value={paymentProof}
                onChange={setPaymentProof}
              />
            </View>
          )}
        </View>

        {error && (
          <View className="rounded-xl bg-danger-bg px-4 py-3">
            <Text className="text-[13px] font-medium text-danger">{error}</Text>
          </View>
        )}
      </ScrollView>

      {/* Sticky Footer: Konfirmasi & Buat Pesanan */}
      <View
        className="border-t border-line bg-surface px-5 pt-3"
        style={{ paddingBottom: Math.max(insets.bottom, 12) }}
      >
        <Pressable
          onPress={handleSubmitOrder}
          disabled={!canSubmit}
          accessibilityRole="button"
          className={`flex-row items-center justify-center gap-2 rounded-full py-3.5 ${
            canSubmit ? "bg-brand active:opacity-85" : "bg-line"
          }`}
        >
          {submitting ? (
            <ActivityIndicator color={colors.white} />
          ) : (
            <>
              <Ionicons name="shield-checkmark-outline" size={18} color={colors.white} />
              <Text className="text-[15px] font-bold text-white">
                Buat Pesanan • {formatRupiah(price.totalPrice)}
              </Text>
            </>
          )}
        </Pressable>
      </View>
    </KeyboardAvoidingView>
  );
}
