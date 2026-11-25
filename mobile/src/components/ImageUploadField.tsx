// Area unggah gambar (referensi buket / bukti pembayaran).
// Menampilkan pratinjau, indikator proses kompresi, serta tombol ganti & hapus.
import { ActivityIndicator, Pressable, Text, View } from "react-native";
import { Image } from "expo-image";
import { Ionicons } from "@expo/vector-icons";
import { colors } from "@/theme/colors";
import type { PickedImage } from "@/types";

interface ImageUploadFieldProps {
  label: string;
  hint: string;
  image: PickedImage | null;
  processing?: boolean;
  required?: boolean;
  onPick: () => void;
  onClear: () => void;
}

export function ImageUploadField({ label, hint, image, processing, required, onPick, onClear }: ImageUploadFieldProps) {
  return (
    <View className="mb-2">
      <Text className="mb-1.5 text-sm font-semibold text-ink">
        {label}
        {required && <Text className="text-danger"> *</Text>}
      </Text>
      {image ? (
        <View className="overflow-hidden rounded-xl border border-line">
          <Image source={{ uri: image.uri }} style={{ width: "100%", height: 200 }} contentFit="cover" />
          <View className="flex-row border-t border-line bg-surface">
            <Pressable onPress={onPick} className="flex-1 flex-row items-center justify-center gap-1.5 py-3">
              <Ionicons name="swap-horizontal" size={16} color={colors.brand} />
              <Text className="text-sm font-semibold text-brand">Ganti</Text>
            </Pressable>
            <View className="w-px bg-line" />
            <Pressable onPress={onClear} className="flex-1 flex-row items-center justify-center gap-1.5 py-3">
              <Ionicons name="trash-outline" size={16} color={colors.danger} />
              <Text className="text-sm font-semibold text-danger">Hapus</Text>
            </Pressable>
          </View>
        </View>
      ) : (
        <Pressable
          onPress={onPick}
          disabled={processing}
          accessibilityRole="button"
          className="items-center justify-center rounded-xl border-2 border-dashed border-brand-secondary bg-brand-muted py-8 active:opacity-70"
        >
          {processing ? (
            <ActivityIndicator color={colors.brand} />
          ) : (
            <>
              <Ionicons name="cloud-upload-outline" size={30} color={colors.brand} />
              <Text className="mt-2 text-sm font-semibold text-brand">Ketuk untuk unggah gambar</Text>
              <Text className="mt-0.5 text-xs text-ink-tertiary">{hint}</Text>
            </>
          )}
        </Pressable>
      )}
    </View>
  );
}
