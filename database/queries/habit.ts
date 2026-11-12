import { applyActivity, HabitEvent, HabitState, Outcome, parseHabitState, reconcile, stateFromDays } from "@/habit/engine";
import { uuidv7 } from "@/utils/uuidv7";
import { SQLiteDatabase } from "expo-sqlite";
import { dateKey, learningDayBounds } from "./home";

/** Trạng thái hiện tại nằm ở user_settings (có đồng bộ, nên cài lại máy vẫn lấy lại được); nhật ký thay đổi ở habit_log (chỉ máy). */
export const HABIT_KEY = "habit_state";

type Db = Pick<SQLiteDatabase, "getAllAsync" | "getFirstAsync" | "runAsync">;

/** Chưa có state: dựng từ lịch sử day_learn_log (kể cả ngày khiên che) để người đã học từ trước không phải bắt đầu streak từ 0. */
export const loadHabitState = async (db: Db, today?: string): Promise<HabitState> => {
  const row = await db.getFirstAsync<{ value: string }>(`SELECT value FROM user_settings WHERE key = ?`, [HABIT_KEY]);
  if (row) return parseHabitState(row.value);
  const days = await db.getAllAsync<{ date: string }>(
    `SELECT date FROM day_learn_log WHERE words_learned > 0 OR words_relearned > 0 OR learn_time > 0 OR is_shield = 1`,
  );
  return stateFromDays(days.map((d) => d.date), today ?? dateKey(learningDayBounds(4).start));
};

const saveHabitState = (db: Db, state: HabitState) =>
  db.runAsync(`INSERT INTO user_settings (key, value) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value`, [HABIT_KEY, JSON.stringify(state)]);

/** Kết quả gọn cho UI: modal mở app (khiên cứu / mất streak) và dòng tóm tắt sau phiên học. */
export interface HabitReport {
  streak: number;
  streakBefore: number;
  habit: number;
  habitDelta: number;
  shield: number;
  shieldDelta: number;
  /** Số khiên đã dùng để che ngày nghỉ (0 nếu không có). */
  shieldUsed: number;
  /** Số ngày nghỉ vừa được xử lý. */
  missedDays: number;
  /** Streak vừa mất (0 nếu không mất). */
  lostStreak: number;
  /** Có thay đổi gì đáng báo không. */
  changed: boolean;
}

const report = (before: HabitState, out: Outcome): HabitReport => {
  const after = out.state;
  const used = out.events.filter((e) => e.type !== "active").reduce((n, e) => n + Math.max(0, -e.shieldDelta), 0);
  const missed = out.events.filter((e) => e.type !== "active").reduce((n, e) => n + e.missedDays, 0);
  return {
    streak: after.streak,
    streakBefore: before.streak,
    habit: after.habit,
    habitDelta: Math.round((after.habit - before.habit) * 10) / 10,
    shield: after.shield,
    shieldDelta: after.shield - before.shield,
    shieldUsed: used,
    missedDays: missed,
    lostStreak: out.lostStreak,
    changed: JSON.stringify(before) !== JSON.stringify(after),
  };
};

const insertEvent = (db: Db, e: HabitEvent) =>
  db.runAsync(
    `INSERT INTO habit_log (id, log_date, type, habit_delta, habit_snap, shield_delta, shield_snap, retain_delta, retain_snap, missed_days, note)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [uuidv7(), e.date, e.type, e.habitDelta, e.habitSnap, e.shieldDelta, e.shieldSnap, e.retainDelta, e.retainSnap, e.missedDays, e.note],
  );

/** Streak / XP trên profile local (server cũng tính từ day_learn_log; ở máy để khách và offline vẫn có số). */
export const refreshProfileStats = async (db: Db, state?: HabitState) => {
  const s = state ?? (await loadHabitState(db));
  await db.runAsync(
    `UPDATE user_profile SET current_streak = ?, max_streak = MAX(max_streak, ?),
       total_xp = COALESCE((SELECT SUM(xp_earned) FROM day_learn_log WHERE is_shield = 0 OR is_shield IS NULL), 0)`,
    [s.streak, s.maxStreak],
  );
};

export interface TrackOptions {
  dayStartHour: number;
  /** true: vừa học / ôn xong (cộng streak, habit); false: chỉ trừ khiên / habit cho ngày nghỉ (mở app). */
  activity: boolean;
  now?: Date;
}

/**
 * Cập nhật streak / khiên / habit và ghi xuống DB. Gọi trong giao dịch ghi phiên học (sau khi day_learn_log đã cộng) và khi mở app.
 * Chạy lại trong cùng ngày không phạt hai lần (xem habit/engine `reconcile`). Ngày được khiên che ghi vào day_learn_log
 * (is_shield = 1) để server tính streak cùng luật.
 */
export const trackHabit = async (db: Db, opts: TrackOptions): Promise<HabitReport> => {
  const day = dateKey(learningDayBounds(opts.dayStartHour, opts.now ?? new Date()).start);
  const before = await loadHabitState(db, day);
  let out: Outcome;
  if (opts.activity) {
    const goalRow = await db.getFirstAsync<{ value: string }>(`SELECT value FROM user_settings WHERE key = 'daily_goal'`);
    const goal = Number(goalRow?.value ?? 20) || 20;
    const items = await db.getFirstAsync<{ n: number }>(`SELECT COALESCE(words_learned, 0) + COALESCE(words_relearned, 0) AS n FROM day_learn_log WHERE date = ?`, [day]);
    out = applyActivity(before, day, items?.n ?? 0, goal);
  } else {
    out = reconcile(before, day);
  }

  // Lần đầu (chưa có dòng habit_state) luôn lưu state dựng từ lịch sử để lần sau không dựng lại
  const stored = await db.getFirstAsync(`SELECT 1 FROM user_settings WHERE key = ?`, [HABIT_KEY]);
  if (!stored || JSON.stringify(out.state) !== JSON.stringify(before)) await saveHabitState(db, out.state);
  for (const e of out.events) await insertEvent(db, e);
  for (const date of out.coveredDates) {
    await db.runAsync(`INSERT INTO day_learn_log (id, date, is_shield) VALUES (?, ?, 1) ON CONFLICT(date) DO NOTHING`, [uuidv7(), date]);
  }
  await refreshProfileStats(db, out.state);
  return report(before, out);
};

export interface HabitView {
  state: HabitState;
  /** Nhật ký gần nhất (mới trước). */
  recent: { id: string; log_date: string; type: string; habit_delta: number; habit_snap: number; shield_delta: number; missed_days: number; note: string | null }[];
  totalXp: number;
}

export const getHabitView = async (db: Db, recentLimit = 20): Promise<HabitView> => {
  const [state, recent, xp] = await Promise.all([
    loadHabitState(db),
    db.getAllAsync<HabitView["recent"][number]>(
      `SELECT id, log_date, type, habit_delta, habit_snap, shield_delta, missed_days, note FROM habit_log ORDER BY log_date DESC, id DESC LIMIT ?`,
      [recentLimit],
    ),
    db.getFirstAsync<{ n: number }>(`SELECT COALESCE(SUM(xp_earned), 0) AS n FROM day_learn_log`),
  ]);
  return { state, recent, totalXp: xp?.n ?? 0 };
};
