/**
 * utils/imagePicker.ts
 * ------------------------------------------------------------------
 * Pembungkus expo-image-picker untuk memilih foto referensi buket
 * maupun bukti transfer dari Galeri atau Kamera secara konsisten
 * pada Android & iOS (dengan kompresi quality 0.75 agar hemat kuota).
 */
import * as ImagePicker from "expo-image-picker";
import { Alert } from "react-native";
import type { PickedImage } from "../types";

function assetToPickedImage(asset: ImagePicker.ImagePickerAsset, fallbackPrefix: string): PickedImage {
  const mimeType = asset.mimeType ?? "image/jpeg";
  const ext = mimeType.split("/")[1] || "jpg";
  const fileName = asset.fileName ?? `${fallbackPrefix}-${Date.now()}.${ext}`;
  return { uri: asset.uri, mimeType, fileName };
}

/** Memilih gambar dari Galeri perangkat */
export async function pickImageFromGallery(prefix = "image"): Promise<PickedImage | null> {
  const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
  if (!permission.granted) {
    Alert.alert("Izin Galeri Diperlukan", "Aktifkan izin galeri agar Anda dapat memilih foto.");
    return null;
  }

  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ["images"],
    allowsEditing: true,
    quality: 0.75, // kompresi ringan agar unggahan multipart cepat & < 5 MB
  });

  if (result.canceled || !result.assets?.[0]) return null;
  return assetToPickedImage(result.assets[0], prefix);
}

/** Mengambil foto langsung menggunakan Kamera perangkat */
export async function pickImageFromCamera(prefix = "photo"): Promise<PickedImage | null> {
  const permission = await ImagePicker.requestCameraPermissionsAsync();
  if (!permission.granted) {
    Alert.alert("Izin Kamera Diperlukan", "Aktifkan izin kamera agar Anda dapat memotret langsung.");
    return null;
  }

  const result = await ImagePicker.launchCameraAsync({
    mediaTypes: ["images"],
    allowsEditing: true,
    quality: 0.75,
  });

  if (result.canceled || !result.assets?.[0]) return null;
  return assetToPickedImage(result.assets[0], prefix);
}
