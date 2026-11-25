/**
 * components/ProductCardSkeleton.tsx
 * ------------------------------------------------------------------
 * Kerangka (skeleton) kartu yang berdenyut saat data dimuat.
 * Memberi persepsi aplikasi lebih cepat dibanding spinner kosong.
 * Animasi memakai Reanimated (berjalan di UI thread → tetap 60 fps).
 */
import React, { useEffect } from "react";
import { View } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from "react-native-reanimated";
import { colors } from "../theme/colors";

export default function ProductCardSkeleton({ width }: { width: number }) {
  const opacity = useSharedValue(0.5);

  useEffect(() => {
    // Denyut 0.5 ↔ 1 tanpa henti
    opacity.value = withRepeat(withTiming(1, { duration: 700 }), -1, true);
  }, [opacity]);

  const pulse = useAnimatedStyle(() => ({ opacity: opacity.value }));

  return (
    <Animated.View
      style={[{ width, borderRadius: 16, backgroundColor: colors.surface, overflow: "hidden" }, pulse]}
    >
      <View style={{ width, height: width, backgroundColor: colors.border }} />
      <View style={{ padding: 12, gap: 8 }}>
        <View style={{ height: 12, width: "80%", borderRadius: 6, backgroundColor: colors.border }} />
        <View style={{ height: 10, width: "100%", borderRadius: 5, backgroundColor: colors.borderSubtle }} />
        <View style={{ height: 14, width: "50%", borderRadius: 7, backgroundColor: colors.border }} />
      </View>
    </Animated.View>
  );
}
