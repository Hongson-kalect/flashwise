import { GetAPI } from "../axios";

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
