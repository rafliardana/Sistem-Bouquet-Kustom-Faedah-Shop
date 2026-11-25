/**
 * babel.config.js
 * Mengaktifkan NativeWind: JSX diproses agar prop `className`
 * diterjemahkan menjadi style React Native.
 */
module.exports = function (api) {
  api.cache(true);
  return {
    presets: [
      ["babel-preset-expo", { jsxImportSource: "nativewind" }],
      "nativewind/babel",
    ],
  };
};
