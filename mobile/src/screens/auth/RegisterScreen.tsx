// Layar Daftar akun pelanggan. Setelah berhasil, pengguna langsung login otomatis.
import { useState } from "react";
import { KeyboardAvoidingView, Platform, ScrollView, Text, View } from "react-native";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { Button } from "@/components/ui/Button";
import { TextField } from "@/components/ui/TextField";
import { useAuth } from "@/context/AuthContext";
import type { RootStackParamList } from "@/navigation/types";

type Props = NativeStackScreenProps<RootStackParamList, "Register">;

export function RegisterScreen({ navigation }: Props) {
  const { register } = useAuth();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async () => {
    if (!name.trim() || !email.trim() || !password) return setError("Semua field wajib diisi");
    if (!/^\S+@\S+\.\S+$/.test(email.trim())) return setError("Format email tidak valid");
    if (password.length < 6) return setError("Password minimal 6 karakter");
    setLoading(true);
    setError("");
    try {
      await register(name, email, password);
      if (navigation.canGoBack()) navigation.goBack();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Pendaftaran gagal");
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView className="flex-1 bg-surface" behavior={Platform.OS === "ios" ? "padding" : undefined}>
      <ScrollView contentContainerStyle={{ padding: 24, flexGrow: 1, justifyContent: "center" }} keyboardShouldPersistTaps="handled">
        <Text className="text-center text-2xl font-bold text-ink">Buat Akun</Text>
        <Text className="mb-8 mt-1 text-center text-sm text-ink-secondary">Daftar untuk memesan bouquet kustom.</Text>

        <TextField label="Nama Lengkap" placeholder="Masukkan nama lengkap" value={name} onChangeText={setName} autoComplete="name" />
        <TextField label="Email" placeholder="nama@email.com" value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" autoComplete="email" />
        <TextField label="Password" placeholder="Minimal 6 karakter" value={password} onChangeText={setPassword} secureTextEntry autoComplete="new-password" />
        {!!error && <Text className="mb-3 text-center text-sm text-danger">{error}</Text>}

        <Button label="Daftar" onPress={submit} loading={loading} />
        <View className="mt-4 flex-row justify-center">
          <Text className="text-sm text-ink-secondary">Sudah punya akun? </Text>
          <Text className="text-sm font-semibold text-brand" onPress={() => navigation.replace("Login")}>
            Masuk
          </Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
