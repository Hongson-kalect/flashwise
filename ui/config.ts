/**
 * Cấu hình toàn cục của UI kit. App gọi configureUI() MỘT lần lúc khởi động (trước khi render);
 * không gọi thì dùng mặc định (font hệ thống).
 */
export type FontWeightKey =
  | "light"
  | "regular"
  | "medium"
  | "semibold"
  | "bold"
  | "extrabold";

export type UIConfig = {
  /** Tên font đã nạp (expo-font) cho từng độ đậm. Android bỏ qua fontWeight với font custom nên phải map từng file. */
  fonts: Record<FontWeightKey, string | undefined>;
  /** Rung nhẹ khi bấm (Button, tab...). Tắt toàn bộ bằng false hoặc theo setting của app. */
  haptics: boolean;
};

export const uiConfig: UIConfig = {
  fonts: {
    light: undefined,
    regular: undefined,
    medium: undefined,
    semibold: undefined,
    bold: undefined,
    extrabold: undefined,
  },
  haptics: true,
};

export const configureUI = (patch: Partial<UIConfig>) => {
  if (patch.fonts) Object.assign(uiConfig.fonts, patch.fonts);
  if (patch.haptics !== undefined) uiConfig.haptics = patch.haptics;
};
