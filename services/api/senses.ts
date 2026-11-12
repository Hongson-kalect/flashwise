import { DeleteAPI, GetAPI, PostAPI, PutAPI } from "../axios";

export interface CommunitySense {
  id: string;
  word_id: string;
  word_value: string;
  pos: string | null;
  level: string | null;
  ipas: { label?: string; value: string }[];
  image_preview: string | null;
  /** Đã gộp delta lên nghĩa gốc, chỉ ngôn ngữ của từ + user_lang. */
  contents: {
    definition?: Record<string, { value: string }>;
    usage?: Record<string, { value: string }>;
    examples?: Record<string, { value: string }>[];
    translations?: Record<string, string[]>;
  };
  metadata: { advanced?: Record<string, string[]>; tags?: string[] } | null;
  like_count: number;
  adopted_count: number;
  quality_status: "draft" | "refined" | "verified" | "flagged";
  liked: boolean;
  author: { id: string; name: string | null; reputation: number } | null;
  rank: number;
  created_at: string;
}

/** Gợi ý nghĩa của cộng đồng cho 1 từ, đã xếp hạng (like, số bản tách, uy tín tác giả). */
export const fetchCommunitySenses = async (
  wordId: string,
  userLang: string,
  ordering: "popular" | "newest" = "popular",
  limit = 10,
) => {
  const res = await GetAPI("ai-senses/community/", {
    word_id: wordId,
    user_lang: userLang,
    ordering,
    limit,
  });
  return (res.data?.senses ?? []) as CommunitySense[];
};

export type ProposeResult =
  | { result: "official"; sense: any }
  | { result: "pending"; sense: any; reasons?: string[] }
  | { result: "duplicate"; reason: string; sense: any | null }
  | { result: "rejected"; reason: string; abuse: boolean };

/**
 * Đề xuất nghĩa mới (chỉ cần định nghĩa). Server chạy cổng AI đồng bộ ~3-6s nên nới timeout.
 * Kết quả: official (chính thức ngay) | pending (chờ admin, chỉ mình thấy) | duplicate | rejected.
 */
export const proposeSense = async (p: {
  wordId: string;
  userLang: string;
  definition: string;
  pos?: string;
}) => {
  const res = await PostAPI(
    "ai-senses/propose/",
    { word_id: p.wordId, user_lang: p.userLang, definition: p.definition, pos: p.pos ?? "" },
    { timeout: 60_000 },
  );
  return res.data as ProposeResult;
};

export type ProposeErrorKind =
  | "offline"
  | "throttled"
  | "account_required"
  | "banned"
  | "unsupported"
  | "unavailable"
  | "invalid"
  | "unknown";

/** Phân loại lỗi của propose theo status / errorCode (không dựa vào câu chữ). */
export const proposeErrorKind = (e: any): ProposeErrorKind => {
  const status = e?.response?.status;
  const code = e?.response?.data?.errorCode;
  if (!e?.response) return "offline";
  if (status === 429) return "throttled";
  if (code === "account_required") return "account_required";
  if (code === "user_banned") return "banned";
  if (code === "language_not_supported") return "unsupported";
  if (status === 503 || code === "ai_unavailable") return "unavailable";
  if (status === 400 || status === 404) return "invalid";
  return "unknown";
};

/** Phần thay đổi của 1 nghĩa, cùng dạng với `contents` (chỉ gửi các mục đã sửa; `examples` thay cả danh sách). */
export type SenseDelta = {
  definition?: Record<string, { value: string }>;
  usage?: Record<string, { value: string }>;
  examples?: Record<string, { value: string }>[];
  translations?: Record<string, string[]>;
};

/**
 * Sửa nghĩa bằng delta. Nghĩa chính thức / của người khác không bị sửa tại chỗ: server tách thành bản riêng của
 * người dùng (trả về nghĩa mới, id khác); nghĩa riêng của mình thì sửa tại chỗ.
 */
export const updateSense = async (p: {
  senseId: string;
  userLang: string;
  delta: SenseDelta;
  /** Metadata thay thế nguyên khối: `advanced` / `tags` gửi phải là danh sách đầy đủ (đã gồm phần cũ). */
  metadata?: { advanced?: Record<string, string[]>; tags?: string[] };
}) => {
  const res = await PutAPI("ai-senses/update-sense/", {
    sense_id: p.senseId,
    user_lang: p.userLang,
    delta: p.delta,
    ...(p.metadata ? { metadata: p.metadata } : {}),
  });
  return res.data as { id: string; [k: string]: any };
};

export type VerifiedItemKind = "synonyms" | "antonyms" | "relateds";

export type AddItemsResult = {
  added: string[];
  /** reason: mã (sentence | too_long | not_a_word) hoặc câu ngắn tiếng Anh của AI. */
  rejected: { word: string; reason: string }[];
  /** Đã có sẵn trong danh sách. */
  existing: string[];
};

/**
 * Thêm từ vào danh sách đồng nghĩa / trái nghĩa / liên quan của 1 nghĩa. Claude + Gemini cùng kiểm tra (~3s),
 * chỉ từ cả hai chấp nhận mới được ghi thẳng vào nghĩa (chỉ thêm, không xoá). Lỗi dùng proposeErrorKind.
 */
export const addSenseItems = async (p: { senseId: string; kind: VerifiedItemKind; words: string[] }) => {
  const res = await PostAPI(
    "ai-senses/add-items/",
    { sense_id: p.senseId, kind: p.kind, words: p.words },
    { timeout: 60_000 },
  );
  return res.data as AddItemsResult;
};

export type EditErrorKind = "offline" | "invalid" | "not_found" | "unknown";

export const editErrorKind = (e: any): EditErrorKind => {
  const status = e?.response?.status;
  if (!e?.response) return "offline";
  if (status === 400) return "invalid";
  if (status === 404) return "not_found";
  return "unknown";
};

/**
 * Đặt (want = true) hoặc bỏ nghĩa chính của từ cho riêng mình: nghĩa chính đứng đầu trang từ của mình, mỗi từ một nghĩa
 * (đặt nghĩa khác thì nghĩa cũ bị thu hồi). Tài khoản thật còn cộng vào điểm chung của nghĩa; khách chỉ có tác dụng riêng.
 */
export const setMainSense = async (senseId: string, want: boolean) => {
  const url = `ai-senses/${senseId}/main/`;
  const res = want ? await PostAPI(url, {}) : await DeleteAPI(url);
  return res.data as { main: boolean; sense_id: string; word_id: string; main_count: number };
};

/** Nghĩa tuỳ chỉnh của mình (lọc theo từ), id các nghĩa đang bị mình ẩn và đang thích. */
export const fetchMySenses = async (wordId: string) => {
  const res = await GetAPI("ai-senses/mine/", { word_id: wordId });
  return res.data as { senses: { id: string; is_frozen?: boolean }[]; hidden: string[]; liked: string[] };
};

/** Bỏ ẩn một nghĩa. */
export const unhideSense = async (senseId: string) => {
  await DeleteAPI(`ai-senses/${senseId}/hide/`);
};

/** Ẩn nghĩa khỏi trang từ của riêng mình (không ảnh hưởng người khác). Dùng cho nghĩa chính thức, nghĩa của người khác và nghĩa của mình đã phát hành. */
export const hideSense = async (senseId: string) => {
  const res = await PostAPI(`ai-senses/${senseId}/hide/`, {});
  return res.data as { hidden: boolean; sense_id: string };
};

/** Xoá nghĩa tuỳ chỉnh do mình tạo. Lỗi 403: không phải nghĩa của mình / là nghĩa chính thức; 409 `sense_frozen`: đã phát hành trong bộ từ. */
export const deleteSense = async (senseId: string) => {
  await DeleteAPI(`ai-senses/${senseId}/`);
};

/**
 * Dịch trước cho cụm nghĩa sắp học (5-8 nghĩa): nghĩa thiếu bản dịch sang `userLang` được đẩy vào hàng đợi dịch.
 * Trả id nghĩa đã đủ (ready) và còn chờ (pending); hỏi lại sau vài giây hoặc tải lại bundle.
 */
export const prefetchTranslation = async (senseIds: string[], userLang: string) => {
  const res = await PostAPI("ai-senses/translate/", { sense_ids: senseIds.slice(0, 30), user_lang: userLang });
  return res.data as { ready: string[]; pending: string[] };
};

