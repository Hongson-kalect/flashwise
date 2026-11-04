/**
 * Nhãn dạng biến cách chuẩn của server (utils/morph) -> tên hiển thị tiếng Việt.
 * Nhãn dạng `loại từ.đặc điểm.đặc điểm`, vd verb.past, noun.plural, verb.past.masc.sing (tiếng Nga). Chưa biết thì hiện nguyên nhãn.
 */
const LABEL: Record<string, string> = {
  "noun.plural": "số nhiều",
  "verb.3sg": "ngôi 3 số ít",
  "verb.past": "quá khứ",
  "verb.pp": "phân từ quá khứ",
  "verb.ing": "V-ing",
  "adj.comparative": "so sánh hơn",
  "adj.superlative": "so sánh nhất",
  "adv.comparative": "so sánh hơn",
  "adv.superlative": "so sánh nhất",
  "verb.negative": "phủ định",
  "verb.polite": "lịch sự",
  "verb.polite.past": "lịch sự, quá khứ",
  "verb.te": "dạng て",
  "verb.renyou": "dạng liên dụng",
  "verb.mizen": "dạng vị nhiên",
  "verb.katei": "dạng giả định",
  "verb.imperative": "mệnh lệnh",
  "adj.past": "quá khứ",
  "verb.form": "biến cách",
  "noun.form": "biến cách",
  "adj.form": "biến cách",
  form: "biến cách",
};

const FEATURE: Record<string, string> = {
  past: "quá khứ", pres: "hiện tại", futr: "tương lai", impr: "mệnh lệnh", masc: "giống đực", femn: "giống cái", neut: "giống trung",
  sing: "số ít", plur: "số nhiều", nomn: "chủ cách", gent: "sở hữu cách", datv: "tặng cách", accs: "đối cách", ablt: "công cụ cách",
  loct: "giới cách", "1per": "ngôi 1", "2per": "ngôi 2", "3per": "ngôi 3",
};

export const formTagLabel = (tag: string): string => {
  if (LABEL[tag]) return LABEL[tag];
  const parts = tag.split(".").slice(1).map((p) => FEATURE[p] ?? p);
  return parts.length ? parts.join(", ") : tag;
};

/** pos của nghĩa (AI trả adjective / adverb...) -> pos của bảng dạng (noun | verb | adj | adv). */
export const formPos = (pos?: string | null): string => {
  const p = (pos ?? "").trim().toLowerCase();
  return p === "adjective" ? "adj" : p === "adverb" ? "adv" : p;
};
