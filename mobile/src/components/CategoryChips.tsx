/**
 * components/CategoryChips.tsx
 * ------------------------------------------------------------------
 * Filter kategori berbentuk "chip" yang dapat digeser horizontal.
 * Pola ini menggantikan tab kategori versi web dan hemat ruang
 * di layar ponsel yang sempit.
 */
import React from "react";
import { Pressable, ScrollView, Text } from "react-native";

interface CategoryChipsProps {
  categories: string[];
  selected: string;
  onSelect: (category: string) => void;
}

export default function CategoryChips({ categories, selected, onSelect }: CategoryChipsProps) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerClassName="gap-2 px-5"
    >
      {categories.map((cat) => {
        const active = cat === selected;
        return (
          <Pressable
            key={cat}
            onPress={() => onSelect(cat)}
            accessibilityRole="button"
            accessibilityState={{ selected: active }}
            className={`rounded-full border px-4 py-2 active:opacity-70 ${
              active ? "border-brand bg-brand" : "border-line bg-surface"
            }`}
          >
            <Text className={`text-[13px] font-semibold ${active ? "text-white" : "text-ink-secondary"}`}>
              {cat}
            </Text>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}
