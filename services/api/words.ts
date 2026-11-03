import { GetAPI, PostAPI } from "../axios";

export interface WordHit {
  id: string;
  value: string;
  language_code: string;
}

/** Gợi ý khi gõ: chỉ trả từ đã có trong hệ thống. */
export const searchWords = async (q: string, lang: string, limit = 8) => {
  const res = await GetAPI("ai-words/search/", { q, lang, limit });
  return (Array.isArray(res.data) ? res.data : res.data?.results ?? []) as WordHit[];
};

export type WordCheck = {
  /** exists: đã có | processing: đang tạo | rejected: bị từ chối | invalid: không phải mục từ | unknown: chưa có (create=false) */
  status: "exists" | "processing" | "rejected" | "invalid" | "unknown";
  /** invalid: sentence | too_long | not_a_word */
  reason?: string;
};

/** Kết quả theo từ đã chuẩn hoá (viết thường, gộp khoảng trắng). */
export type WordChecks = Record<string, WordCheck>;

/**
 * Tạo nhiều từ cùng lúc (tối đa 500): từ chưa có và hợp lệ được AI tạo dần, trả processing; câu / chuỗi quá dài vào invalid ngay.
 * Từ mới tính vào hạn mức theo ngày: lỗi 429 `bulk_quota_exceeded` = hết hạn mức hôm nay, không từ nào được tạo.
 * Hỏi tiến độ bằng `checkWords` cho tới khi hết processing.
 */
export const bulkCreateWords = async (p: { lang: string; userLang: string; words: string[] }) => {
  const res = await PostAPI(
    "ai-words/bulk-create/",
    { lang: p.lang, user_lang: p.userLang, words: p.words },
    { timeout: 30_000 },
  );
  return (res.data?.results ?? {}) as WordChecks;
};

/** Tiến độ các từ (≤ 20), chỉ đọc: không tạo từ, không tính hạn mức. */
export const checkWords = async (p: { lang: string; words: string[] }) => {
  const res = await PostAPI("ai-words/check/", { lang: p.lang, words: p.words }, { timeout: 30_000 });
  return (res.data?.results ?? {}) as WordChecks;
};
