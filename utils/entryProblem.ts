// Khớp bộ lọc của server (utils/utils/normalize.lookup_entry_problem): chỉ từ, cụm từ, thành ngữ, tục ngữ
const MAX_TOKENS = 12;
const MAX_CJK_CHARS = 14;
export const MAX_ENTRY_CHARS = 100;

/** Lỗi nhìn thấy ngay ở máy; còn lại (từ sai chính tả, câu ngắn...) do AI quyết định ở bước tạo từ. */
export const entryProblem = (raw: string, lang: string): string | null => {
  const word = raw.trim().replace(/\s+/g, " ");
  if (!word) return "Hãy nhập một từ hoặc cụm từ.";
  if (!/[\p{L}\p{N}]/u.test(word)) return "Hãy nhập một từ hoặc cụm từ.";
  if (word.length > MAX_ENTRY_CHARS) return `Tối đa ${MAX_ENTRY_CHARS} ký tự.`;
  const cjk = ["ja", "zh"].includes(lang.split("-")[0]);
  const tooLong = cjk ? word.length > MAX_CJK_CHARS : word.split(" ").length > MAX_TOKENS;
  const body = word.replace(/[.!?。！？ ]+$/u, "");
  if (tooLong || /[.!?。！？]\s*\S/u.test(body)) {
    return "Đây giống một câu hơn là một mục từ. Chỉ thêm từ, cụm từ, thành ngữ hoặc tục ngữ.";
  }
  return null;
};

/** Tách danh sách từ người dùng nhập (mỗi dòng 1 từ, hoặc ngăn cách bằng dấu phẩy / chấm phẩy), bỏ trùng, bỏ mục không phải từ. */
export const parseWords = (text: string, lang: string) => {
  const seen = new Set<string>();
  const words: string[] = [];
  const skipped: { word: string; reason: string }[] = [];
  for (const raw of text.split(/[\n,;]+/)) {
    const word = raw.trim().replace(/\s+/g, " ");
    if (!word) continue;
    const key = word.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    const problem = entryProblem(word, lang);
    if (problem) skipped.push({ word, reason: problem });
    else words.push(word);
  }
  return { words, skipped };
};
