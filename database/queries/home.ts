import { SQLiteDatabase } from "expo-sqlite";

/** Ngày học bắt đầu lúc `dayStartHour` (mặc định 4h sáng), không phải 0h. */
export const learningDayBounds = (dayStartHour = 4, now = new Date()) => {
  const start = new Date(now);
  start.setHours(dayStartHour, 0, 0, 0);
  if (now < start) start.setDate(start.getDate() - 1);
  const end = new Date(start);
  end.setDate(end.getDate() + 1);
  return { start, end };
};

const pad = (n: number) => String(n).padStart(2, "0");
/** 'YYYY-MM-DD' theo giờ máy, khoá của day_learn_log.date. */
export const dateKey = (d: Date) =>
  `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;

/** Số thẻ đến hạn ôn: next_review_at <= cuối ngày học hiện tại (docs 5.5). */
export const getDueCount = async (db: SQLiteDatabase, dayStartHour = 4) => {
  const { end } = learningDayBounds(dayStartHour);
  const row = await db.getFirstAsync<{ n: number }>(
    `SELECT COUNT(*) AS n FROM user_sense_progress
     WHERE is_mastered = 0 AND is_hidden = 0 AND is_avoid = 0 AND is_deleted = 0
       AND next_review_at IS NOT NULL
       AND datetime(next_review_at) <= datetime(?)`,
    [end.toISOString().replace("T", " ").slice(0, 19)],
  );
  return row?.n ?? 0;
};

export interface DayLog {
  date: string;
  words_learned: number;
  words_relearned: number;
  learn_time: number;
  xp_earned: number;
}

/** `days` ngày gần nhất (kể cả ngày không học = 0), cũ → mới. */
export const getRecentLogs = async (
  db: SQLiteDatabase,
  days = 7,
  dayStartHour = 4,
): Promise<DayLog[]> => {
  const { start } = learningDayBounds(dayStartHour);
  const first = new Date(start);
  first.setDate(first.getDate() - (days - 1));
  const rows = await db.getAllAsync<DayLog>(
    `SELECT date, words_learned, words_relearned, learn_time, xp_earned
     FROM day_learn_log WHERE date >= ? ORDER BY date ASC`,
    [dateKey(first)],
  );
  const byDate = new Map(rows.map((r) => [r.date, r]));
  return Array.from({ length: days }, (_, i) => {
    const d = new Date(first);
    d.setDate(first.getDate() + i);
    const key = dateKey(d);
    return (
      byDate.get(key) ?? {
        date: key,
        words_learned: 0,
        words_relearned: 0,
        learn_time: 0,
        xp_earned: 0,
      }
    );
  });
};
