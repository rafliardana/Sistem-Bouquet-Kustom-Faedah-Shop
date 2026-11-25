/**
 * components/SearchBar.tsx
 * ------------------------------------------------------------------
 * Kolom pencarian buket dengan ikon kaca pembesar dan tombol hapus.
 */
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { Pressable, TextInput, View } from "react-native";
import { colors } from "../theme/colors";

interface SearchBarProps {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
}

export default function SearchBar({ value, onChangeText, placeholder = "Cari buket favoritmu..." }: SearchBarProps) {
  return (
    <View className="flex-row items-center rounded-2xl border border-line bg-surface px-3">
      <Ionicons name="search" size={18} color={colors.textTertiary} />
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={colors.textTertiary}
        returnKeyType="search"
        autoCorrect={false}
        clearButtonMode="never"
        // Tinggi tetap (bukan padding) agar sama persis di Android & iOS
        className="ml-2 h-11 flex-1 text-[15px] text-ink"
        accessibilityLabel="Cari produk"
      />
      {value.length > 0 && (
        <Pressable onPress={() => onChangeText("")} hitSlop={10} accessibilityLabel="Hapus pencarian">
          <Ionicons name="close-circle" size={18} color={colors.textTertiary} />
        </Pressable>
      )}
    </View>
  );
}
