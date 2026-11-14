import { FontWeightKey, uiConfig } from "./config";

/** Thang cỡ chữ: fontSize + lineHeight (đã tính sẵn để chữ không bị cắt). */
export const TextSize = {
  tiny: { fontSize: 10, lineHeight: 13 },
  xxs: { fontSize: 10, lineHeight: 13 },
  xs: { fontSize: 11, lineHeight: 15 },
  sm: { fontSize: 13, lineHeight: 18 },
  md: { fontSize: 15, lineHeight: 21 },
  lg: { fontSize: 17, lineHeight: 23 },
  xl: { fontSize: 19, lineHeight: 26 },
  "2xl": { fontSize: 22, lineHeight: 29 },
  "3xl": { fontSize: 26, lineHeight: 33 },
  display: { fontSize: 36, lineHeight: 42 },
  displayLarge: { fontSize: 44, lineHeight: 50 },
} as const;
export type TextSizeKey = keyof typeof TextSize;

export const TextWeight = {
  light: "300",
  regular: "400",
  medium: "500",
  semibold: "600",
  bold: "700",
  extrabold: "800",
} as const;

export const Opacity = {
  full: 1,
  high: 0.9,
  medium: 0.7,
  half: 0.5,
  low: 0.3,
  fade: 0.1,
  none: 0,
} as const;
export type OpacityKey = keyof typeof Opacity;

/** Style font cho 1 độ đậm: dùng font đã cấu hình, không có thì fontWeight hệ thống. */
export const fontStyleFor = (weight: FontWeightKey) => {
  const family = uiConfig.fonts[weight];
  return family
    ? { fontFamily: family }
    : { fontWeight: TextWeight[weight] as "300" };
};

/** Số tương ứng lineHeight khi truyền cỡ chữ tuỳ ý (number). */
export const lineHeightFor = (fontSize: number) => Math.round(fontSize * 1.4);
