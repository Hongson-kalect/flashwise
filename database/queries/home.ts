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

/**
 * Điều kiện "đến hạn" (bảng user_sense_progress alias `p`), dùng chung cho số đếm ở Home và lượt ôn (`pickReviewBatch`) để hai bên khớp.
 * Thẻ ôn thường (state 2) đến hạn khi `next_review_at` trước cuối ngày học (docs 5.5, như server). Thẻ đang học / học lại
 * (state 1, 3: vừa học hoặc vừa quên, hẹn lại sau vài phút đến vài giờ) chỉ tính khi đã tới giờ, không thì vừa ôn xong Home lại báo "đến hạn".
 * Tham số theo thứ tự: cuối ngày học, bây giờ (dạng toDbTime).
 */
export const DUE_SQL = `p.is_deleted = 0 AND p.is_mastered = 0 AND p.is_hidden = 0 AND p.is_avoid = 0 AND p.next_review_at IS NOT NULL
  AND NOT (p.state = 0 AND p.repetitions = 0)
  AND datetime(p.next_review_at) <= CASE WHEN p.state IN (1, 3) THEN datetime(?2) ELSE datetime(?1) END`;

const dbTime = (d: Date) => d.toISOString().replace("T", " ").slice(0, 19);

/** Số thẻ đến hạn ôn (xem DUE_SQL), chưa tính thẻ thiếu nội dung trong máy: Home dùng `countReadyDue` (review.ts) để khớp màn ôn. */
export const getDueCount = async (db: SQLiteDatabase, dayStartHour = 4, now = new Date()) => {
  const { end } = learningDayBounds(dayStartHour, now);
  const row = await db.getFirstAsync<{ n: number }>(
    `SELECT COUNT(*) AS n FROM user_sense_progress p WHERE ${DUE_SQL}`,
    [dbTime(end), dbTime(now)],
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

export interface MistakeWord {
  original_sense_id: string;
  word: string;
  lang: string;
  wrong: number;
  total: number;
}

/**
 * Từ hay sai (Home): nghĩa bị chấm "Again" (rating 1) nhiều nhất trong `days` ngày gần nhất, từ review_log ở máy.
 * Cần sai ít nhất `minWrong` lần mới tính; nghĩa đã ẩn / bỏ qua / xoá thì loại.
 */
export const getMistakeWords = async (db: SQLiteDatabase, days = 30, minWrong = 2, limit = 10): Promise<MistakeWord[]> => {
  const since = new Date(Date.now() - days * 86_400_000).toISOString().replace("T", " ").slice(0, 19);
  return db.getAllAsync<MistakeWord>(
    `SELECT l.original_sense_id, s.word_value AS word, s.language_code AS lang,
            SUM(CASE WHEN l.rating = 1 THEN 1 ELSE 0 END) AS wrong, COUNT(*) AS total
     FROM review_log l
     JOIN ai_sense s ON s.id = l.original_sense_id AND s.is_deleted = 0
     LEFT JOIN user_sense_progress p ON p.original_sense_id = l.original_sense_id
     WHERE datetime(l.reviewed_at) >= datetime(?)
       AND COALESCE(p.is_hidden, 0) = 0 AND COALESCE(p.is_avoid, 0) = 0 AND COALESCE(p.is_deleted, 0) = 0
     GROUP BY l.original_sense_id
     HAVING wrong >= ?
     ORDER BY wrong DESC, total ASC
     LIMIT ?`,
    [since, minWrong, limit],
  );
};
