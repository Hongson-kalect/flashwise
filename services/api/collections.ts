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
