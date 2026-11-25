// Navigator akar. Menunggu sesi dipulihkan dari AsyncStorage, lalu memilih alur
// berdasarkan role: admin/owner -> AdminTabs, customer/tamu -> CustomerTabs.
// Login & Register tampil sebagai modal; setelah login, navigator otomatis berganti.
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { useAuth } from "@/context/AuthContext";
import { LoadingView } from "@/components/ui/StateViews";
import { LoginScreen } from "@/screens/auth/LoginScreen";
import { RegisterScreen } from "@/screens/auth/RegisterScreen";
import { CustomerTabs } from "./CustomerTabs";
import { AdminTabs } from "./AdminTabs";
import type { RootStackParamList } from "./types";

const Stack = createNativeStackNavigator<RootStackParamList>();

export function RootNavigator() {
  const { initializing, isStaff } = useAuth();
  if (initializing) return <LoadingView message="Menyiapkan Faedah Shop..." />;

  return (
    <Stack.Navigator>
      {isStaff ? (
        <Stack.Screen name="AdminMain" component={AdminTabs} options={{ headerShown: false }} />
      ) : (
        <Stack.Screen name="CustomerMain" component={CustomerTabs} options={{ headerShown: false }} />
      )}
      <Stack.Group screenOptions={{ presentation: "modal", title: "" }}>
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="Register" component={RegisterScreen} />
      </Stack.Group>
    </Stack.Navigator>
  );
}
