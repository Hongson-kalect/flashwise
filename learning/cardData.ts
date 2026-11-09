import { pronunciationOf } from "@/utils/pronunciation";
import { LearnCard } from "./types";

/** Dòng SQL của 1 nghĩa trong bộ (xem database/queries/learning.ts). */
export interface CardRow {
  item_id: string | null;
  sense_id: string;
  original_id: string | null;
  word_id: string;
  word_value: string;
  language_code: string;
  pos: string | null;
  level?: string | null;
  ipas: string | null;
  word_ipas: string | null;
  audio: string | null;
  word_audio: string | null;
  image_preview: string | null;
  image_link: string | null;
  image_keywords: string | null;
  contents: string | null;
  delta: string | null;
  global_difficulty: number | null;
  learner_count: number | null;
}

const parse = <T,>(text: string | null | undefined, fallback: T): T => {
  if (!text) return fallback;
  try {
    return JSON.parse(text) as T;
  } catch {
    return fallback;
  }
};

const isObject = (v: unknown): v is Record<string, any> => !!v && typeof v === "object" && !Array.isArray(v);

/**
 * Áp delta (phần user sửa) lên contents của nghĩa gốc, đúng luật server (ai/queries.py): definition / usage user sửa
 * thay hẳn bản gốc (chỉ giữ ngôn ngữ có trong delta), các phần khác gộp theo ngôn ngữ, danh sách (examples) thay hẳn.
 */
export const mergeDelta = (contents: Record<string, any>, delta: Record<string, any>) => {
  const result: Record<string, any> = { ...contents };
  for (const [key, value] of Object.entries(delta ?? {})) {
    if (key === "definition" || key === "usage") result[key] = value;
    else if (isObject(value) && isObject(result[key])) result[key] = { ...result[key], ...value };
    else result[key] = value;
  }
  return result;
};

const text = (node: any): string => (isObject(node) && typeof node.value === "string" ? node.value.trim() : "");
/** Phiên âm Latin của đoạn (ja / zh / ko), do server sinh. */
const roman = (node: any): string => (isObject(node) && typeof node.roman === "string" ? node.roman.trim() : "");

/** Dòng SQL → thẻ học: nội dung theo ngôn ngữ của từ (`lang`) và tiếng mẹ đẻ (`userLang`). */
export const toCard = (r: CardRow, userLang: string): LearnCard => {
  const lang = r.language_code || "en";
  const contents = mergeDelta(parse(r.contents, {}), parse(r.delta, {}));
  const translations: string[] = (contents.translations?.[userLang] ?? []).filter((t: unknown) => typeof t === "string" && t.trim());

  const examples: any[] = Array.isArray(contents.examples) ? contents.examples : [];
  const found = examples.find((e) => text(e?.[lang]));
  const rawIpa: string = pronunciationOf(parse<any[]>(r.ipas, []), lang) || pronunciationOf(parse<any[]>(r.word_ipas, []), lang);
  const ipa = /\p{L}/u.test(rawIpa) ? rawIpa : ""; // phiên âm không có chữ nào (vd chỉ "/") thì bỏ

  return {
    key: String(r.original_id || r.sense_id),
    itemId: r.item_id,
    senseId: r.sense_id,
    wordId: r.word_id,
    word: r.word_value,
    lang,
    pos: r.pos ? String(r.pos).toLowerCase() : null,
    level: r.level ?? null,
    ipa,
    audio: r.audio || r.word_audio || null,
    imageUri: r.image_preview || r.image_link || null,
    keywords: parse<string[]>(r.image_keywords, []),
    definition: text(contents.definition?.[lang]),
    definitionNative: userLang === lang ? "" : text(contents.definition?.[userLang]),
    translations: userLang === lang ? [] : translations,
    example: found
      ? { text: text(found[lang]), native: userLang === lang ? "" : text(found[userLang]), roman: roman(found[lang]) }
      : null,
    globalDifficulty: r.global_difficulty ?? 0,
    learnerCount: r.learner_count ?? 0,
  };
};

/** Thẻ đủ dữ liệu để học: có định nghĩa, và có nghĩa tiếng mẹ đẻ (bản dịch hoặc định nghĩa dịch) khi khác ngôn ngữ của từ. */
export const isReady = (card: LearnCard, userLang: string) =>
  !!card.definition && (userLang === card.lang || card.translations.length > 0 || !!card.definitionNative);
