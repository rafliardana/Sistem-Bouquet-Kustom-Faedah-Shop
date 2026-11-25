// Layar Akun: profil pengguna, info server yang terhubung, dan tombol keluar.
import { Alert, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { Screen } from "@/components/ui/Screen";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { useAuth } from "@/context/AuthContext";
import { API_URL } from "@/config/env";
import { colors } from "@/theme/colors";

const ROLE_LABEL = { owner: "Owner", admin: "Admin", customer: "Pelanggan" } as const;

export function AccountScreen() {
  const { user, logout } = useAuth();
  const navigation = useNavigation();

  const confirmLogout = () =>
    Alert.alert("Keluar", "Yakin ingin keluar dari akun?", [
      { text: "Batal", style: "cancel" },
      { text: "Keluar", style: "destructive", onPress: () => void logout() },
    ]);

  return (
    <Screen className="gap-4 p-4">
      <Text className="text-2xl font-bold text-ink">Akun</Text>
      {user ? (
        <Card>
          <View className="flex-row items-center">
            <View className="h-14 w-14 items-center justify-center rounded-full bg-brand-tertiary">
              <Text className="text-xl font-bold text-brand">{user.name.charAt(0).toUpperCase()}</Text>
            </View>
            <View className="ml-3 flex-1">
              <Text className="text-base font-bold text-ink">{user.name}</Text>
              <Text className="text-sm text-ink-secondary">{user.email}</Text>
              <Text className="mt-0.5 text-xs text-brand">{ROLE_LABEL[user.role]}</Text>
            </View>
          </View>
          <Button label="Keluar" variant="ghost" icon="log-out-outline" onPress={confirmLogout} className="mt-4" />
        </Card>
      ) : (
        <Card title="Belum masuk" subtitle="Masuk atau daftar untuk memesan dan melacak pesanan.">
          <Button label="Masuk" icon="log-in-outline" onPress={() => navigation.navigate("Login")} />
          <Button label="Daftar Akun Baru" variant="secondary" onPress={() => navigation.navigate("Register")} className="mt-2" />
        </Card>
      )}
      <View className="flex-row items-center">
        <Ionicons name="server-outline" size={14} color={colors.inkTertiary} />
        <Text className="ml-1.5 text-xs text-ink-tertiary">Server: {API_URL}</Text>
      </View>
    </Screen>
  );
}
