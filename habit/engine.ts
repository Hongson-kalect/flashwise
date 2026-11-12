/**
 * Streak + khiên + độ bền thói quen (habit), phần thuần (không đụng SQLite / React). Mô hình lấy từ Fastfast
 * (database/schema/habit_logs.ts, fast_sessions.ts bên đó), con số đặt ở `HABIT_CONFIG` để chỉnh được.
 *
 * - Ngày học (key 'YYYY-MM-DD', theo `day_start_hour`) có học hoặc ôn thì streak +1, habit tăng.
 * - Nghỉ n ngày: trừ n khiên (tối đa 3 khiên). Đủ khiên thì streak giữ nguyên, các ngày nghỉ được ghi là "ngày khiên che".
 * - Thiếu khiên: khiên còn lại vẫn bị dùng hết, phần ngày nghỉ không có khiên làm mất streak và trừ habit.
 * - Habit 0-100. Qua mốc 35 / 70 / 100 thì được 1 khiên (mỗi mốc 1 lần, mốc nào bị tụt xuống dưới mốc trước thì nhận lại được).
 *   Habit đã đầy thì không cộng thêm.
 * - Tất cả là hàm thuần nhận / trả state: `reconcile` (chạy khi mở app / trước khi ghi phiên học) rồi `applyActivity`.
 */

export const HABIT_CONFIG = {
  shieldLimit: 3,
  /** Mốc habit được thưởng khiên. */
  milestones: [35, 70, 100],
  /** Điểm habit của 1 ngày học: từ `gainMin` (học / ôn ít) tới `gainMax` (đạt mục tiêu ngày), tăng theo số thẻ. */
  gainMin: 2,
  gainMax: 5,
  /** Trừ habit khi nghỉ không khiên che: `penaltyBase + penaltyPerDay * số ngày thiếu`. */
  penaltyBase: 5,
  penaltyPerDay: 4,
};

export type HabitConfig = typeof HABIT_CONFIG;

export interface HabitState {
  /** 0-100. */
  habit: number;
  shield: number;
  streak: number;
  maxStreak: number;
  /** Ngày cuối đã được tính vào streak (có học hoặc được khiên che). */
  streakDate: string | null;
  /** Mốc 35 / 70 / 100 còn nhận được khiên không. */
  claim: [boolean, boolean, boolean];
  /** Ngày đang cộng habit và số điểm đã cộng trong ngày đó (nhiều phiên cùng ngày chỉ cộng phần chênh). */
  todayDate: string | null;
  todayGain: number;
  activeDays: number;
  shieldUsed: number;
  shieldWasted: number;
}

export const INITIAL_HABIT: HabitState = {
  habit: 0, shield: 0, streak: 0, maxStreak: 0, streakDate: null, claim: [true, true, true],
  todayDate: null, todayGain: 0, activeDays: 0, shieldUsed: 0, shieldWasted: 0,
};

export type HabitEventType = "active" | "shield" | "lapse";

/** Một dòng nhật ký (habit_log). */
export interface HabitEvent {
  type: HabitEventType;
  date: string;
  habitDelta: number;
  habitSnap: number;
  shieldDelta: number;
  shieldSnap: number;
  /** Số ngày nghỉ liên quan (shield / lapse). */
  missedDays: number;
  /** Giải thích ngắn: mốc, ngày nghỉ... */
  note: string | null;
}

export interface Outcome {
  state: HabitState;
  events: HabitEvent[];
  /** Các ngày được khiên che (ghi vào day_learn_log với is_shield = 1 để server tính streak cùng luật). */
  coveredDates: string[];
  /** Streak vừa bị mất (cho modal báo). */
  lostStreak: number;
}

const round1 = (n: number) => Math.round(n * 10) / 10;
const clamp = (n: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, n));

const toUtc = (d: string) => {
  const [y, m, day] = d.split("-").map(Number);
  return Date.UTC(y, m - 1, day);
};
export const daysBetween = (from: string, to: string) => Math.round((toUtc(to) - toUtc(from)) / 86_400_000);
export const addDays = (d: string, n: number) => {
  const t = new Date(toUtc(d) + n * 86_400_000);
  return `${t.getUTCFullYear()}-${String(t.getUTCMonth() + 1).padStart(2, "0")}-${String(t.getUTCDate()).padStart(2, "0")}`;
};

/**
 * Dựng state ban đầu từ lịch sử các ngày có hoạt động (người đã học trước khi có tính năng này): streak = chuỗi ngày liền tới ngày
 * học gần nhất (còn tính nếu ngày đó là hôm nay hoặc hôm qua), habit và khiên bắt đầu từ 0. Không phạt ngược các ngày nghỉ cũ.
 */
export const stateFromDays = (days: string[], today: string): HabitState => {
  const sorted = [...new Set(days)].sort();
  const s: HabitState = { ...INITIAL_HABIT, claim: [...INITIAL_HABIT.claim] };
  if (!sorted.length) return s;
  let run = 0;
  let longest = 0;
  sorted.forEach((d, i) => {
    run = i > 0 && daysBetween(sorted[i - 1], d) === 1 ? run + 1 : 1;
    longest = Math.max(longest, run);
  });
  const last = sorted[sorted.length - 1];
  const alive = daysBetween(last, today) <= 1;
  s.streak = alive ? run : 0;
  s.maxStreak = longest;
  s.streakDate = alive ? last : addDays(today, -1);
  s.activeDays = sorted.length;
  return s;
};

/** Parse state lưu ở user_settings (thiếu / hỏng thì về mặc định, trường lạ bỏ). */
export const parseHabitState = (raw: unknown): HabitState => {
  let v: any = raw;
  if (typeof raw === "string") {
    try {
      v = JSON.parse(raw);
    } catch {
      v = null;
    }
  }
  if (!v || typeof v !== "object") return { ...INITIAL_HABIT, claim: [...INITIAL_HABIT.claim] };
  const num = (x: any, d: number) => (typeof x === "number" && Number.isFinite(x) ? x : d);
  const str = (x: any) => (typeof x === "string" && /^\d{4}-\d{2}-\d{2}$/.test(x) ? x : null);
  const claim: HabitState["claim"] = Array.isArray(v.claim) && v.claim.length === 3 ? [Boolean(v.claim[0]), Boolean(v.claim[1]), Boolean(v.claim[2])] : [true, true, true];
  return {
    habit: clamp(num(v.habit, 0), 0, 100),
    shield: clamp(Math.round(num(v.shield, 0)), 0, HABIT_CONFIG.shieldLimit),
    streak: Math.max(0, Math.round(num(v.streak, 0))),
    maxStreak: Math.max(0, Math.round(num(v.maxStreak, 0))),
    streakDate: str(v.streakDate),
    claim,
    todayDate: str(v.todayDate),
    todayGain: Math.max(0, num(v.todayGain, 0)),
    activeDays: Math.max(0, Math.round(num(v.activeDays, 0))),
    shieldUsed: Math.max(0, Math.round(num(v.shieldUsed, 0))),
    shieldWasted: Math.max(0, Math.round(num(v.shieldWasted, 0))),
  };
};

const clone = (s: HabitState): HabitState => ({ ...s, claim: [...s.claim] as HabitState["claim"] });

const event = (type: HabitEventType, date: string, before: HabitState, after: HabitState, missedDays = 0, note: string | null = null): HabitEvent => ({
  type,
  date,
  habitDelta: round1(after.habit - before.habit),
  habitSnap: round1(after.habit),
  shieldDelta: after.shield - before.shield,
  shieldSnap: after.shield,
  missedDays,
  note,
});

/**
 * Trừ khiên / habit cho các ngày nghỉ trước `today`. Gọi mỗi khi mở app và ngay trước khi ghi phiên học (chạy lại cùng
 * ngày không đổi gì vì `streakDate` đã dời tới hôm qua). Chưa từng học (streakDate null) thì không có gì để trừ.
 */
export const reconcile = (input: HabitState, today: string, cfg: HabitConfig = HABIT_CONFIG): Outcome => {
  const none: Outcome = { state: input, events: [], coveredDates: [], lostStreak: 0 };
  if (!input.streakDate) return none;
  const gap = daysBetween(input.streakDate, today);
  if (gap <= 1) return none;

  const s = clone(input);
  const missed = gap - 1;
  const used = Math.min(s.shield, missed);
  const over = missed - used;
  s.shield -= used;
  s.shieldUsed += used;

  let lostStreak = 0;
  let coveredDates: string[] = [];
  let type: HabitEventType = "shield";
  let note: string | null = null;

  if (over === 0) {
    coveredDates = Array.from({ length: missed }, (_, i) => addDays(input.streakDate!, i + 1));
    note = `${missed} ngày nghỉ được khiên che`;
  } else {
    type = "lapse";
    lostStreak = s.streak;
    s.streak = 0;
    const loss = Math.min(s.habit, cfg.penaltyBase + cfg.penaltyPerDay * over);
    s.habit = round1(s.habit - loss);
    // Tụt dưới mốc trước thì mốc sau nhận khiên lại được: 35 chỉ khi về 0, 70 khi dưới 35, 100 khi dưới 70
    if (s.habit <= 0) s.claim[0] = true;
    if (s.habit < cfg.milestones[0]) s.claim[1] = true;
    if (s.habit < cfg.milestones[1]) s.claim[2] = true;
    note = used ? `${missed} ngày nghỉ: khiên chỉ che ${used}, thiếu ${over}` : `${missed} ngày nghỉ, không còn khiên`;
  }
  s.streakDate = addDays(today, -1);
  // todayDate không đụng: hôm nay chưa tính gì
  return { state: s, events: [event(type, addDays(today, -1), input, s, missed, note)], coveredDates, lostStreak };
};

/** Điểm habit của 1 ngày với `items` thẻ (học mới + ôn) đã làm trong ngày; `goal` là mục tiêu ngày (daily_goal). */
export const dayGain = (items: number, goal: number, cfg: HabitConfig = HABIT_CONFIG) => {
  if (items <= 0) return 0;
  const ratio = clamp(items / Math.max(1, goal), 0, 1);
  return round1(cfg.gainMin + (cfg.gainMax - cfg.gainMin) * ratio);
};

/**
 * Ghi nhận học / ôn trong ngày `today` (`itemsToday` = tổng thẻ học + ôn của cả ngày sau phiên này, không phải của riêng phiên).
 * Tự `reconcile` trước. Ngày đầu tiên có học: streak +1; habit chỉ cộng phần chênh so với điểm đã cộng trong ngày.
 */
export const applyActivity = (input: HabitState, today: string, itemsToday: number, goal: number, cfg: HabitConfig = HABIT_CONFIG): Outcome => {
  const rec = reconcile(input, today, cfg);
  const before = clone(rec.state);
  const s = clone(rec.state);
  const events = [...rec.events];
  const notes: string[] = [];

  if (s.streakDate !== today) {
    s.streak += 1;
    s.streakDate = today;
    s.activeDays += 1;
    s.maxStreak = Math.max(s.maxStreak, s.streak);
  }
  if (s.todayDate !== today) {
    s.todayDate = today;
    s.todayGain = 0;
  }

  const delta = Math.max(0, round1(dayGain(itemsToday, goal, cfg) - s.todayGain));
  s.todayGain = round1(s.todayGain + delta);

  let shieldGain = 0;
  if (delta > 0) s.habit = round1(Math.min(100, s.habit + delta));
  cfg.milestones.forEach((m, i) => {
    if (s.habit >= m && s.claim[i]) {
      s.claim[i] = false;
      shieldGain += 1;
      notes.push(`đạt mốc ${m}%: +1 khiên`);
    }
  });
  if (shieldGain) {
    const next = Math.min(cfg.shieldLimit, s.shield + shieldGain);
    s.shieldWasted += s.shield + shieldGain - next;
    s.shield = next;
  }

  const changed = s.streak !== before.streak || s.habit !== before.habit || s.shield !== before.shield;
  if (changed) events.push(event("active", today, before, s, 0, notes.join("; ") || null));
  return { state: s, events, coveredDates: rec.coveredDates, lostStreak: rec.lostStreak };
};

/** Nhãn ngắn cho UI: tới mốc khiên tiếp theo còn bao nhiêu điểm habit (null nếu đã qua hết mốc đang nhận được). */
export const nextMilestone = (s: HabitState, cfg: HabitConfig = HABIT_CONFIG) => {
  const i = cfg.milestones.findIndex((m, idx) => s.claim[idx] && s.habit < m);
  return i < 0 ? null : { at: cfg.milestones[i], remaining: round1(cfg.milestones[i] - s.habit) };
};
