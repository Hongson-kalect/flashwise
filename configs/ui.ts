import { configureUI } from "@/ui";

/**
 * Cấu hình UI kit cho Flashwise (chỗ DUY NHẤT gắn kit với app này). Import 1 lần ở app/_layout.tsx
 * trước khi render. Font: tên đã nạp trong configs/fonts.ts.
 */
configureUI({
  fonts: {
    light: "MulishLight",
    regular: "MulishRegular",
    medium: "MulishMedium",
    semibold: "MulishSemiBold",
    bold: "MulishBold",
    extrabold: "MulishExtraBold",
  },
  haptics: true,
});
