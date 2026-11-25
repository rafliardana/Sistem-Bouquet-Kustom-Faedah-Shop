// Layar Form Tambah / Edit Produk (pengganti dialog form di AdminProducts.tsx web).
// - Mode tambah: POST /api/admin/products (server memberi ukuran & addon default).
// - Mode edit: PATCH /api/admin/products/:id (ukuran & addon lama tetap dipertahankan).
// Gambar produk berupa URL (sesuai skema server), dengan pratinjau langsung.
import { useLayoutEffect, useState } from "react";
import { Alert, KeyboardAvoidingView, Platform, ScrollView, Text, View } from "react-native";
import { Image } from "expo-image";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { TextField } from "@/components/ui/TextField";
import { useStore } from "@/context/StoreContext";
import { createProduct, updateProduct, type ProductInput } from "@/api/services";
import { formatRupiah } from "@/utils/format";
import type { AdminProductStackParamList } from "@/navigation/types";

type Props = NativeStackScreenProps<AdminProductStackParamList, "ProductForm">;

export function AdminProductFormScreen({ route, navigation }: Props) {
  const { products, loadProducts } = useStore();
  const editing = products.find((p) => p.id === route.params?.productId);

  const [name, setName] = useState(editing?.name ?? "");
  const [category, setCategory] = useState(editing?.category ?? "Mawar");
  const [basePrice, setBasePrice] = useState(editing ? String(editing.basePrice) : "");
  const [image, setImage] = useState(editing?.image ?? "");
  const [description, setDescription] = useState(editing?.description ?? "");
  const [submitted, setSubmitted] = useState(false);
  const [saving, setSaving] = useState(false);

  useLayoutEffect(() => {
    navigation.setOptions({ title: editing ? "Edit Produk" : "Tambah Produk" });
  }, [navigation, editing]);

  const price = Number(basePrice.replace(/\D/g, ""));
  const errors = {
    name: !name.trim() ? "Nama produk wajib diisi" : "",
    basePrice: !price || price < 1000 ? "Harga dasar minimal Rp 1.000" : "",
    image: image && !/^https?:\/\//.test(image.trim()) ? "URL gambar harus diawali http:// atau https://" : "",
  };
  const isValid = Object.values(errors).every((e) => !e);
  const show = (k: keyof typeof errors) => (submitted ? errors[k] : "");

  const save = async () => {
    setSubmitted(true);
    if (!isValid) return;
    const input: ProductInput = {
      name: name.trim(),
      category: category.trim() || "Campur",
      basePrice: price,
      image: image.trim(),
      description: description.trim(),
    };
    setSaving(true);
    try {
      if (editing) await updateProduct(editing.id, input);
      else await createProduct(input);
      await loadProducts(true); // segarkan cache agar katalog customer ikut terbarui
      Alert.alert("Berhasil", editing ? "Produk berhasil diperbarui." : "Produk berhasil ditambahkan.");
      navigation.goBack();
    } catch (e) {
      Alert.alert("Gagal menyimpan", e instanceof Error ? e.message : "Terjadi kesalahan");
    } finally {
      setSaving(false);
    }
  };

  return (
    <KeyboardAvoidingView className="flex-1 bg-surface-secondary" behavior={Platform.OS === "ios" ? "padding" : undefined} keyboardVerticalOffset={90}>
      <ScrollView contentContainerStyle={{ padding: 16, gap: 16 }} keyboardShouldPersistTaps="handled">
        <Card title="Informasi Produk">
          <TextField label="Nama Produk" placeholder="Contoh: Buket Mawar Merah" value={name} onChangeText={setName} error={show("name")} />
          <TextField label="Kategori" placeholder="Mawar, Tulip, Campur…" value={category} onChangeText={setCategory} />
          <TextField
            label="Harga Dasar (Rp)"
            placeholder="150000"
            value={basePrice}
            onChangeText={setBasePrice}
            keyboardType="number-pad"
            error={show("basePrice")}
            hint={price ? `Ukuran Kecil: ${formatRupiah(price)}. Ukuran lain dikali pengali harga.` : undefined}
          />
          <TextField label="Deskripsi" placeholder="Deskripsi singkat produk" value={description} onChangeText={setDescription} multiline />
        </Card>

        <Card title="Gambar Produk">
          <TextField label="URL Gambar" placeholder="https://..." value={image} onChangeText={setImage} autoCapitalize="none" keyboardType="url" error={show("image")} />
          {!!image && !errors.image && (
            <Image source={{ uri: image.trim() }} style={{ width: "100%", aspectRatio: 4 / 3, borderRadius: 12 }} contentFit="cover" transition={200} />
          )}
        </Card>

        {editing && (
          <Card title="Ukuran & Tambahan" subtitle="Tidak diubah dari form ini">
            <Text className="text-xs text-ink-secondary">Ukuran: {editing.sizes.map((s) => `${s.label} (x${s.priceMultiplier})`).join(", ")}</Text>
            <Text className="mt-1 text-xs text-ink-secondary">Tambahan: {editing.addons.map((a) => a.label).join(", ")}</Text>
          </Card>
        )}
        {!editing && (
          <Text className="px-1 text-xs text-ink-tertiary">Ukuran (Kecil–Extra Besar) dan tambahan (vas, pita, kartu, wrapping) diisi otomatis oleh server.</Text>
        )}

        <View>
          <Button label={editing ? "Simpan Perubahan" : "Tambah Produk"} icon="save-outline" onPress={save} loading={saving} />
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
