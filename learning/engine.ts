import { checkAnswer, checkSpoken } from "./checker";
import { checkWritten } from "./handwriting";
import { autoGrade, autoGradeReview, clampGrade, DEFAULT_MEDIAN_MS } from "./grade";
import { buildQuestions, Capabilities, PoolEntry, poolFromCards, stepCountFor } from "./steps";
import { AGAIN, ClusterStepKind, GOOD, Grade, HARD, LearnCard, Question, StepLog, Verdict } from "./types";

/**
 * Máy trạng thái của 1 phiên học cụm: thuần (không đụng React / SQLite), chạy bằng reducer.
 * Mỗi thẻ có chuỗi bước (copy → chọn nghĩa → chọn từ → gõ từ); hàng đợi xếp xen kẽ, bước kế của 1 thẻ được chèn lại
 * sau 1, 3, 5... thẻ khác (giãn cách tăng dần), không bao giờ 2 bước liền của cùng 1 thẻ. Sai 2 lần thì hiện đáp án và
 * làm lại đúng bước đó 1 lần nữa sau vài thẻ.
 */

export const MAX_HINTS = 2; // lần xin gợi ý thứ MAX_HINTS + 1 là hiện đáp án
const GAPS = [1, 3, 5, 5];
const RETRY_GAP = 3;
const MAX_TRIES = 2;

export interface Item {
  cardKey: string;
  stepIdx: number;
  /** 1 = lần đầu, 2 = làm lại sau khi bị hiện đáp án (không làm lại nữa dù sai tiếp). */
  pass: 1 | 2;
}

export interface CardRun {
  card: LearnCard;
  questions: Question[];
  logs: StepLog[];
  known: boolean;
}

export interface Attempt {
  tries: number;
  hints: number;
  wrongOptionIds: string[];
  startedAt: number;
  /** Lần gõ sai gần nhất (để UI rung / báo), reset khi gõ lại. */
  lastVerdict: Verdict | null;
}

export interface Feedback {
  correct: boolean;
  revealed: boolean;
  verdict: Verdict | null;
  answer: string;
}

export type Phase = "question" | "feedback" | "summary";

export type RunMode = "learn" | "review";

export interface RunState {
  mode: RunMode;
  phase: Phase;
  cards: Record<string, CardRun>;
  order: string[];
  queue: Item[];
  current: Item | null;
  attempt: Attempt;
  feedback: Feedback | null;
  lastCardKey: string | null;
  totalSteps: number;
  doneSteps: number;
  /** Kiểu bước đã bỏ hẳn trong phiên (vd không nói được). */
  skipped: ClusterStepKind[];
  autoGrades: Record<string, Grade>;
  grades: Record<string, Grade>;
  medianMs: number;
  startedAt: number;
}

export type Action =
  | { type: "answer"; value: string; at: number }
  | { type: "hint"; at: number }
  /** Kết quả nhận dạng giọng nói (các phương án, tốt nhất trước) cho bước nói. */
  | { type: "speech"; transcripts: string[]; at: number }
  /** Bài viết tay: các phương án nhận dạng (tốt nhất trước) của từng ô ký tự. */
  | { type: "written"; cells: string[][]; at: number }
  /** Bỏ các bước thuộc kiểu này còn lại trong phiên (vd không nói được lúc này): không chấm, không tính điểm. */
  | { type: "skipKind"; kind: ClusterStepKind; at: number }
  | { type: "known"; at: number }
  | { type: "next"; at: number }
  | { type: "setGrade"; key: string; grade: Grade };

export interface StartInput {
  cards: LearnCard[];
  /** learn = học mới (bước đầu là copy, có "Đã biết"); review = ôn thẻ đã học theo cụm (bỏ copy, điểm theo bước đầu). */
  mode?: RunMode;
  /** Cấp hiện tại của từng thẻ (review): quyết định số bước, thẻ cấp cao ít bước hơn. */
  levels?: Record<string, number>;
  /** Thẻ khác trong bộ làm đáp án nhiễu (ngoài chính cụm). */
  extraPool?: PoolEntry[];
  clusterSteps: number;
  now: number;
  medianMs?: number;
  rng?: () => number;
  /** Cho nghe / nói được không (mặc định không): quyết định có bước nghe / nói. */
  caps?: Capabilities;
}

const freshAttempt = (at: number): Attempt => ({ tries: 0, hints: 0, wrongOptionIds: [], startedAt: at, lastVerdict: null });

export const startRun = ({ cards, mode = "learn", levels = {}, extraPool = [], clusterSteps, now, medianMs = DEFAULT_MEDIAN_MS, rng = Math.random, caps }: StartInput): RunState => {
  const pool = [...poolFromCards(cards), ...extraPool];
  const runs: Record<string, CardRun> = {};
  for (const card of cards) {
    const exclude = mode === "review" ? (["copy"] as const) : [];
    runs[card.key] = { card, questions: buildQuestions(card, pool, stepCountFor(levels[card.key] ?? 0, clusterSteps), rng, [...exclude], caps), logs: [], known: false };
  }
  const order = cards.map((c) => c.key);
  const queue: Item[] = order.map((cardKey) => ({ cardKey, stepIdx: 0, pass: 1 }));
  const totalSteps = order.reduce((n, key) => n + runs[key].questions.length, 0);
  const state: RunState = {
    mode,
    phase: "question", cards: runs, order, queue, current: null, attempt: freshAttempt(now), feedback: null,
    lastCardKey: null, totalSteps, doneSteps: 0, skipped: [], autoGrades: {}, grades: {}, medianMs, startedAt: now,
  };
  return advance(state, now);
};

/** Câu hỏi đang hiện (undefined khi hết). */
export const currentQuestion = (state: RunState): Question | undefined =>
  state.current ? state.cards[state.current.cardKey].questions[state.current.stepIdx] : undefined;

/** Bước kế (sau `from`) của thẻ không thuộc kiểu đã bỏ; null nếu hết. */
const nextStepIdx = (state: RunState, key: string, from: number): number | null => {
  const questions = state.cards[key].questions;
  for (let i = from + 1; i < questions.length; i++) if (!state.skipped.includes(questions[i].kind)) return i;
  return null;
};

/** Tổng bước = đã làm + còn lại (mỗi thẻ có 1 mục đang chờ, cộng các bước sau nó chưa bị bỏ), tính lại sau mỗi thay đổi số bước. */
const recount = (state: RunState, includeCurrent = true): RunState => {
  let remaining = 0;
  for (const key of state.order) {
    const pending = includeCurrent && state.current?.cardKey === key ? state.current : state.queue.find((i) => i.cardKey === key);
    if (!pending) continue;
    const questions = state.cards[key].questions;
    remaining += 1 + questions.slice(pending.stepIdx + 1).filter((q) => !state.skipped.includes(q.kind)).length;
  }
  return { ...state, totalSteps: state.doneSteps + remaining };
};

const insertAt = (queue: Item[], item: Item, gap: number) => {
  const q = [...queue];
  q.splice(Math.min(gap, q.length), 0, item);
  return q;
};

/** Lấy bước kế từ hàng đợi (tránh cùng thẻ vừa hỏi nếu còn thẻ khác); hết thì sang tổng kết. */
const advance = (state: RunState, at: number): RunState => {
  if (!state.queue.length) {
    const autoGrades: Record<string, Grade> = {};
    for (const key of state.order) {
      const run = state.cards[key];
      autoGrades[key] = run.known ? 4 : (state.mode === "review" ? autoGradeReview : autoGrade)(run.logs, state.medianMs);
    }
    return { ...state, phase: "summary", current: null, feedback: null, autoGrades, grades: { ...autoGrades } };
  }
  let idx = state.queue.findIndex((item) => item.cardKey !== state.lastCardKey);
  if (idx < 0) idx = 0;
  const queue = [...state.queue];
  const [current] = queue.splice(idx, 1);
  return { ...state, phase: "question", queue, current, feedback: null, attempt: freshAttempt(at) };
};

const ratingFor = (attempt: Attempt, revealed: boolean, verdict: Verdict | null): Grade => {
  if (revealed) return AGAIN;
  return attempt.hints > 0 || attempt.tries > 1 || verdict === "close" ? HARD : GOOD;
};

/** Chốt 1 bước (đúng hoặc phải hiện đáp án): ghi log, chèn bước kế / bước làm lại, sang phase feedback. */
const finalize = (state: RunState, opts: { correct: boolean; revealed: boolean; verdict: Verdict | null }, at: number): RunState => {
  const item = state.current!;
  const run = state.cards[item.cardKey];
  const question = run.questions[item.stepIdx];
  const rating = ratingFor(state.attempt, opts.revealed, opts.verdict);
  const log: StepLog = {
    kind: question.kind, rating, correct: opts.correct, hintCount: state.attempt.hints,
    attempts: Math.max(1, state.attempt.tries), durationMs: Math.max(0, at - state.attempt.startedAt), at,
  };
  const cards = { ...state.cards, [item.cardKey]: { ...run, logs: [...run.logs, log] } };

  let queue = state.queue;
  const next = nextStepIdx(state, item.cardKey, item.stepIdx);
  if (opts.revealed && item.pass === 1) {
    queue = insertAt(queue, { ...item, pass: 2 }, RETRY_GAP);
  } else if (next !== null) {
    queue = insertAt(queue, { cardKey: item.cardKey, stepIdx: next, pass: 1 }, GAPS[Math.min(item.stepIdx, GAPS.length - 1)]);
  }
  // `current` vẫn là bước vừa làm (đã tính vào doneSteps, để UI hiện kết quả) nên đếm lại không tính nó
  return recount(
    {
      ...state, cards, queue, doneSteps: state.doneSteps + 1, lastCardKey: item.cardKey, phase: "feedback",
      feedback: { correct: opts.correct, revealed: opts.revealed, verdict: opts.verdict, answer: question.answer },
    },
    false,
  );
};

export const reduce = (state: RunState, action: Action): RunState => {
  switch (action.type) {
    case "answer": {
      if (state.phase !== "question" || !state.current) return state;
      const question = currentQuestion(state)!;
      const lang = state.cards[state.current.cardKey].card.lang;
      const attempt = { ...state.attempt, tries: state.attempt.tries + 1 };
      if (question.answerType === "choose") {
        const option = question.options.find((o) => o.id === action.value);
        if (!option) return state;
        if (option.correct) return finalize({ ...state, attempt }, { correct: true, revealed: false, verdict: null }, action.at);
        attempt.wrongOptionIds = [...attempt.wrongOptionIds, option.id];
        if (attempt.tries >= MAX_TRIES) return finalize({ ...state, attempt }, { correct: false, revealed: true, verdict: "wrong" }, action.at);
        return { ...state, attempt };
      }
      const verdict = checkAnswer(action.value, question.answer, lang);
      if (verdict !== "wrong") return finalize({ ...state, attempt }, { correct: true, revealed: false, verdict }, action.at);
      attempt.lastVerdict = "wrong";
      if (attempt.tries >= MAX_TRIES) return finalize({ ...state, attempt }, { correct: false, revealed: true, verdict: "wrong" }, action.at);
      return { ...state, attempt };
    }
    case "speech": {
      if (state.phase !== "question" || !state.current) return state;
      const question = currentQuestion(state)!;
      if (question.answerType !== "speak") return state;
      const lang = state.cards[state.current.cardKey].card.lang;
      const attempt = { ...state.attempt, tries: state.attempt.tries + 1 };
      const verdict = checkSpoken(action.transcripts, question.answer, lang);
      if (verdict !== "wrong") return finalize({ ...state, attempt }, { correct: true, revealed: false, verdict }, action.at);
      attempt.lastVerdict = "wrong";
      if (attempt.tries >= MAX_TRIES) return finalize({ ...state, attempt }, { correct: false, revealed: true, verdict: "wrong" }, action.at);
      return { ...state, attempt };
    }
    case "written": {
      if (state.phase !== "question" || !state.current) return state;
      const question = currentQuestion(state)!;
      if (question.answerType !== "draw") return state;
      const attempt = { ...state.attempt, tries: state.attempt.tries + 1 };
      const verdict = checkWritten(action.cells, question.answer);
      if (verdict !== "wrong") return finalize({ ...state, attempt }, { correct: true, revealed: false, verdict }, action.at);
      attempt.lastVerdict = "wrong";
      if (attempt.tries >= MAX_TRIES) return finalize({ ...state, attempt }, { correct: false, revealed: true, verdict: "wrong" }, action.at);
      return { ...state, attempt };
    }
    case "skipKind": {
      if (state.phase !== "question" || !state.current) return state;
      const skipped = state.skipped.includes(action.kind) ? state.skipped : [...state.skipped, action.kind];
      const base = { ...state, skipped };
      const isSkipped = (item: Item) => skipped.includes(base.cards[item.cardKey].questions[item.stepIdx]?.kind);
      // Mục bị bỏ được thay đúng chỗ bằng bước kế (không bị bỏ) của thẻ đó; hết bước thì mất
      const queue: Item[] = [];
      for (const item of state.queue) {
        if (!isSkipped(item)) queue.push(item);
        else {
          const next = nextStepIdx(base, item.cardKey, item.stepIdx);
          if (next !== null) queue.push({ cardKey: item.cardKey, stepIdx: next, pass: 1 });
        }
      }
      let withQueue = { ...base, queue };
      const cur = state.current;
      if (isSkipped(cur)) {
        const next = nextStepIdx(base, cur.cardKey, cur.stepIdx);
        if (next !== null) withQueue = { ...withQueue, queue: insertAt(queue, { cardKey: cur.cardKey, stepIdx: next, pass: 1 }, GAPS[Math.min(cur.stepIdx, GAPS.length - 1)]) };
        return recount(advance({ ...withQueue, lastCardKey: cur.cardKey }, action.at));
      }
      return recount(withQueue);
    }
    case "hint": {
      if (state.phase !== "question") return state;
      const question = currentQuestion(state);
      if (!question || (question.answerType !== "type" && question.answerType !== "draw")) return state;
      const attempt = { ...state.attempt, hints: state.attempt.hints + 1 };
      if (attempt.hints > MAX_HINTS) return finalize({ ...state, attempt }, { correct: false, revealed: true, verdict: null }, action.at);
      return { ...state, attempt };
    }
    case "known": {
      if (state.phase !== "question" || !state.current) return state;
      const key = state.current.cardKey;
      const run = state.cards[key];
      const cards = { ...state.cards, [key]: { ...run, known: true } };
      const queue = state.queue.filter((i) => i.cardKey !== key);
      return recount(advance({ ...state, cards, queue, current: null, lastCardKey: key }, action.at));
    }
    case "next":
      return state.phase === "feedback" ? advance(state, action.at) : state;
    case "setGrade": {
      const auto = state.autoGrades[action.key];
      if (state.phase !== "summary" || !auto || state.cards[action.key]?.known) return state;
      return { ...state, grades: { ...state.grades, [action.key]: clampGrade(auto, action.grade) } };
    }
  }
};

/** Kết quả phiên để ghi DB: mỗi thẻ 1 điểm chấm + các bước đã làm. */
export interface CardResult {
  card: LearnCard;
  grade: Grade;
  known: boolean;
  logs: StepLog[];
}

export const resultsOf = (state: RunState): CardResult[] =>
  state.order.map((key) => {
    const run = state.cards[key];
    return { card: run.card, grade: state.grades[key] ?? GOOD, known: run.known, logs: run.logs };
  });

export const progressOf = (state: RunState) => (state.totalSteps ? Math.min(1, state.doneSteps / state.totalSteps) : 1);
