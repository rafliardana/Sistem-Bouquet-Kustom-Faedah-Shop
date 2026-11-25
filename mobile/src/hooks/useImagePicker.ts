// Membungkus expo-image-picker: meminta izin, membuka galeri/kamera,
// lalu mengompres gambar (maks lebar 1280px, JPEG 70%) dengan
// expo-image-manipulator agar upload cepat dan di bawah batas 10 MB server.
import { useState } from "react";
import { Alert } from "react-native";
import * as ImagePicker from "expo-image-picker";
import { manipulateAsync, SaveFormat } from "expo-image-manipulator";
import type { PickedImage } from "@/types";

const MAX_WIDTH = 1280;

async function compress(asset: ImagePicker.ImagePickerAsset, prefix: string): Promise<PickedImage> {
  const actions = asset.width > MAX_WIDTH ? [{ resize: { width: MAX_WIDTH } }] : [];
  const result = await manipulateAsync(asset.uri, actions, { compress: 0.7, format: SaveFormat.JPEG });
  return { uri: result.uri, name: `${prefix}-${Date.now()}.jpg`, mimeType: "image/jpeg" };
}

export function useImagePicker(prefix: string) {
  const [image, setImage] = useState<PickedImage | null>(null);
  const [processing, setProcessing] = useState(false);

  async function handleResult(result: ImagePicker.ImagePickerResult) {
    if (result.canceled || !result.assets?.length) return;
    setProcessing(true);
    try {
      setImage(await compress(result.assets[0], prefix));
    } catch {
      Alert.alert("Gagal", "Gambar tidak dapat diproses. Coba pilih gambar lain.");
    } finally {
      setProcessing(false);
    }
  }

  async function pickFromGallery() {
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) {
      Alert.alert("Izin diperlukan", "Izinkan akses galeri untuk memilih foto.");
      return;
    }
    await handleResult(await ImagePicker.launchImageLibraryAsync({ mediaTypes: ["images"], quality: 1 }));
  }

  async function takePhoto() {
    const perm = await ImagePicker.requestCameraPermissionsAsync();
    if (!perm.granted) {
      Alert.alert("Izin diperlukan", "Izinkan akses kamera untuk mengambil foto.");
      return;
    }
    await handleResult(await ImagePicker.launchCameraAsync({ mediaTypes: ["images"], quality: 1 }));
  }

  // Menampilkan pilihan sumber gambar (galeri atau kamera).
  function choose() {
    Alert.alert("Unggah Gambar", "Pilih sumber gambar", [
      { text: "Galeri", onPress: pickFromGallery },
      { text: "Kamera", onPress: takePhoto },
      { text: "Batal", style: "cancel" },
    ]);
  }

  return { image, setImage, processing, choose, clear: () => setImage(null) };
}
