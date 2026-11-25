// Kontainer kartu putih dengan sudut membulat dan garis tepi tipis.
import type { ReactNode } from "react";
import { Text, View } from "react-native";

interface CardProps {
  children: ReactNode;
  title?: string;
  subtitle?: string;
  className?: string;
}

export function Card({ children, title, subtitle, className = "" }: CardProps) {
  return (
    <View className={`rounded-2xl border border-line bg-surface p-4 ${className}`}>
      {title && <Text className="text-base font-bold text-ink">{title}</Text>}
      {subtitle && <Text className="mt-0.5 text-xs text-ink-tertiary">{subtitle}</Text>}
      {(title || subtitle) && <View className="h-3" />}
      {children}
    </View>
  );
}
