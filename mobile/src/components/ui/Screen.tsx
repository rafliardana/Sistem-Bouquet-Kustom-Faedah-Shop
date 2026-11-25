// Pembungkus setiap layar: SafeAreaView agar konten tidak tertutup
// notch / status bar / home indicator di iOS maupun Android.
import type { ReactNode } from "react";
import { View } from "react-native";
import { SafeAreaView, type Edge } from "react-native-safe-area-context";
import { colors } from "@/theme/colors";

interface ScreenProps {
  children: ReactNode;
  edges?: Edge[]; // default: atas saja, karena bawah sudah ditangani tab bar
  className?: string;
}

export function Screen({ children, edges = ["top"], className = "" }: ScreenProps) {
  return (
    <SafeAreaView edges={edges} style={{ flex: 1, backgroundColor: colors.surfaceSecondary }}>
      <View className={`flex-1 ${className}`}>{children}</View>
    </SafeAreaView>
  );
}
