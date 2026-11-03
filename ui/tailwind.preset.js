/**
 * Preset Tailwind của UI kit: ánh xạ token màu sang biến CSS (--c-*) do <UIThemeProvider> đặt.
 * Dùng trong tailwind.config.js của app:
 *   presets: [require("nativewind/preset"), require("./ui/tailwind.preset")]
 * và thêm "./ui/**\/*.{ts,tsx}" vào `content`.
 * Tên class: bg-primary, text-title, text-body (= token text), text-sub-1/2/3, bg-background, bg-background-2,
 * bg-card, border-border, text-on-primary (= constract). Hậu tố /10 cho độ trong suốt: bg-primary/10.
 */
const c = (name) => `rgb(var(--c-${name}) / <alpha-value>)`;

module.exports = {
  theme: {
    extend: {
      colors: {
        primary: c("primary"),
        secondary: c("secondary"),
        tertiary: c("tertiary"),
        accent: c("accent"),
        success: c("success"),
        error: c("error"),
        warning: c("warning"),
        info: c("info"),
        disabled: c("disabled"),
        link: c("link"),
        title: c("title"),
        body: c("text"),
        "sub-1": c("sub-text-1"),
        "sub-2": c("sub-text-2"),
        "sub-3": c("sub-text-3"),
        background: c("background"),
        "background-2": c("background-2"),
        card: c("card"),
        border: c("border"),
        "on-primary": c("constract"),
      },
      borderRadius: {
        card: "20px",
        sheet: "28px",
      },
    },
  },
};
