import { FontWeightKey, uiConfig } from "./config";

/** Thang cỡ chữ: fontSize + lineHeight (đã tính sẵn để chữ không bị cắt). */
export const TextSize = {
  tiny: { fontSize: 10, lineHeight: 13 },
  xxs: { fontSize: 10, lineHeight: 13 },
  xs: { fontSize: 12, lineHeight: 17 },
  sm: { fontSize: 14, lineHeight: 20 },
  md: { fontSize: 16, lineHeight: 22 },
  lg: { fontSize: 18, lineHeight: 25 },
  xl: { fontSize: 20, lineHeight: 28 },
  "2xl": { fontSize: 24, lineHeight: 32 },
  "3xl": { fontSize: 28, lineHeight: 36 },
  display: { fontSize: 40, lineHeight: 48 },
  displayLarge: { fontSize: 48, lineHeight: 56 },
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
