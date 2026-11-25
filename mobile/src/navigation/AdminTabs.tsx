// Navigasi Admin/Owner: Bottom Tabs (Dashboard, Pesanan, Produk, Akun).
// Tab Produk berisi Native Stack: Daftar Produk -> Form Tambah/Edit.
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { Ionicons } from "@expo/vector-icons";
import { AdminDashboardScreen } from "@/screens/admin/AdminDashboardScreen";
import { AdminOrdersScreen } from "@/screens/admin/AdminOrdersScreen";
import { AdminProductsScreen } from "@/screens/admin/AdminProductsScreen";
import { AdminProductFormScreen } from "@/screens/admin/AdminProductFormScreen";
import { AccountScreen } from "@/screens/customer/AccountScreen";
import { colors } from "@/theme/colors";
import type { AdminProductStackParamList, AdminTabParamList } from "./types";

const Stack = createNativeStackNavigator<AdminProductStackParamList>();
const Tab = createBottomTabNavigator<AdminTabParamList>();

function ProductStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerTintColor: colors.brand,
        headerTitleStyle: { color: colors.ink, fontWeight: "700" },
        headerBackButtonDisplayMode: "minimal",
        contentStyle: { backgroundColor: colors.surfaceSecondary },
      }}
    >
      <Stack.Screen name="ProductList" component={AdminProductsScreen} options={{ title: "Kelola Produk" }} />
      <Stack.Screen name="ProductForm" component={AdminProductFormScreen} />
    </Stack.Navigator>
  );
}

const ICONS: Record<keyof AdminTabParamList, [keyof typeof Ionicons.glyphMap, keyof typeof Ionicons.glyphMap]> = {
  DashboardTab: ["stats-chart", "stats-chart-outline"],
  OrdersTab: ["receipt", "receipt-outline"],
  ProductsTab: ["flower", "flower-outline"],
  AdminAccountTab: ["person", "person-outline"],
};

export function AdminTabs() {
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
      <Tab.Screen name="DashboardTab" component={AdminDashboardScreen} options={{ title: "Dashboard" }} />
      <Tab.Screen name="OrdersTab" component={AdminOrdersScreen} options={{ title: "Pesanan" }} />
      <Tab.Screen name="ProductsTab" component={ProductStack} options={{ title: "Produk" }} />
      <Tab.Screen name="AdminAccountTab" component={AccountScreen} options={{ title: "Akun" }} />
    </Tab.Navigator>
  );
}
