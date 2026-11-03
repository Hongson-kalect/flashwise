# Flashwise: hệ thống thiết kế UI

Màu chủ đạo là **xanh dương**; giao diện sáng / tối tự theo hệ thống (setting `theme`: `system` | `light` | `dark`).

## Màu: một nguồn, hai cách dùng
- Token ở `configs/theme.ts` (`lightTheme`, `darkTheme`, cùng bộ khoá). Thêm token: khai báo ở cả hai bản,
  thêm vào `CSS_VAR_KEYS` và `tailwind.config.js`.
- `providers/Theme.tsx` chọn bản theo setting + hệ điều hành, đổ vào biến CSS `--c-*` (NativeWind `vars()`),
  nên hai cách này luôn khớp:
  - Code: `const { theme } = useTheme()` → `theme.primary`, `theme.card`...
  - Class: `bg-card`, `text-title`, `border-border`, `bg-primary/10`, `text-sub-2` (Tailwind map ở `tailwind.config.js`).
- Cơ chế giống Fastfast (`VariableContextProvider` + `@theme` ở NativeWind 5), làm theo NativeWind 4 (`vars()` + `rgb(var(--c-x) / <alpha-value>)`).
- Đổi chế độ: `useTheme().setMode("dark")` (lưu `user_settings.theme`).
- Code cũ còn đọc `useAppStore().themeObj.color_palette`: được ThemeProvider giữ đồng bộ, nên tự theo theme. Dần chuyển sang `useTheme()`.

## Token
| Nhóm | Token |
|---|---|
| Thương hiệu | `primary` xanh chính · `secondary` xanh trời · `tertiary` xanh nhạt (nền chip) · `accent` vàng cam (streak / XP, dùng tiết kiệm) |
| Trạng thái | `success` `error` `warning` `info` `disabled` `link` |
| Chữ | `title` · `text` · `subText1..3` |
| Nền | `background` (nền màn) · `background2` (ô phụ, track) · `card` (nổi trên nền) · `border` |
| Trên nền primary | `constract` (chữ / icon trắng) |

Quy tắc: card = `card` + viền `border` (không bóng); nền nhấn nhẹ = `primary + "14"`; không dùng đen / trắng tinh cứng
(`#fff`, `bg-white`, `bg-gray-*`): dùng token để chế độ tối đúng. Ngoại lệ: thẻ gradient xanh cố định (Home) vì nằm trên nền màu.

## Hình khối
Bo góc: nút 14 · card 20 · sheet 28 · chip pill. Lề màn 16–20. Khoảng cách bội số 4. Chữ Mulish (`AppText`), line-height 1.4.

## Component nền
`AppText` · `AppButton` (`variant` solid / soft / outline / ghost) · `AppCard` · `AppChip` · `AppInput` · `AppReturnHeader`
· `AppImage` (expo-image) · `AppIcon` (Feather là chính) · skeleton `components/skeleton` · modal `components/modals`
· bottom sheet `providers/BottomSheet.tsx`. Thanh tab dưới: `app/tabs.tsx`.
