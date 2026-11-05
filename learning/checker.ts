import { Verdict } from "./types";

/** Ngôn ngữ mà dấu là một phần của chữ (không bỏ dấu khi so). */
const KEEP_MARKS = new Set(["ja", "ko", "zh", "zh-CN", "zh-TW", "th", "hi", "ar", "he", "ru", "uk"]);

export const normalizeAnswer = (text: string, lang = "en") => {
  let s = text.normalize("NFKC").toLowerCase().trim().replace(/\s+/g, " ");
  s = s.replace(/^[^\p{L}\p{N}]+|[^\p{L}\p{N}]+$/gu, ""); // dấu câu 2 đầu
  if (!KEEP_MARKS.has(lang)) s = s.normalize("NFD").replace(/\p{M}/gu, "").normalize("NFC");
  return s;
};

const editDistance = (a: string, b: string) => {
  const dp = Array.from({ length: a.length + 1 }, (_, i) => [i, ...Array(b.length).fill(0)]);
  for (let j = 1; j <= b.length; j++) dp[0][j] = j;
  for (let i = 1; i <= a.length; i++) {
    for (let j = 1; j <= b.length; j++) {
      dp[i][j] = Math.min(dp[i - 1][j] + 1, dp[i][j - 1] + 1, dp[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
    }
  }
  return dp[a.length][b.length];
};

/**
 * Chấm câu gõ: khớp (bỏ hoa thường, dấu câu, dấu thanh với chữ Latinh), "gần đúng" khi sai đúng 1 ký tự và từ đủ dài
 * (docs 3.1: tính Hard, không bắt làm lại), còn lại sai.
 */
export const checkAnswer = (input: string, answer: string, lang = "en"): Verdict => {
  const a = normalizeAnswer(input, lang);
  const b = normalizeAnswer(answer, lang);
  if (!a) return "wrong";
  if (a === b) return "exact";
  if (b.length >= 4 && editDistance(a, b) <= 1) return "close";
  return "wrong";
};

/** Gợi ý từng nấc cho câu gõ: 1 = chữ đầu, 2 = chữ đầu + số chữ ("w _ _ _"). Nấc 3 là hiện đáp án (engine xử lý). */
export const hintText = (answer: string, level: number) => {
  const chars = Array.from(answer);
  if (level <= 0) return "";
  if (level === 1) return `${chars[0]}…`;
  return chars.map((c, i) => (i === 0 || c === " " ? c : "_")).join(" ");
};
