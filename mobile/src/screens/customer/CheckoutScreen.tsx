// Layar Checkout & Upload Bukti Pembayaran (pengganti Checkout.tsx web).
// Alur: isi data pemesan -> pilih metode (BCA, Mandiri, OVO, GoPay, COD dari server)
// -> unggah bukti bila metode mewajibkan -> kirim sebagai multipart/form-data.
// Pengguna yang belum login diarahkan ke layar Login terlebih dahulu.
import { useEffect, useMemo, useState } from "react";
import { Alert, KeyboardAvoidingView, Platform, Pressable, ScrollView, Text, View } from "react-native";
import { Image } from "expo-image";
import * as Clipboard from "expo-clipboard";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { TextField } from "@/components/ui/TextField";
import { EmptyState, LoadingView } from "@/components/ui/StateViews";
import { OptionRow } from "@/components/OptionRow";
import { ImageUploadField } from "@/components/ImageUploadField";
import { PriceSummary } from "@/components/PriceSummary";
import { useAuth } from "@/context/AuthContext";
import { useStore } from "@/context/StoreContext";
import { useImagePicker } from "@/hooks/useImagePicker";
import { createOrder, listPaymentMethods } from "@/api/services";
import { calculatePrice } from "@/utils/price";
import { colors } from "@/theme/colors";
import type { CatalogStackParamList } from "@/navigation/types";
import type { PaymentMethod } from "@/types";

type Props = NativeStackScreenProps<CatalogStackParamList, "Checkout">;

// Validasi sederhana nomor HP Indonesia (08xx / +628xx / 628xx, 9-13 digit setelah prefix).
const PHONE_REGEX = /^(\+62|62|0)8[0-9]{7,12}$/;

export function CheckoutScreen({ navigation }: Props) {
  const { user } = useAuth();
  const { draft, setDraft } = useStore();
  const insets = useSafeAreaInsets();
  const proof = useImagePicker("bukti");

  const [methods, setMethods] = useState<PaymentMethod[] | null>(null);
  const [methodId, setMethodId] = useState("");
  const [name, setName] = useState(user?.name ?? "");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [submitted, setSubmitted] = useState(false); // tampilkan error validasi setelah tombol ditekan
  const [sending, setSending] = useState(false);

  useEffect(() => {
    listPaymentMethods()
      .then(setMethods)
      .catch((e) => {
        setMethods([]);
        Alert.alert("Gagal", e.message);
      });
  }, []);

  // Isi otomatis nama setelah pengguna login dari layar ini.
  useEffect(() => {
    if (user && !name) setName(user.name);
  }, [user, name]);

  const price = useMemo(
    () => (draft ? calculatePrice(draft.product, draft.sizeId, draft.selectedAddonIds) : null),
    [draft],
  );

  if (!draft || !price) {
    return <EmptyState title="Belum ada bouquet dipilih" actionLabel="Kembali ke Katalog" onAction={() => navigation.popToTop()} />;
  }
  if (!methods) return <LoadingView message="Memuat metode pembayaran..." />;

  const method = methods.find((m) => m.id === methodId);
  const needsProof = method?.needsProof ?? false;
  const size = draft.product.sizes.find((s) => s.id === draft.sizeId);
  const addons = draft.product.addons.filter((a) => draft.selectedAddonIds.includes(a.id));

  const errors = {
    name: !name.trim() ? "Nama wajib diisi" : "",
    phone: !PHONE_REGEX.test(phone.replace(/[\s-]/g, "")) ? "Nomor WhatsApp tidak valid (contoh: 081234567890)" : "",
    address: address.trim().length < 10 ? "Alamat terlalu singkat" : "",
    method: !method ? "Pilih metode pembayaran" : "",
    proof: needsProof && !proof.image ? "Bukti pembayaran wajib diunggah" : "",
  };
  const isValid = Object.values(errors).every((e) => !e);

  const copyDetail = async (detail: string) => {
    await Clipboard.setStringAsync(detail.replace(/\D/g, "") || detail);
    Alert.alert("Tersalin", "Nomor rekening/akun disalin ke clipboard.");
  };

  const submit = async () => {
    setSubmitted(true);
    if (!user) {
      Alert.alert("Login diperlukan", "Silakan masuk untuk membuat pesanan.", [
        { text: "Batal", style: "cancel" },
        { text: "Masuk", onPress: () => navigation.getParent()?.getParent()?.navigate("Login") },
      ]);
      return;
    }
    if (!isValid || !method) return;

    setSending(true);
    try {
      const order = await createOrder({
        productId: draft.product.id,
        sizeId: draft.sizeId,
        description: draft.description,
        selectedAddonIds: draft.selectedAddonIds,
        customerName: name.trim(),
        customerPhone: phone.trim(),
        customerAddress: address.trim(),
        paymentMethod: method.id,
        referenceImage: draft.referenceImage,
        paymentProof: needsProof ? proof.image : null,
      });
      setDraft(null);
      navigation.popToTop();
      // Pindah ke tab Pesanan Saya dan sorot pesanan baru.
      navigation.getParent()?.navigate("PesananTab", { newOrderId: order.id });
    } catch (e) {
      Alert.alert("Pesanan gagal", e instanceof Error ? e.message : "Terjadi kesalahan");
    } finally {
      setSending(false);
    }
  };

  const show = (key: keyof typeof errors) => (submitted ? errors[key] : "");

  return (
    <KeyboardAvoidingView className="flex-1 bg-surface-secondary" behavior={Platform.OS === "ios" ? "padding" : undefined} keyboardVerticalOffset={90}>
      <ScrollView contentContainerStyle={{ padding: 16, gap: 16 }} keyboardShouldPersistTaps="handled">
        <Card title="Ringkasan Pesanan">
          <View className="mb-3 flex-row">
            <Image source={{ uri: draft.product.image }} style={{ width: 64, height: 64, borderRadius: 12 }} contentFit="cover" cachePolicy="memory-disk" />
            <View className="ml-3 flex-1 justify-center">
              <Text className="text-sm font-bold text-ink">{draft.product.name}</Text>
              <Text className="text-xs text-ink-tertiary">{size ? `${size.label} • ${size.stems}` : draft.sizeId}</Text>
              {draft.referenceImage && <Text className="mt-0.5 text-xs text-brand">📎 Gambar referensi terlampir</Text>}
            </View>
          </View>
          {!!draft.description && (
            <Text className="mb-3 rounded-lg bg-surface-secondary p-2.5 text-xs text-ink-secondary">
              Permintaan khusus: {draft.description}
            </Text>
          )}
          <PriceSummary
            lines={[{ label: "Harga bunga", value: price.flowerPrice }, ...addons.map((a) => ({ label: a.label, value: a.price }))]}
            total={price.total}
          />
        </Card>

        <Card title="Data Pemesan" subtitle="Lengkapi semua data yang diperlukan">
          <TextField label="Nama Lengkap" placeholder="Masukkan nama lengkap" value={name} onChangeText={setName} error={show("name")} autoComplete="name" />
          <TextField label="Nomor WhatsApp" placeholder="081234567890" value={phone} onChangeText={setPhone} error={show("phone")} keyboardType="phone-pad" autoComplete="tel" />
          <TextField
            label="Alamat Pengiriman"
            placeholder="Alamat lengkap pengiriman..."
            hint="Sertakan nama jalan, nomor rumah, kelurahan, kecamatan, kota, dan kode pos"
            value={address}
            onChangeText={setAddress}
            error={show("address")}
            multiline
          />
        </Card>

        <Card title="Metode Pembayaran">
          {methods.map((m) => (
            <OptionRow key={m.id} mode="radio" title={m.label} subtitle={m.detail || undefined} selected={m.id === methodId} onPress={() => setMethodId(m.id)} />
          ))}
          {!!show("method") && <Text className="text-xs text-danger">{errors.method}</Text>}

          {method && needsProof && (
            <View className="mt-2">
              {!!method.detail && (
                <Pressable onPress={() => copyDetail(method.detail)} className="mb-3 flex-row items-center rounded-xl bg-brand-muted p-3 active:opacity-70">
                  <View className="flex-1">
                    <Text className="text-xs text-ink-tertiary">Transfer ke</Text>
                    <Text className="text-sm font-bold text-ink">{method.detail}</Text>
                  </View>
                  <Ionicons name="copy-outline" size={18} color={colors.brand} />
                  <Text className="ml-1 text-xs font-semibold text-brand">Salin</Text>
                </Pressable>
              )}
              <ImageUploadField
                label="Bukti Pembayaran"
                hint="Screenshot / foto bukti transfer"
                image={proof.image}
                processing={proof.processing}
                required
                onPick={proof.choose}
                onClear={proof.clear}
              />
              {!!show("proof") && <Text className="text-xs text-danger">{errors.proof}</Text>}
            </View>
          )}
          {method && !needsProof && (
            <Text className="mt-1 text-xs text-ink-tertiary">Pembayaran dilakukan saat pesanan diterima.</Text>
          )}
        </Card>
      </ScrollView>

      <View className="border-t border-line bg-surface px-4 pt-3" style={{ paddingBottom: Math.max(insets.bottom, 12) }}>
        <Button
          label={user ? "Buat Pesanan" : "Masuk untuk Memesan"}
          icon={user ? "bag-check-outline" : "log-in-outline"}
          onPress={submit}
          loading={sending}
        />
      </View>
    </KeyboardAvoidingView>
  );
}
