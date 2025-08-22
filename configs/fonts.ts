export type FontFamily = keyof typeof fonts;

export const fonts = {
  SpaceMono: require("@/assets/fonts/SpaceMono-Regular.ttf"),
  PoppinsThin: require("@/assets/fonts/Poppins/Poppins-Thin.ttf"),
  PoppinsThinItalic: require("@/assets/fonts/Poppins/Poppins-ThinItalic.ttf"),
  PoppinsSemiBold: require("@/assets/fonts/Poppins/Poppins-SemiBold.ttf"),
  PoppinsSemiBoldItalic: require("@/assets/fonts/Poppins/Poppins-SemiBoldItalic.ttf"),
  PoppinsRegular: require("@/assets/fonts/Poppins/Poppins-Regular.ttf"),
  PoppinsRegularItalic: require("@/assets/fonts/Poppins/Poppins-Italic.ttf"),
  PoppinsMedium: require("@/assets/fonts/Poppins/Poppins-Medium.ttf"),
  PoppinsMediumItalic: require("@/assets/fonts/Poppins/Poppins-MediumItalic.ttf"),
  PoppinsLight: require("@/assets/fonts/Poppins/Poppins-Light.ttf"),
  PoppinsLightItalic: require("@/assets/fonts/Poppins/Poppins-LightItalic.ttf"),
  PoppinsExtraLight: require("@/assets/fonts/Poppins/Poppins-ExtraLight.ttf"),
  PoppinsExtraLightItalic: require("@/assets/fonts/Poppins/Poppins-ExtraLightItalic.ttf"),
  PoppinsExtraBold: require("@/assets/fonts/Poppins/Poppins-ExtraBold.ttf"),
  PoppinsExtraBoldItalic: require("@/assets/fonts/Poppins/Poppins-ExtraBoldItalic.ttf"),
  PoppinsBold: require("@/assets/fonts/Poppins/Poppins-Bold.ttf"),
  PoppinsBoldItalic: require("@/assets/fonts/Poppins/Poppins-BoldItalic.ttf"),
  PoppinsBlack: require("@/assets/fonts/Poppins/Poppins-Black.ttf"),
  PoppinsBlackItalic: require("@/assets/fonts/Poppins/Poppins-BlackItalic.ttf"),
};

export const fontFamily = Object.fromEntries(
  Object.keys(fonts).map((key) => [key, key])
) as Record<keyof typeof fonts, keyof typeof fonts>;
