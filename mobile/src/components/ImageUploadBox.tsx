/**
 * components/ImageUploadBox.tsx
 * ------------------------------------------------------------------
 * Komponen unggah gambar serbaguna (dipakai untuk Foto Referensi Buket
 * di Kustomisasi dan Bukti Transfer di Checkout).
 * Mendukung pemilihan dari Galeri maupun pemotretan langsung Kamera
 * melalui expo-image-picker, lengkap dengan pratinjau & tombol hapus.
 */
import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import React from "react";
import { Pressable, Text, View } from "react-native";

import { colors } from "../theme/colors";
import type { PickedImage } from "../types";
import { pickImageFromCamera, pickImageFromGallery } from "../utils/imagePicker";

interface ImageUploadBoxProps {
  label: string;
  hint: string;
  filePrefix: string;
  required?: boolean;
  value: PickedImage | null;
  onChange: (image: PickedImage | null) => void;
}

export default function ImageUploadBox({
  label,
  hint,
  filePrefix,
  required = false,
  value,
  onChange,
}: ImageUploadBoxProps) {
  const handleGallery = async () => {
    const picked = await pickImageFromGallery(filePrefix);
    if (picked) onChange(picked);
  };

  const handleCamera = async () => {
    const picked = await pickImageFromCamera(filePrefix);
    if (picked) onChange(picked);
  };

  return (
    <View className="gap-2">
      <View className="flex-row items-center justify-between">
        <Text className="text-[14px] font-bold text-ink">
          {label} {required && <Text className="text-danger">*</Text>}
        </Text>
        <Text className="text-[11px] text-ink-tertiary">{required ? "Wajib" : "Opsional"}</Text>
      </View>

      {value ? (
        // Pratinjau foto terpilih + tombol hapus
        <View className="overflow-hidden rounded-2xl border border-line bg-surface">
          <Image
            source={{ uri: value.uri }}
            style={{ width: "100%", height: 180 }}
            contentFit="cover"
            transition={200}
          />
          <View className="flex-row items-center justify-between px-3 py-2.5">
            <Text className="flex-1 text-[12px] text-ink-secondary" numberOfLines={1}>
              {value.fileName}
            </Text>
            <Pressable
              onPress={() => onChange(null)}
              accessibilityRole="button"
              className="ml-3 flex-row items-center gap-1 rounded-full bg-danger-bg px-3 py-1.5 active:opacity-80"
            >
              <Ionicons name="trash-outline" size={14} color={colors.danger} />
              <Text className="text-[12px] font-semibold text-danger">Hapus</Text>
            </Pressable>
          </View>
        </View>
      ) : (
        // Kotak pilih dari Galeri atau Kamera
        <View className="rounded-2xl border border-dashed border-brand-secondary bg-brand-muted/60 p-4">
          <Text className="text-center text-[12px] leading-4 text-ink-secondary">{hint}</Text>
          <View className="mt-3 flex-row gap-2.5">
            <Pressable
              onPress={handleGallery}
              accessibilityRole="button"
              className="flex-1 flex-row items-center justify-center gap-1.5 rounded-xl border border-brand bg-surface py-2.5 active:opacity-80"
            >
              <Ionicons name="images-outline" size={16} color={colors.brand} />
              <Text className="text-[13px] font-semibold text-brand">Galeri</Text>
            </Pressable>
            <Pressable
              onPress={handleCamera}
              accessibilityRole="button"
              className="flex-1 flex-row items-center justify-center gap-1.5 rounded-xl bg-brand py-2.5 active:opacity-80"
            >
              <Ionicons name="camera-outline" size={16} color={colors.white} />
              <Text className="text-[13px] font-semibold text-white">Kamera</Text>
            </Pressable>
          </View>
        </View>
      )}
    </View>
  );
}
