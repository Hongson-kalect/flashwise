/**
 * Chuỗi phiên âm để hiện cho người học, từ trường `ipas` của server ([{label, value, roman}]).
 * Tiếng Nhật / Trung / Hàn: server sinh `roman` bằng thuật toán (Hepburn / pinyin có dấu thanh / Revised Romanization),
 * nên hiện roman thay vì IPA; tiếng Nhật kèm kana (ねこ · neko). Ngôn ngữ khác: IPA (`value`).
 */
const ROMAN_LANGS = new Set(["ja", "zh", "ko"]);
const KANA = /[぀-ヿ]/;

export const hasRoman = (lang?: string | null) => ROMAN_LANGS.has((lang ?? "").split("-")[0].toLowerCase());

export const pronunciationOf = (ipas: unknown, lang?: string | null): string => {
  const list = Array.isArray(ipas) ? ipas : [];
  const first = list.find((i) => i && (i.value || i.roman));
  if (!first) return "";
  const value = String(first.value ?? "").trim();
  const roman = String(first.roman ?? "").trim();
  // Không biết ngôn ngữ thì tin trường roman: chỉ ja / zh / ko mới có
  if ((!lang || hasRoman(lang)) && roman) {
    const base = (lang ?? "").split("-")[0].toLowerCase();
    return base === "ja" && value && value !== roman && KANA.test(value) ? `${value} · ${roman}` : roman;
  }
  return value;
};
