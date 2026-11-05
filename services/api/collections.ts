import { GetAPI, PostAPI } from "../axios";

export interface CollectionSummary {
  id: string;
  name: string;
  description: string;
  image_url: string | null;
  senses_count: number;
  is_official: boolean;
  language_code: string;
  like_count: number;
  downloaded_count: number;
  tags: { id: string; name: string }[] | string[];
  matched_tags?: string[];
}

/** Bộ gợi ý theo chủ đề quan tâm (bỏ bộ đã tải / của mình). */
export const fetchSuggested = async (
  lang: string,
  tags: string[],
  limit = 10,
) => {
  const res = await GetAPI("collections/suggested/", {
    lang,
    limit,
    tags: tags.length ? tags.join(",") : undefined,
  });
  return (res.data?.results ?? []) as CollectionSummary[];
};

/** Một dòng của GET user-collections/: bộ user đã có (chưa kèm nội dung nghĩa). */
export interface MyCollectionRow {
  id: string; // id UserCollection
  collection: {
    id: string;
    name: string;
    description: string;
    image_url: string | null;
    is_official: boolean;
    item_count: number;
    language_code: string;
    version: number;
  };
  learned_count: number;
  created_at: string;
  updated_at: string;
}

export const fetchMyCollections = async () => {
  const res = await GetAPI("user-collections/");
  return (res.data?.results ?? res.data ?? []) as MyCollectionRow[];
};

/** Thêm bộ có sẵn vào thư viện của mình. Trả id UserCollection (đã có rồi thì 200 cùng id). */
export const downloadCollection = async (collectionId: string) => {
  const res = await PostAPI(`user-collections/${collectionId}/download/`, {});
  return res.data?.id as string;
};

/** Gói học offline (core/bundle.py): các bảng đúng cột SQLite. */
export interface CollectionBundle {
  etag: string;
  unchanged: boolean;
  user_collection?: Record<string, any>;
  collection?: Record<string, any>;
  items?: Record<string, any>[];
  words?: Record<string, any>[];
  senses?: Record<string, any>[];
  sense_metadata?: Record<string, any>[];
  pending?: string[];
  banned?: string[];
}

export const fetchBundle = async (userCollectionId: string, userLang: string, etag?: string | null) => {
  const res = await GetAPI(`user-collections/${userCollectionId}/bundle/`, {
    user_lang: userLang,
    etag: etag || undefined,
  });
  return res.data as CollectionBundle;
};

/** Kết quả tạo bộ: id UserCollection + id bộ gốc + từ đang chờ AI / bị loại (chỉ có khi tạo từ danh sách từ). */
export interface CreatedCollection {
  user_collection: string;
  id: string;
  name: string;
  pending_words?: string[];
  invalid_words?: string[];
}

/** Chế độ nhanh: server tự chọn nghĩa chính thức tốt nhất của mỗi từ; từ chưa có thì AI tạo dần (pending_words). */
export const createCollectionFromWords = async (p: {
  name: string;
  description: string;
  lang: string;
  userLang: string;
  words: string[];
}) => {
  const res = await PostAPI(
    "collections/bulk-create/",
    { name: p.name, description: p.description, lang: p.lang, user_lang: p.userLang, words: p.words },
    { timeout: 60_000 },
  );
  return res.data as CreatedCollection;
};

/** Chế độ chuyên sâu: bộ từ đúng các nghĩa người dùng đã chọn. */
export const createCollectionFromSenses = async (p: {
  name: string;
  description: string;
  lang: string;
  senseIds: string[];
}) => {
  const res = await PostAPI(
    "collections/",
    { name: p.name, description: p.description, language_code: p.lang, senses: p.senseIds.map((id) => ({ id })) },
    { timeout: 60_000 },
  );
  return res.data as CreatedCollection;
};

/** Thêm từ vào bộ của mình (chỉ tác giả): từ có nghĩa vào ngay, từ chưa có thì chờ AI. */
export const addWordsToCollection = async (userCollectionId: string, words: string[], userLang: string) => {
  const res = await PostAPI(
    `user-collections/${userCollectionId}/add-words/`,
    { words, user_lang: userLang },
    { timeout: 60_000 },
  );
  /** unavailable: chỉ khi không phải tác giả (remix): từ chưa có nghĩa chính thức, không được thêm. */
  return res.data as { added: string[]; pending_words: string[]; invalid_words: string[]; unavailable: string[] };
};

/**
 * Xem bộ gốc: server gom các từ AI đã tạo xong vào bộ, từ bị từ chối chuyển sang invalid_words.
 * Gọi trước khi tải lại bundle khi bộ còn từ đang chờ.
 */
export const resolvePendingWords = async (collectionId: string) => {
  const res = await GetAPI(`collections/${collectionId}/`);
  return res.data as { pending_words?: string[]; invalid_words?: string[] };
};

export interface WordSenseOption {
  id: string;
  pos: string | null;
  level: string | null;
  like_count: number;
  definition: string;
  translations: string[];
  example: string;
  image_preview: string | null;
  best: boolean;
}

export interface WordSensesResult {
  status: "exists" | "processing" | "rejected" | "invalid" | "unknown";
  reason?: string;
  senses?: WordSenseOption[];
}

/** Các nghĩa chính thức của từ để chọn (chế độ chuyên sâu). Server nhận tối đa 20 từ mỗi lần nên tự chia lô. */
export const fetchWordSenses = async (lang: string, userLang: string, words: string[]) => {
  const results: Record<string, WordSensesResult> = {};
  for (let i = 0; i < words.length; i += 20) {
    const res = await GetAPI("ai-words/senses/", {
      lang,
      user_lang: userLang,
      words: words.slice(i, i + 20).join(","),
    });
    Object.assign(results, res.data?.results ?? {});
  }
  return results;
};

export type CreateCollectionError = "quota" | "invalid" | "forbidden" | "offline" | "unknown";

export const createCollectionErrorKind = (e: any): CreateCollectionError => {
  if (!e?.response) return "offline";
  const status = e.response.status;
  if (status === 429 && e.response.data?.errorCode === "bulk_quota_exceeded") return "quota";
  if (status === 400) return "invalid";
  if (status === 403) return "forbidden";
  return "unknown";
};

/** Đặt ảnh bìa bộ mình tạo: khoá file đã tải lên (uploadImage) hoặc URL; '' = gỡ, về ảnh tự động. Trả image_url mới. */
export const setCollectionCover = async (userCollectionId: string, image: string) => {
  const res = await PostAPI(`user-collections/${userCollectionId}/cover/`, { image });
  return (res.data?.image_url ?? null) as string | null;
};

/**
 * Phát hành bộ (công khai): các dòng nháp của tác giả thành bản phát hành mới (version + 1), tên / mô tả / ảnh gửi kèm
 * thành thông tin của bản đó. Không còn gì thật sự đổi: 400 `no_changes`. Ảnh = khoá file đã tải lên qua POST media/ (hoặc URL).
 */
export const publishCollection = async (
  userCollectionId: string,
  p: { title: string; desc: string; image?: string },
) => {
  const res = await PostAPI(
    `user-collections/${userCollectionId}/upload/`,
    {
      user_collection_id: userCollectionId,
      title: p.title,
      desc: p.desc,
      ...(p.image ? { image: p.image } : {}),
    },
    { timeout: 60_000 },
  );
  return res.data as {
    collection_id: string;
    user_collection_id: string;
    current_version: number;
    /** false: không nghĩa nào đổi nên version giữ nguyên (chỉ cập nhật tên / mô tả / ảnh hoặc công khai lại). */
    changed: boolean;
    changelog: { added: string[]; updated: string[]; deleted: string[] };
  };
};

export type PublishError = "no_changes" | "banned" | "invalid" | "offline" | "unknown";

export const publishErrorKind = (e: any): PublishError => {
  if (!e?.response) return "offline";
  const data = e.response.data;
  if (e.response.status === 400) return data?.errorCode === "no_changes" ? "no_changes" : "invalid";
  if (e.response.status === 403 && data?.errorCode === "user_banned") return "banned";
  return "unknown";
};

export interface MyUploads {
  collection_count: number;
  view_count: number;
  like_count: number;
  downloaded_count: number;
  collections: {
    id: string;
    name: string;
    image_url: string | null;
    version: number;
    is_active: boolean;
    view_count: number;
    like_count: number;
    downloaded_count: number;
    item_count: number;
    created_at: string;
  }[];
}

/** Thống kê các bộ mình đã phát hành (lượt xem, thích, tải) và từng bộ, mới nhất trước. */
export const fetchMyUploads = async () => {
  const res = await GetAPI("me/uploads/");
  return res.data as MyUploads;
};

/** Thu hồi bộ đã phát hành: không còn công khai (người đã tải học tiếp). Phát hành lại bằng publishCollection. */
export const unpublishCollection = async (userCollectionId: string) => {
  const res = await PostAPI(`user-collections/${userCollectionId}/unpublish/`, {});
  return res.data as { collection_id: string; released: false; version: number };
};

/** Xoá 1 dòng khỏi bộ của mình (dòng đã phát hành thành "bia mộ" nháp, dòng nháp xoá hẳn). */
export const deleteCollectionItem = async (userCollectionId: string, itemId: string) => {
  const res = await PostAPI(`user-collections/${userCollectionId}/delete-sense/`, {
    user_collection_id: userCollectionId,
    collection_item_id: itemId,
  });
  return res.data;
};

/** Đổi thứ tự hiển thị (tác giả đổi được cả dòng đã phát hành, thứ tự không tạo version mới). */
export const reorderCollectionItems = async (userCollectionId: string, items: { item_id: string; display_order: number }[]) => {
  const res = await PostAPI(`user-collections/${userCollectionId}/reorder/`, { items }, { timeout: 60_000 });
  return res.data as { updated: number; skipped: string[] };
};
