import { GetAPI } from "../axios";

export interface Tag {
  id: string;
  name: string;
  language_code: string;
  is_topic: boolean;
  collection_count: number;
}

/** Chủ đề cho màn khởi động; tên theo ngôn ngữ người học. */
export const fetchTopics = async (lang: string, userLang: string) => {
  const res = await GetAPI("tags/", { lang, topics: true, user_lang: userLang });
  return (Array.isArray(res.data) ? res.data : res.data?.results ?? []) as Tag[];
};
