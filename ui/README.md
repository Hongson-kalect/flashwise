# UI kit (thư mục `ui/`)

Bộ giao diện dùng chung, **tự chứa**: không import store, DB, alias `@/` hay màn hình nào của app. Muốn dùng ở app mới thì
copy nguyên thư mục này. Kit được gom từ Flashwise và Fastfast.

## Có gì
| Nhóm | Nội dung |
|---|---|
| Theme | `UIThemeProvider`, `useUITheme()`, token màu (`tokens.ts`), biến CSS cho Tailwind (`tailwind.preset.js`) |
| Chữ | `Text` (token màu, thang cỡ, độ đậm, độ mờ), thang `TextSize` / `TextWeight` / `Opacity` |
| Khối | `Surface`, `Card`, `Divider`, `SectionTitle` |
| Điều khiển | `Button` (solid / soft / outline / ghost), `Chip` |
| Chờ tải | `Skeleton`, `SkeletonText`, `SkeletonCircle` (màu đúng ở sáng / tối) |
| Biểu đồ | `ProgressRing` (vòng tiến độ) |
| Khác | `haptic()`, hook `useDebounce`, `useSwitchFade` |

Dùng: `import { Text, Button, Skeleton } from "@/ui"` (hoặc đường dẫn tương đối tới `ui/index.ts`).

## Mang sang app mới (5 bước)
1. Copy thư mục `ui/` vào app.
2. Cài thư viện: `nativewind@4` (+ `tailwindcss@3`), `react-native-reanimated`, `react-native-svg`, `expo-linear-gradient`, `expo-haptics`.
3. `tailwind.config.js`: `presets: [require("nativewind/preset"), require("./ui/tailwind.preset")]` và thêm `"./ui/**/*.{ts,tsx}"` vào `content`.
4. Tạo bảng màu của app (đủ mọi khoá trong `TOKEN_KEYS`, bản sáng + tối) rồi bọc root:
   ```tsx
   <UIThemeProvider light={light} dark={dark} mode={mode} onModeChange={saveMode}>
     <App />
   </UIThemeProvider>
   ```
   `mode` (`"light" | "dark" | "system"`) và việc lưu nó là của app (store, DB, AsyncStorage...): kit chỉ nhận qua props.
5. Gọi `configureUI({ fonts, haptics })` một lần trước khi render để khai báo font từng độ đậm.

Ví dụ trong Flashwise: `configs/theme.ts` (bảng màu), `providers/Theme.tsx` (nối mode với store), `configs/ui.ts` (font).

## Quy ước
- Màu luôn là **token** (`theme.card`, `bg-card`, `text-title`), không viết hex / `bg-white` trong màn hình.
- Thêm token: `tokens.ts` (`TOKEN_KEYS`) + `tailwind.preset.js` + giá trị ở cả hai bảng màu của app.
- Thành phần mới cho kit chỉ được phụ thuộc vào `ui/` và thư viện bên thứ ba; việc gắn với app (API, store, router) để ở ngoài `ui/`.
- Các file `components/AppXxx.tsx` của Flashwise là lớp mỏng re-export từ kit để code cũ không phải đổi import.
