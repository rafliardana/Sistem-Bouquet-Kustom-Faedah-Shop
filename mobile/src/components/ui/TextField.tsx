// Input teks berlabel (pengganti <input> / <textarea> web) dengan pesan bantuan & error.
import { Text, TextInput, View, type TextInputProps } from "react-native";
import { colors } from "@/theme/colors";

interface TextFieldProps extends TextInputProps {
  label: string;
  hint?: string;
  error?: string;
}

export function TextField({ label, hint, error, multiline, ...props }: TextFieldProps) {
  return (
    <View className="mb-4">
      <Text className="mb-1.5 text-sm font-semibold text-ink">{label}</Text>
      <TextInput
        placeholderTextColor={colors.inkTertiary}
        multiline={multiline}
        textAlignVertical={multiline ? "top" : "center"}
        className={`rounded-xl border bg-surface px-3.5 text-base text-ink ${
          multiline ? "min-h-[96px] py-3" : "h-12"
        } ${error ? "border-danger" : "border-line"}`}
        {...props}
      />
      {error ? (
        <Text className="mt-1 text-xs text-danger">{error}</Text>
      ) : hint ? (
        <Text className="mt-1 text-xs text-ink-tertiary">{hint}</Text>
      ) : null}
    </View>
  );
}
