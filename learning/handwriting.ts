import { Verdict } from "./types";

/**
 * Viết tay bằng ngón tay (nhận dạng ML Kit trên máy): chỉ cho chữ không phải Latinh và từ ngắn, mỗi ký tự một ô vẽ riêng
 * (nhận dạng từng ký tự chính xác hơn nhiều so với vẽ cả từ trên một khung). Phần này thuần (không đụng native) để test.
 */

/** Ngôn ngữ có bước viết tay (mã gốc, không kèm vùng: zh-CN -> zh). */
export const HANDWRITING_LANGS = ["zh", "ja", "ko"] as const;
/** Từ dài hơn số ký tự này thì không có bước viết. */
export const MAX_WRITE_CHARS = 3;
/** Ký tự đúng nằm trong top N phương án nhận dạng thì nhận (nét ngón tay hay lệch). */
export const ACCEPT_TOP = 3;

export const baseLang = (lang: string) => lang.toLowerCase().split(/[-_]/)[0];

export const isHandwritingLang = (lang: string) => (HANDWRITING_LANGS as readonly string[]).includes(baseLang(lang));

const WRITABLE_CHAR = /^[\p{Script=Han}\p{Script=Hiragana}\p{Script=Katakana}\p{Script=Hangul}ー々]$/u;

/** Các ký tự phải viết của từ (bỏ khoảng trắng), chuẩn hoá NFKC. */
export const writeChars = (word: string): string[] => [...word.normalize("NFKC").replace(/\s+/g, "")];

/** Từ viết tay được: ngôn ngữ hỗ trợ, 1..3 ký tự, toàn chữ Hán / kana / Hangul. */
export const isHandwritable = (word: string, lang: string) => {
  if (!isHandwritingLang(lang)) return false;
  const chars = writeChars(word);
  return chars.length >= 1 && chars.length <= MAX_WRITE_CHARS && chars.every((c) => WRITABLE_CHAR.test(c));
};

const same = (a: string, b: string) => a.normalize("NFKC") === b.normalize("NFKC");

/**
 * Chấm bài viết: `cells[i]` là các phương án nhận dạng (tốt nhất trước) của ô thứ i.
 * Mọi ô đúng ở phương án đầu = exact; mọi ô đúng trong top ACCEPT_TOP nhưng có ô không đứng đầu = close (tính Khó); còn lại sai.
 */
export const checkWritten = (cells: string[][], answer: string): Verdict => {
  const expected = writeChars(answer);
  if (!expected.length || cells.length !== expected.length) return "wrong";
  let allFirst = true;
  for (let i = 0; i < expected.length; i++) {
    const rank = cells[i].slice(0, ACCEPT_TOP).findIndex((c) => same(c, expected[i]));
    if (rank < 0) return "wrong";
    if (rank > 0) allFirst = false;
  }
  return allFirst ? "exact" : "close";
};
