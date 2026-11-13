import { useAppStore } from "@/stores/appStore";
import { createContext, useContext } from "react";

/**
 * Ngôn ngữ của từ đang xem và ngôn ngữ dịch hiện bên cạnh. Mặc định lấy từ cài đặt (từ tiếng học + tiếng mẹ đẻ), nhưng bấm 1 bản dịch
 * (vd "cái bàn" của table) mở từ đó theo chiều ngược lại: từ tiếng mẹ đẻ, dịch ra tiếng đang học. Trang từ đặt context này theo tham số route
 * `lang` / `userLang`; component bên trong dùng `useWordLangs` thay vì đọc thẳng cài đặt.
 */
export type WordLangs = { lang?: string; userLang?: string };

export const WordLangContext = createContext<WordLangs>({});

export const useWordLangs = (): { lang: string; userLang: string } => {
  const ctx = useContext(WordLangContext);
  const learning = useAppStore((s) => s.settings?.learning_language) ?? "en";
  const native = useAppStore((s) => s.settings?.translate_language) ?? "vi";
  return { lang: ctx.lang ?? learning, userLang: ctx.userLang ?? native };
};

/** Khoá màn hình từ: cùng chữ nhưng khác ngôn ngữ là hai từ khác nhau (table en / table vi). */
export const wordScreenId = (params?: { value?: string; lang?: string }) => `${params?.value ?? ""}|${params?.lang ?? ""}`;

/** Tham số route để giữ chiều ngôn ngữ khi đi tiếp từ 1 từ đã mở theo chiều ngược (rỗng nếu đang theo cài đặt). */
export const useWordRouteParams = (): { lang?: string; userLang?: string } => {
  const ctx = useContext(WordLangContext);
  return ctx.lang ? { lang: ctx.lang, userLang: ctx.userLang } : {};
};
