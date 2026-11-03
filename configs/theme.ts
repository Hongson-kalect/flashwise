/**
 * Token màu của Flashwise (docs/DESIGN.md). Màu chủ đạo là xanh dương; mọi màn lấy màu từ đây
 * qua useTheme() hoặc class Tailwind (bg-card, text-title, bg-primary/10...).
 * Thêm token mới: khai báo ở cả light + dark, rồi thêm vào TOKEN_KEYS (ui/tokens.ts) và ui/tailwind.preset.js.
 */
import type { UITheme } from "@/ui";

/** Bảng màu của app = token của UI kit + vài khoá riêng (white). */
export type Theme = UITheme & { white: string };

export const lightTheme: Theme = {
  // Thương hiệu
  primary: "#2563EB", // xanh chủ đạo: nút chính, link, tab đang chọn
  secondary: "#0EA5E9", // xanh trời: nhấn phụ, gradient
  tertiary: "#DBEAFE", // xanh nhạt: nền chip / vùng nhấn nhẹ
  accent: "#F59E0B", // vàng cam: streak, XP, phần thưởng (dùng tiết kiệm)

  // Trạng thái
  success: "#16A34A",
  error: "#DC2626",
  warning: "#D97706",
  info: "#0284C7",
  disabled: "#CBD5E1",
  link: "#2563EB",

  // Chữ
  title: "#0B1B3A",
  text: "#1E293B",
  subText1: "#475569",
  subText2: "#64748B",
  subText3: "#94A3B8",

  // Nền: card trắng nổi trên nền xanh xám rất nhạt
  background: "#F5F8FD",
  background2: "#EAF0FA",
  card: "#FFFFFF",
  border: "#E2E8F0",

  // Chữ / icon đặt trên nền primary
  constract: "#FFFFFF",
  white: "#FFFFFF",
};

export const darkTheme: Theme = {
  primary: "#3B82F6",
  secondary: "#38BDF8",
  tertiary: "#1E3A8A",
  accent: "#FBBF24",

  success: "#4ADE80",
  error: "#F87171",
  warning: "#FBBF24",
  info: "#38BDF8",
  disabled: "#334155",
  link: "#60A5FA",

  title: "#F1F5F9",
  text: "#E2E8F0",
  subText1: "#CBD5E1",
  subText2: "#94A3B8",
  subText3: "#64748B",

  // Nền xanh than, card sáng hơn nền một bậc, không dùng đen/trắng tinh
  background: "#0B1220",
  background2: "#111A2E",
  card: "#151F36",
  border: "#243049",

  constract: "#FFFFFF",
  white: "#FFFFFF",
};

export const headerColor = ["blue", "orange"];
