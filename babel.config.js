/* SQL */ // (Tô màu cho vui thôi chứ đây là JS nhé)
module.exports = function (api) {
  api.cache(true);
  return {
    presets: [
      ["babel-preset-expo", { jsxImportSource: "nativewind" }],
      "nativewind/babel",
    ],
    plugins: [
      "react-native-paper/babel",
      "react-native-reanimated/plugin", // Đưa ra ngoài để dùng cho cả Dev và Prod
    ],
  };
};
