import { GetAPI, PostAPI, serverInstance } from "../axios";

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
  /** exists qua dạng biến cách đã biết: từ gốc sẽ mở khi chạm (bought -> buy). */
  form_of?: string;
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

export type WordFormRow = { form: string; pos: string; tag: string; irregular: boolean };

/** Từ này cũng là dạng biến cách của từ khác (own_entry: có mục riêng; candidates: mọi từ gốc có thể). */
export type FormOf = {
  form: string;
  lemma: string;
  pos: string;
  tag: string;
  own_entry: boolean;
  candidates: { lemma: string; pos: string; tag: string }[];
};

export type WordForms = { forms: WordFormRow[]; also_form_of: FormOf | null };

export type FormExampleData = { form: string; text: string; translate: string | null; created: boolean };

/**
 * Ví dụ 1 câu riêng của dạng biến cách (buying) dưới nghĩa của từ gốc (buy). Có sẵn thì trả ngay, chưa có thì server nhờ AI viết
 * (chậm vài giây, mỗi người ≤ 40 lần tạo mới / ngày). Lỗi: 422 no_example, 429 daily_limit, 403 account_required, 503 ai_unavailable.
 */
export const fetchFormExample = async (p: { senseId: string; form: string; userLang: string }) => {
  const res = await PostAPI("ai-senses/form-example/", { sense_id: p.senseId, form: p.form, user_lang: p.userLang }, { timeout: 60_000 });
  return res.data as FormExampleData;
};

/** Các dạng biến cách của 1 từ (cho phần "Biến thể") và gợi ý "cũng là dạng của …". Server dựng lười lần đầu. */
export const fetchWordForms = async (wordId: string) => {
  const res = await GetAPI("ai-words/forms/", { word_id: wordId });
  return res.data as WordForms;
};

export interface WordSuggestion {
  /** id từ (word_id) */
  id: string;
  value: string;
  language_code: string;
  sense_id: string | null;
  pos: string | null;
  /** Nghĩa ngắn theo ngôn ngữ người dùng (bản dịch, không có thì định nghĩa). */
  gloss: string;
  image_preview: string | null;
  /** Chế độ "meaning": bản dịch đã khớp với chuỗi gõ. */
  matched: string | null;
}

/** Mã lý do AI không gợi ý được cho cụm gõ (server): từ chối hoặc hạn chế tạm. */
export type AiReason = "ok" | "sentence" | "offensive" | "sensitive" | "spam" | "injection" | "not_a_word" | "quota" | "unavailable";

/** Dòng gợi ý có thêm nguồn: `ai` = do AI đề xuất, `in_db` = từ đã có nghĩa chính thức trong hệ thống (kèm `sense_id` nghĩa khớp). */
export type SuggestRow = WordSuggestion & { source?: "ai"; in_db?: boolean; offensive?: boolean };

/**
 * Gợi ý khi thêm từ vào bộ. mode "word": gõ từ của ngôn ngữ đang học (đầu từ, rồi gần giống). mode "meaning": gõ nghĩa bằng ngôn ngữ
 * của mình ("nồi cơm") để tìm từ tương ứng của ngôn ngữ đang học. `ai: true` (chỉ mode meaning): server hỏi thêm AI (đã kiểm duyệt cụm gõ,
 * có cache và hạn mức ngày); từ chối / hết hạn mức thì vẫn trả phần từ DB kèm `aiReason`.
 */
export const suggestWords = async (q: string, lang: string, userLang: string, mode: "word" | "meaning", opts: { limit?: number; ai?: boolean } = {}) => {
  const res = await serverInstance.get("ai-words/suggest/", {
    params: { q, lang, user_lang: userLang, mode, limit: opts.limit ?? 8, ai: opts.ai ? 1 : undefined },
    timeout: opts.ai ? 40_000 : 10_000, // lượt AI có thể mất vài giây
  });
  return { rows: (res.data?.results ?? []) as SuggestRow[], aiReason: (res.data?.ai_reason ?? null) as AiReason | null };
};
