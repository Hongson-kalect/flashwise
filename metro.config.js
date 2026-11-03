const { getDefaultConfig } = require("expo/metro-config");
const { withNativeWind } = require("nativewind/metro");
const {
  wrapWithReanimatedMetroConfig,
} = require("react-native-reanimated/metro-config");

const config = getDefaultConfig(__dirname);

// Bỏ qua output build native (android/build, .gradle, .cxx): hàng GB file, Metro quét sẽ bị treo.
const nativeBuildDirs = /[\\/]android[\\/](app[\\/])?(build|\\.gradle|\\.cxx)[\\/].*/;
config.resolver.blockList = [].concat(config.resolver.blockList ?? [], nativeBuildDirs);

module.exports = wrapWithReanimatedMetroConfig(
  withNativeWind(config, { input: "./app/globals.css" })
);