/**
 * metro.config.js
 * Metro adalah bundler React Native. withNativeWind menambahkan
 * transformer yang mengompilasi global.css (Tailwind) menjadi style native.
 */
const { getDefaultConfig } = require("expo/metro-config");
const { withNativeWind } = require("nativewind/metro");

const config = getDefaultConfig(__dirname);

module.exports = withNativeWind(config, { input: "./global.css" });
