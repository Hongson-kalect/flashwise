import { AGAIN, GOOD, Grade, HARD, LearnCard, StepLog } from "./types";

/**
 * Phiên vuốt (docs 3.2): thẻ xếp chồng, mặt trước toàn tiếng đích, mỗi thẻ có ĐIỂM KHÓ trong phiên bắt đầu từ 0.
 * - Vuốt "nhớ": xong thẻ. Điểm 0 → Vừa, điểm 1-2 → Khó.
 * - Vuốt "chưa chắc": điểm +1; dưới 3 thì thẻ quay lại giữa phần còn lại của chồng, đạt 3 thì tính Quên.
 * - Xem nghĩa (lật): điểm lên thẳng 3 = Quên, vuốt hướng nào sau đó cũng chốt Quên.
 * - Không có Dễ (user hay lạm dụng làm khoảng ôn quá dài).
 * - Thẻ Quên quay lại cuối chồng 1 lần để xem lại, không tính FSRS.
 * - Có hoàn tác 1 bước.
 * Thuần (reducer), giống engine.ts.
 */

export type SwipeDirection = "remember" | "unsure";
export const FORGET_SCORE = 3;
const MAX_STEP_MS = 60_000; // thời gian nghĩ quá 60s coi như đi làm việc khác

export interface SwipeCardRun {
  card: LearnCard;
  level: number;
  score: number;
  flipped: boolean;
  /** Các lần vuốt "chưa chắc" (review_log is_fsrs = 0). */
  steps: StepLog[];
  grade: Grade | null;
  durationMs: number;
}

export interface SwipeItem {
  cardKey: string;
  /** Xem lại thẻ đã quên: vuốt chỉ để bỏ qua, không chấm. */
  review: boolean;
}

export interface SwipeState {
  cards: Record<string, SwipeCardRun>;
  order: string[];
  queue: SwipeItem[];
  current: SwipeItem | null;
  shownAt: number;
  total: number;
  finalized: number;
  startedAt: number;
  phase: "swiping" | "done";
  /** Trạng thái ngay trước hành động gần nhất, để hoàn tác (chỉ 1 bước). */
  prev: SwipeState | null;
}

export type SwipeAction =
  | { type: "swipe"; direction: SwipeDirection; at: number }
  | { type: "flip"; at: number }
  | { type: "undo"; at: number };

export interface SwipeStart {
  cards: LearnCard[];
  levels?: Record<string, number>;
  now: number;
}

const take = (queue: SwipeItem[], now: number): Pick<SwipeState, "queue" | "current" | "shownAt" | "phase"> => {
  const [current, ...rest] = queue;
  return { queue: rest, current: current ?? null, shownAt: now, phase: current ? "swiping" : "done" };
};

export const startSwipe = ({ cards, levels = {}, now }: SwipeStart): SwipeState => {
  const runs: Record<string, SwipeCardRun> = {};
  for (const card of cards) runs[card.key] = { card, level: levels[card.key] ?? 0, score: 0, flipped: false, steps: [], grade: null, durationMs: 0 };
  const order = cards.map((c) => c.key);
  return {
    cards: runs, order, ...take(order.map((cardKey) => ({ cardKey, review: false })), now),
    total: order.length, finalized: 0, startedAt: now, prev: null,
  };
};

const snapshot = (state: SwipeState): SwipeState => ({ ...state, prev: null });

const finalize = (state: SwipeState, key: string, grade: Grade, durationMs: number): SwipeState => {
  const run = state.cards[key];
  const queue = grade === AGAIN ? [...state.queue, { cardKey: key, review: true }] : state.queue; // thẻ quên: xem lại 1 lần ở cuối
  return { ...state, queue, cards: { ...state.cards, [key]: { ...run, grade, durationMs } }, finalized: state.finalized + 1 };
};

export const reduceSwipe = (state: SwipeState, action: SwipeAction): SwipeState => {
  if (action.type === "undo") return state.prev ? { ...state.prev, shownAt: action.at } : state;
  if (state.phase !== "swiping" || !state.current) return state;
  const item = state.current;
  const run = state.cards[item.cardKey];

  if (action.type === "flip") {
    if (item.review || run.flipped) return state;
    return {
      ...state, prev: snapshot(state),
      cards: { ...state.cards, [item.cardKey]: { ...run, flipped: true, score: FORGET_SCORE } },
    };
  }

  // vuốt
  const prev = snapshot(state);
  if (item.review) return { ...state, ...take(state.queue, action.at), prev };
  const spent = Math.min(MAX_STEP_MS, Math.max(0, action.at - state.shownAt));
  const total = run.durationMs + spent;

  let next: SwipeState;
  if (run.flipped) {
    next = finalize(state, item.cardKey, AGAIN, total);
  } else if (action.direction === "remember") {
    next = finalize(state, item.cardKey, run.score === 0 ? GOOD : HARD, total);
  } else {
    const score = run.score + 1;
    const step: StepLog = { kind: "swipe", rating: HARD, correct: false, hintCount: 0, attempts: score, durationMs: spent, at: action.at };
    const updated = { ...run, score, steps: [...run.steps, step], durationMs: total };
    if (score >= FORGET_SCORE) {
      next = finalize({ ...state, cards: { ...state.cards, [item.cardKey]: updated } }, item.cardKey, AGAIN, total);
    } else {
      const queue = [...state.queue];
      queue.splice(Math.floor(queue.length / 2), 0, item); // quay lại giữa phần còn lại của chồng
      next = { ...state, queue, cards: { ...state.cards, [item.cardKey]: updated } };
    }
  }
  return { ...next, ...take(next.queue, action.at), prev };
};

/** Kết quả vuốt để ghi DB: mỗi thẻ 1 điểm chấm + các lần "chưa chắc" đã vuốt. */
export interface SwipeResult {
  card: LearnCard;
  grade: Grade;
  steps: StepLog[];
  durationMs: number;
  hintCount: number;
  attempts: number;
}

export const swipeResults = (state: SwipeState): SwipeResult[] =>
  state.order
    .filter((key) => state.cards[key].grade)
    .map((key) => {
      const run = state.cards[key];
      return { card: run.card, grade: run.grade!, steps: run.steps, durationMs: run.durationMs, hintCount: 0, attempts: Math.max(1, run.steps.length + 1) };
    });

export const swipeProgress = (state: SwipeState) => (state.total ? Math.min(1, state.finalized / state.total) : 1);

/** Hướng vuốt theo cài đặt `swipe_direction`: "left_remember" (mặc định) = trái là nhớ, phải là chưa chắc; "right_remember" ngược lại. */
export const directionFor = (setting: string | undefined, side: "left" | "right"): SwipeDirection => {
  const rememberLeft = setting !== "right_remember";
  return (side === "left") === rememberLeft ? "remember" : "unsure";
};
