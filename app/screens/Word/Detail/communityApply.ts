import { CommunitySense } from "@/services/api/senses";
import { SenseExample, SenseType } from "./components/createSenseSheet";

export type ApplyResult = {
  next: SenseType;
  /** Nhãn các trường vừa được điền (đang trống). */
  filled: string[];
  /** Nhãn các trường bỏ qua vì đã có dữ liệu. */
  skipped: string[];
};

const csv = (v?: string[]) => (v?.length ? v.join(", ") : "");

/**
 * Áp 1 nghĩa cộng đồng vào form: trường đang TRỐNG thì điền, trường đã có dữ liệu thì BỎ QUA
 * (không ghi đè, không trộn). Nguồn không có dữ liệu cho trường đó thì không tính là điền hay bỏ qua.
 */
export const applyCommunitySense = (
  current: SenseType,
  src: CommunitySense,
  wordLang: string,
  userLang: string,
): ApplyResult => {
  const next: SenseType = { ...current };
  const filled: string[] = [];
  const skipped: string[] = [];

  const put = <K extends keyof SenseType>(
    label: string,
    key: K,
    value: SenseType[K] | undefined,
    isEmpty: boolean,
  ) => {
    const hasSource = Array.isArray(value) ? value.length > 0 : !!value;
    if (!hasSource) return;
    if (isEmpty) {
      next[key] = value as SenseType[K];
      filled.push(label);
    } else {
      skipped.push(label);
    }
  };

  const c = src.contents ?? {};
  const adv = src.metadata?.advanced ?? {};
  const blank = (s?: string) => !s || !s.trim();

  put("Định nghĩa", "definition", c.definition?.[wordLang]?.value, blank(current.definition));
  put(
    "Định nghĩa dịch",
    "traslatedDefinition",
    userLang !== wordLang ? c.definition?.[userLang]?.value : undefined,
    blank(current.traslatedDefinition),
  );
  put(
    "Bản dịch ngắn",
    "translations",
    userLang !== wordLang ? c.translations?.[userLang] : undefined,
    current.translations.length === 0,
  );

  const examples: SenseExample[] = (c.examples ?? [])
    .map((ex, i) => ({
      id: `${src.id}-${i}`,
      value: ex[wordLang]?.value ?? "",
      translate: userLang !== wordLang ? ex[userLang]?.value : undefined,
    }))
    .filter((ex) => ex.value);
  put("Ví dụ", "examples", examples, current.examples.length === 0);

  put("Cách dùng", "usage", c.usage?.[wordLang]?.value, blank(current.usage));
  put("Từ đồng nghĩa", "synonyms", csv(adv.synonyms), blank(current.synonyms));
  put("Từ trái nghĩa", "antonyms", csv(adv.antonyms), blank(current.antonyms));
  put("Từ liên quan", "relateds", csv(adv.relateds), blank(current.relateds));

  return { next, filled, skipped };
};

/** Câu thông báo ngắn sau khi áp. */
export const applySummary = ({ filled, skipped }: Pick<ApplyResult, "filled" | "skipped">) => {
  if (!filled.length && !skipped.length) return "Nghĩa này không có dữ liệu để điền.";
  if (!filled.length) return "Các trường đã có dữ liệu nên giữ nguyên.";
  const done = `Đã điền: ${filled.join(", ")}.`;
  return skipped.length ? `${done} Giữ nguyên: ${skipped.join(", ")}.` : done;
};
