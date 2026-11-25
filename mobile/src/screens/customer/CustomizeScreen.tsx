// Layar Kustomisasi Bouquet (pengganti ProductCustomizer.tsx web).
// Pengguna memilih ukuran, addon, tema kartu ucapan, catatan, dan gambar referensi.
// Total harga dihitung ulang setiap pilihan berubah (useMemo + calculatePrice),
// lalu ditampilkan di bilah bawah yang selalu terlihat.
import { useMemo, useState } from "react";
import { KeyboardAvoidingView, Platform, ScrollView, Text, View } from "react-native";
import { Image } from "expo-image";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Chip } from "@/components/ui/Chip";
import { TextField } from "@/components/ui/TextField";
import { EmptyState } from "@/components/ui/StateViews";
import { OptionRow } from "@/components/OptionRow";
import { ImageUploadField } from "@/components/ImageUploadField";
import { PriceSummary } from "@/components/PriceSummary";
import { useStore } from "@/context/StoreContext";
import { useImagePicker } from "@/hooks/useImagePicker";
import { calculatePrice } from "@/utils/price";
import { formatRupiah } from "@/utils/format";
import type { CatalogStackParamList } from "@/navigation/types";

type Props = NativeStackScreenProps<CatalogStackParamList, "Customize">;

// Tema kartu ucapan, sama dengan CARD_THEMES di versi web.
const CARD_THEMES = [
  { id: "None", label: "Tanpa Kartu Ucapan", bg: "#f5f5f8", fg: "#4b4b5c" },
  { id: "Ulang Tahun 🎂", label: "Ulang Tahun 🎂", bg: "#e9d5ff", fg: "#1e293b" },
  { id: "Wisuda 🎓", label: "Wisuda 🎓", bg: "#1e3c72", fg: "#ffffff" },
  { id: "Kasih Sayang 💖", label: "Kasih Sayang 💖", bg: "#ffc8d4", fg: "#4c0519" },
  { id: "Terima Kasih 🌸", label: "Terima Kasih 🌸", bg: "#c5f5b0", fg: "#052e16" },
];

// Format catatan identik dengan web agar admin membaca data yang seragam.
function buildDescription(cardTheme: string, cardMessage: string, notes: string): string {
  if (cardTheme === "None") return notes.trim();
  return `[KARTU: ${cardTheme}]\nPesan: "${cardMessage.trim()}"\n\nCatatan Tambahan: ${notes.trim()}`.trim();
}

export function CustomizeScreen({ route, navigation }: Props) {
  const { products, draft, setDraft } = useStore();
  const insets = useSafeAreaInsets();
  const product = products.find((p) => p.id === route.params.productId);

  // Jika pengguna kembali dari Checkout, pulihkan pilihan sebelumnya dari draft.
  const previous = draft?.product.id === product?.id ? draft : null;
  const [sizeId, setSizeId] = useState(previous?.sizeId ?? product?.sizes[0]?.id ?? "");
  const [addonIds, setAddonIds] = useState<string[]>(previous?.selectedAddonIds ?? []);
  const [cardTheme, setCardTheme] = useState("None");
  const [cardMessage, setCardMessage] = useState("");
  const [notes, setNotes] = useState("");
  const reference = useImagePicker("referensi");

  const price = useMemo(
    () => (product ? calculatePrice(product, sizeId, addonIds) : { flowerPrice: 0, addonTotal: 0, total: 0 }),
    [product, sizeId, addonIds],
  );

  if (!product) {
    return <EmptyState title="Produk Tidak Ditemukan" actionLabel="Kembali ke Katalog" onAction={() => navigation.goBack()} />;
  }

  const size = product.sizes.find((s) => s.id === sizeId);
  const selectedAddons = product.addons.filter((a) => addonIds.includes(a.id));
  const theme = CARD_THEMES.find((t) => t.id === cardTheme) ?? CARD_THEMES[0];

  const toggleAddon = (id: string) =>
    setAddonIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));

  const goToCheckout = () => {
    setDraft({
      product,
      sizeId,
      selectedAddonIds: addonIds,
      description: buildDescription(cardTheme, cardMessage, notes),
      referenceImage: reference.image ?? previous?.referenceImage ?? null,
    });
    navigation.navigate("Checkout");
  };

  return (
    <KeyboardAvoidingView className="flex-1 bg-surface-secondary" behavior={Platform.OS === "ios" ? "padding" : undefined} keyboardVerticalOffset={90}>
      <ScrollView contentContainerStyle={{ paddingBottom: 24 }} keyboardShouldPersistTaps="handled">
        <Image source={{ uri: product.image }} style={{ width: "100%", aspectRatio: 4 / 3 }} contentFit="cover" cachePolicy="memory-disk" transition={200} />

        <View className="gap-4 p-4">
          <View>
            <Badge label={product.category} variant="brand" />
            <Text className="mt-2 text-xl font-bold text-ink">{product.name}</Text>
            <Text className="mt-1 text-sm text-ink-secondary">{product.description}</Text>
          </View>

          <Card title="Pilih Ukuran">
            {product.sizes.map((s) => (
              <OptionRow
                key={s.id}
                mode="radio"
                title={s.label}
                subtitle={s.stems}
                trailing={formatRupiah(Math.round(product.basePrice * s.priceMultiplier))}
                selected={s.id === sizeId}
                onPress={() => setSizeId(s.id)}
              />
            ))}
          </Card>

          <Card title="Tambahan Opsional">
            {product.addons.map((a) => (
              <OptionRow
                key={a.id}
                mode="checkbox"
                title={a.label}
                trailing={`+${formatRupiah(a.price)}`}
                selected={addonIds.includes(a.id)}
                onPress={() => toggleAddon(a.id)}
              />
            ))}
          </Card>

          <Card title="Desain Kartu Ucapan Digital">
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 8 }}>
              {CARD_THEMES.map((t) => (
                <Chip key={t.id} label={t.label} active={t.id === cardTheme} onPress={() => setCardTheme(t.id)} />
              ))}
            </ScrollView>
            {cardTheme !== "None" && (
              <View className="mt-2">
                <TextField label="Pesan Kartu" placeholder="Tulis pesan singkat Anda di sini..." value={cardMessage} onChangeText={setCardMessage} maxLength={150} multiline />
                <Text className="mb-1.5 text-xs text-ink-tertiary">Preview Kartu Ucapan</Text>
                <View className="items-center rounded-xl p-5" style={{ backgroundColor: theme.bg }}>
                  <Text className="text-xs font-bold" style={{ color: theme.fg }}>{theme.label}</Text>
                  <Text className="mt-2 text-center text-sm italic" style={{ color: theme.fg }}>
                    {cardMessage ? `"${cardMessage}"` : "Ketik pesan Anda di atas..."}
                  </Text>
                </View>
              </View>
            )}
          </Card>

          <Card title="Catatan & Referensi">
            <TextField
              label="Catatan / Permintaan Khusus"
              placeholder="Contoh: Kertas pembungkus warna pastel pink, tambahkan pita satin putih besar..."
              hint="Preferensi warna kertas wrap, tema warna bunga, atau instruksi pengiriman khusus"
              value={notes}
              onChangeText={setNotes}
              multiline
            />
            <ImageUploadField
              label="Gambar Referensi"
              hint="JPG / PNG, otomatis dikompres"
              image={reference.image ?? previous?.referenceImage ?? null}
              processing={reference.processing}
              onPick={reference.choose}
              onClear={() => {
                reference.clear();
                if (previous) setDraft({ ...previous, referenceImage: null });
              }}
            />
          </Card>

          <Card title="Rincian Harga">
            <PriceSummary
              lines={[
                { label: `Harga bunga (${size?.label ?? "-"})`, value: price.flowerPrice },
                ...selectedAddons.map((a) => ({ label: a.label, value: a.price })),
              ]}
              total={price.total}
              totalLabel="Total Estimasi"
            />
          </Card>
        </View>
      </ScrollView>

      {/* Bilah bawah: total harga live + tombol lanjut */}
      <View className="flex-row items-center border-t border-line bg-surface px-4 pt-3" style={{ paddingBottom: Math.max(insets.bottom, 12) }}>
        <View className="flex-1">
          <Text className="text-xs text-ink-tertiary">Total Estimasi</Text>
          <Text className="text-lg font-bold text-brand">{formatRupiah(price.total)}</Text>
        </View>
        <Button label="Lanjut ke Checkout" icon="arrow-forward" onPress={goToCheckout} disabled={!sizeId} />
      </View>
    </KeyboardAvoidingView>
  );
}
