// Layar Masuk (pengganti CustomerLoginPage + AdminLoginPage web).
// Satu layar untuk semua peran: setelah login, RootNavigator otomatis
// mengarahkan admin/owner ke panel admin dan customer ke toko.
import { useState } from "react";
import { KeyboardAvoidingView, Platform, ScrollView, Text, View } from "react-native";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { Button } from "@/components/ui/Button";
import { TextField } from "@/components/ui/TextField";
import { useAuth } from "@/context/AuthContext";
import type { RootStackParamList } from "@/navigation/types";

type Props = NativeStackScreenProps<RootStackParamList, "Login">;

export function LoginScreen({ navigation }: Props) {
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async () => {
    if (!email.trim() || !password) {
      setError("Email dan password wajib diisi");
      return;
    }
    setLoading(true);
    setError("");
    try {
      await login(email, password);
      if (navigation.canGoBack()) navigation.goBack();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Login gagal");
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView className="flex-1 bg-surface" behavior={Platform.OS === "ios" ? "padding" : undefined}>
      <ScrollView contentContainerStyle={{ padding: 24, flexGrow: 1, justifyContent: "center" }} keyboardShouldPersistTaps="handled">
        <Text className="text-center text-4xl">🌸</Text>
        <Text className="mt-2 text-center text-2xl font-bold text-ink">Masuk ke Faedah Shop</Text>
        <Text className="mb-8 mt-1 text-center text-sm text-ink-secondary">Pelanggan, admin, dan owner masuk di sini.</Text>

        <TextField label="Email" placeholder="nama@email.com" value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" autoComplete="email" />
        <TextField label="Password" placeholder="••••••••" value={password} onChangeText={setPassword} secureTextEntry autoComplete="password" onSubmitEditing={submit} />
        {!!error && <Text className="mb-3 text-center text-sm text-danger">{error}</Text>}

        <Button label="Masuk" onPress={submit} loading={loading} />
        <View className="mt-4 flex-row justify-center">
          <Text className="text-sm text-ink-secondary">Belum punya akun? </Text>
          <Text className="text-sm font-semibold text-brand" onPress={() => navigation.replace("Register")}>
            Daftar
          </Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
