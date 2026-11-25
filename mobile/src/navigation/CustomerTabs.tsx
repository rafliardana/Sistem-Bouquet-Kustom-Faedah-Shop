// Navigasi customer: Bottom Tabs (Katalog, Pesanan Saya, Akun).
// Tab Katalog berisi Native Stack: Katalog -> Kustomisasi -> Checkout.
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { Ionicons } from "@expo/vector-icons";
import { CatalogScreen } from "@/screens/customer/CatalogScreen";
import { CustomizeScreen } from "@/screens/customer/CustomizeScreen";
import { CheckoutScreen } from "@/screens/customer/CheckoutScreen";
import { MyOrdersScreen } from "@/screens/customer/MyOrdersScreen";
import { AccountScreen } from "@/screens/customer/AccountScreen";
import { colors } from "@/theme/colors";
import type { CatalogStackParamList, CustomerTabParamList } from "./types";

const Stack = createNativeStackNavigator<CatalogStackParamList>();
const Tab = createBottomTabNavigator<CustomerTabParamList>();

function CatalogStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerTintColor: colors.brand,
        headerTitleStyle: { color: colors.ink, fontWeight: "700" },
        headerBackButtonDisplayMode: "minimal",
      }}
    >
      <Stack.Screen name="Catalog" component={CatalogScreen} options={{ headerShown: false }} />
      <Stack.Screen name="Customize" component={CustomizeScreen} options={{ title: "Kustomisasi Bouquet" }} />
      <Stack.Screen name="Checkout" component={CheckoutScreen} options={{ title: "Checkout" }} />
    </Stack.Navigator>
  );
}

const ICONS: Record<keyof CustomerTabParamList, [keyof typeof Ionicons.glyphMap, keyof typeof Ionicons.glyphMap]> = {
  KatalogTab: ["flower", "flower-outline"],
  PesananTab: ["receipt", "receipt-outline"],
  AkunTab: ["person", "person-outline"],
};

export function CustomerTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: colors.brand,
        tabBarInactiveTintColor: colors.inkTertiary,
        tabBarIcon: ({ focused, color, size }) => (
          <Ionicons name={ICONS[route.name][focused ? 0 : 1]} size={size} color={color} />
        ),
      })}
    >
      <Tab.Screen name="KatalogTab" component={CatalogStack} options={{ title: "Katalog" }} />
      <Tab.Screen name="PesananTab" component={MyOrdersScreen} options={{ title: "Pesanan Saya" }} />
      <Tab.Screen name="AkunTab" component={AccountScreen} options={{ title: "Akun" }} />
    </Tab.Navigator>
  );
}
