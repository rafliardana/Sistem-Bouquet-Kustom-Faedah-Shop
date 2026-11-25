// Titik masuk aplikasi: memuat CSS NativeWind lalu memasang provider
// (SafeArea -> Auth -> Store -> Navigation) di sekitar RootNavigator.
import "./global.css";
import { StatusBar } from "expo-status-bar";
import { DefaultTheme, NavigationContainer } from "@react-navigation/native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { AuthProvider } from "@/context/AuthContext";
import { StoreProvider } from "@/context/StoreContext";
import { RootNavigator } from "@/navigation/RootNavigator";
import { colors } from "@/theme/colors";

// Tema navigasi disesuaikan dengan warna brand Faedah Shop.
const navTheme = {
  ...DefaultTheme,
  colors: { ...DefaultTheme.colors, primary: colors.brand, background: colors.surfaceSecondary },
};

export default function App() {
  return (
    <SafeAreaProvider>
      <AuthProvider>
        <StoreProvider>
          <NavigationContainer theme={navTheme}>
            <RootNavigator />
            <StatusBar style="dark" />
          </NavigationContainer>
        </StoreProvider>
      </AuthProvider>
    </SafeAreaProvider>
  );
}
