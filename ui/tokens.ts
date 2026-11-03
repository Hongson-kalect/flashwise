/**
 * Danh sách token màu của UI kit. App khai báo giá trị cho từng token (bản sáng + tối) và truyền vào
 * <UIThemeProvider>. Thêm token mới: thêm vào TOKEN_KEYS và vào ui/tailwind.preset.js.
 */
export const TOKEN_KEYS = [
  "primary",
  "secondary",
  "tertiary",
  "accent",
  "success",
  "error",
  "warning",
  "info",
  "disabled",
  "link",
  "title",
  "text",
  "subText1",
  "subText2",
  "subText3",
  "background",
  "background2",
  "card",
  "border",
  "constract",
] as const;

export type TokenKey = (typeof TOKEN_KEYS)[number];
/** Bảng màu đầy đủ của 1 chế độ (hex "#RRGGBB"). Có thể thêm khoá riêng của app. */
export type UITheme = Record<TokenKey, string>;

/** subText1 → --c-sub-text-1 (khớp ui/tailwind.preset.js). */
export const cssVarName = (key: TokenKey) =>
  `--c-${key.replace(/[A-Z0-9]/g, (m) => "-" + m.toLowerCase())}`;

const hexToChannels = (hex: string) => {
  const h = hex.replace("#", "");
  const n = parseInt(
    h.length === 3
      ? h
          .split("")
          .map((c) => c + c)
          .join("")
      : h.slice(0, 6),
    16,
  );
  return `${(n >> 16) & 255} ${(n >> 8) & 255} ${n & 255}`;
};

/** Giá trị cho NativeWind vars(): "R G B" để Tailwind ghép độ trong suốt (bg-primary/10). */
export const themeToCssVars = (theme: UITheme) =>
  Object.fromEntries(
    TOKEN_KEYS.map((k) => [cssVarName(k), hexToChannels(theme[k])]),
  ) as Record<string, string>;
