// Tombol standar (pengganti <Button> web). Memakai Pressable dengan
// umpan balik visual saat ditekan, status loading, dan disabled.
import type { ComponentProps } from "react";
import { ActivityIndicator, Pressable, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { colors } from "@/theme/colors";

type Variant = "primary" | "secondary" | "ghost" | "danger";

interface ButtonProps {
  label: string;
  onPress?: () => void;
  variant?: Variant;
  icon?: ComponentProps<typeof Ionicons>["name"];
  loading?: boolean;
  disabled?: boolean;
  className?: string;
}

const CONTAINER: Record<Variant, string> = {
  primary: "bg-brand",
  secondary: "bg-brand-tertiary",
  ghost: "bg-transparent border border-line",
  danger: "bg-danger",
};
const TEXT: Record<Variant, string> = {
  primary: "text-white",
  secondary: "text-brand-dark",
  ghost: "text-ink",
  danger: "text-white",
};
const ICON_COLOR: Record<Variant, string> = {
  primary: "#ffffff",
  secondary: colors.brandDark,
  ghost: colors.ink,
  danger: "#ffffff",
};

export function Button({ label, onPress, variant = "primary", icon, loading, disabled, className = "" }: ButtonProps) {
  const inactive = disabled || loading;
  return (
    <Pressable
      onPress={onPress}
      disabled={inactive}
      accessibilityRole="button"
      accessibilityState={{ disabled: !!inactive, busy: !!loading }}
      className={`h-12 flex-row items-center justify-center rounded-xl px-5 active:opacity-80 ${CONTAINER[variant]} ${
        inactive ? "opacity-50" : ""
      } ${className}`}
    >
      {loading ? (
        <ActivityIndicator color={ICON_COLOR[variant]} />
      ) : (
        <View className="flex-row items-center gap-2">
          {icon && <Ionicons name={icon} size={18} color={ICON_COLOR[variant]} />}
          <Text className={`text-base font-semibold ${TEXT[variant]}`}>{label}</Text>
        </View>
      )}
    </Pressable>
  );
}
