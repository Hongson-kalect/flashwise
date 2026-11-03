import { GetAPI, PostAPI, PutAPI } from "../axios";

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

export type EditErrorKind = "offline" | "invalid" | "not_found" | "unknown";

export const editErrorKind = (e: any): EditErrorKind => {
  const status = e?.response?.status;
  if (!e?.response) return "offline";
  if (status === 400) return "invalid";
  if (status === 404) return "not_found";
  return "unknown";
};
