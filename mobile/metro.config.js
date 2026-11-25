// Konfigurasi Metro bundler: membungkus config default Expo dengan NativeWind
// agar file global.css (Tailwind) dikompilasi menjadi style React Native.
const { getDefaultConfig } = require("expo/metro-config");
const { withNativeWind } = require("nativewind/metro");

const config = getDefaultConfig(__dirname);

module.exports = withNativeWind(config, { input: "./global.css" });
