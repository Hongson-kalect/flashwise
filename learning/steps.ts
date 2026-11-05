import { normalizeAnswer } from "./checker";
import { baseLang, isHandwritable } from "./handwriting";
import { ChoiceOption, ClusterStepKind, glossOf, LearnCard, Question } from "./types";

/** Nghĩa của 1 thẻ khác dùng làm đáp án nhiễu (từ chính cụm đang học trước, rồi từ bộ). */
export interface PoolEntry {
  key: string;
  word: string;
  gloss: string;
}

export const poolFromCards = (cards: LearnCard[]): PoolEntry[] => cards.map((c) => ({ key: c.key, word: c.word, gloss: glossOf(c) }));

type Rng = () => number;

/** Thiết bị / cài đặt có cho nghe (loa, `hearable`) và nói (micro + nhận dạng, `talkable`) không; thiếu thì bước tương ứng bị bỏ. */
export interface Capabilities {
  hear: boolean;
  talk: boolean;
  /** Ngôn ngữ (mã gốc) viết tay được ngay trên máy này (module + model đã sẵn); thiếu = không có bước viết. */
  write?: string[];
}

const shuffle = <T,>(items: T[], rng: Rng) => {
  const a = [...items];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
};

const MIN_DISTRACTORS = 2;
const MAX_DISTRACTORS = 3;

const distractors = (card: LearnCard, pool: PoolEntry[], field: "word" | "gloss", rng: Rng) => {
  const own = normalizeAnswer(field === "word" ? card.word : glossOf(card), card.lang);
  const seen = new Set<string>([own]);
  const result: string[] = [];
  for (const entry of shuffle(pool, rng)) {
    if (entry.key === card.key) continue;
    const textValue = entry[field];
    const norm = normalizeAnswer(textValue, card.lang);
    if (!textValue || seen.has(norm)) continue;
    seen.add(norm);
    result.push(textValue);
    if (result.length >= MAX_DISTRACTORS) break;
  }
  return result;
};

const choose = (card: LearnCard, kind: ClusterStepKind, answer: string, wrong: string[], rng: Rng): Question => {
  const options: ChoiceOption[] = shuffle(
    [{ text: answer, correct: true }, ...wrong.map((text) => ({ text, correct: false }))],
    rng,
  ).map((o, i) => ({ id: `o${i}`, ...o }));
  return { kind, cardKey: card.key, answerType: "choose", answer, options };
};

/**
 * Registry các kiểu bước: khai báo dữ liệu cần (`needs`) và cách dựng câu hỏi. Kiểu thiếu dữ liệu thì bị bỏ khỏi thẻ.
 * Thêm kiểu mới (cloze, nghe, nói...): thêm vào StepKind, vào đây, và vẽ ở components/learning/questions.
 */
interface StepMethod {
  kind: ClusterStepKind;
  /** Bước nhớ lại (tự nhớ ra từ) quan trọng hơn bước nhận ra: bị cắt sau cùng khi phải rút ngắn. */
  recall: boolean;
  needs: (card: LearnCard, pool: PoolEntry[], rng: Rng, caps: Capabilities) => boolean;
  build: (card: LearnCard, pool: PoolEntry[], rng: Rng) => Question;
}

const METHODS: StepMethod[] = [
  {
    kind: "copy",
    recall: true,
    needs: () => true,
    build: (card) => ({ kind: "copy", cardKey: card.key, answerType: "type", answer: card.word, options: [] }),
  },
  {
    kind: "chooseMeaning",
    recall: false,
    needs: (card, pool, rng) => distractors(card, pool, "gloss", rng).length >= MIN_DISTRACTORS,
    build: (card, pool, rng) => choose(card, "chooseMeaning", glossOf(card), distractors(card, pool, "gloss", rng), rng),
  },
  {
    kind: "chooseWord",
    recall: false,
    needs: (card, pool, rng) => distractors(card, pool, "word", rng).length >= MIN_DISTRACTORS,
    build: (card, pool, rng) => choose(card, "chooseWord", card.word, distractors(card, pool, "word", rng), rng),
  },
  {
    // Nghe (không thấy chữ), chọn từ đúng
    kind: "listenChoose",
    recall: false,
    needs: (card, pool, rng, caps) => caps.hear && distractors(card, pool, "word", rng).length >= MIN_DISTRACTORS,
    build: (card, pool, rng) => choose(card, "listenChoose", card.word, distractors(card, pool, "word", rng), rng),
  },
  {
    kind: "typeWord",
    recall: true,
    needs: () => true,
    build: (card) => ({ kind: "typeWord", cardKey: card.key, answerType: "type", answer: card.word, options: [] }),
  },
  {
    // Chính tả: nghe rồi gõ lại từ
    kind: "dictation",
    recall: true,
    needs: (_card, _pool, _rng, caps) => caps.hear,
    build: (card) => ({ kind: "dictation", cardKey: card.key, answerType: "type", answer: card.word, options: [] }),
  },
  {
    // Đọc to từ, nhận dạng giọng nói trên máy
    kind: "speak",
    recall: true,
    needs: (_card, _pool, _rng, caps) => caps.talk,
    build: (card) => ({ kind: "speak", cardKey: card.key, answerType: "speak", answer: card.word, options: [] }),
  },
  {
    // Viết tay từng ký tự bằng ngón tay (zh / ja / ko, từ ngắn)
    kind: "handwrite",
    recall: true,
    needs: (card, _pool, _rng, caps) => !!caps.write?.includes(baseLang(card.lang)) && isHandwritable(card.word, card.lang),
    build: (card) => ({ kind: "handwrite", cardKey: card.key, answerType: "draw", answer: card.word, options: [] }),
  },
];

/** Số bước học cụm theo cấp thẻ: max(3, cluster_steps - cấp) (docs 5.2). */
export const stepCountFor = (level: number, clusterSteps: number) => Math.max(3, clusterSteps - level);

/** Thứ tự bước nhận ra → nhớ lại; rút ngắn thì bỏ bước nhận ra trước, giữ copy và gõ từ. */
const DROP_ORDER: ClusterStepKind[] = ["chooseWord", "listenChoose", "chooseMeaning", "copy", "dictation"];

/** `exclude`: kiểu bước bỏ hẳn (ôn lại không cần bước copy: thẻ không phải mới). */
export const buildQuestions = (
  card: LearnCard,
  pool: PoolEntry[],
  stepCount: number,
  rng: Rng = Math.random,
  exclude: ClusterStepKind[] = [],
  caps: Capabilities = { hear: false, talk: false },
): Question[] => {
  let methods = METHODS.filter((m) => !exclude.includes(m.kind) && m.needs(card, pool, rng, caps));
  for (const kind of DROP_ORDER) {
    if (methods.length <= stepCount) break;
    methods = methods.filter((m) => m.kind !== kind);
  }
  return methods.map((m) => m.build(card, pool, rng));
};

export const isRecall = (kind: ClusterStepKind) => METHODS.find((m) => m.kind === kind)?.recall ?? false;
