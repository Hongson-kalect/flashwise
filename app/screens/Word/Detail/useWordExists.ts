import { checkWords, WordChecks } from "@/services/api/words";
import { useQuery } from "@tanstack/react-query";

const CHUNK = 20; // giới hạn mỗi lần của ai-words/check

/**
 * Trong số `words`, từ nào đã có ở server (mở được ngay) và từ nào chưa (chạm vào mới được tạo). Gom mọi từ của trang vào MỘT
 * lần hỏi (chia nhóm 20 nếu nhiều hơn), chỉ đọc, không tạo từ, không tính hạn mức. Chưa tải xong hoặc lỗi thì trả rỗng:
 * giao diện coi như "đã có", không nhấp nháy và không chặn gì.
 */
export const useWordExists = (words: string[], lang?: string): WordChecks => {
  const keys = [...new Set(words.map((w) => w.trim().toLowerCase()).filter(Boolean))].sort();
  const { data } = useQuery({
    queryKey: ["word-exists", lang, keys],
    enabled: !!lang && keys.length > 0,
    staleTime: 5 * 60_000,
    queryFn: async () => {
      const out: WordChecks = {};
      for (let i = 0; i < keys.length; i += CHUNK) {
        Object.assign(out, await checkWords({ lang: lang as string, words: keys.slice(i, i + CHUNK) }));
      }
      return out;
    },
  });
  return data ?? {};
};
