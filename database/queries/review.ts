import { CardRow, isReady, toCard } from "@/learning/cardData";
import { CardResult } from "@/learning/engine";
import { makeScheduler, MAX_LEVEL, retrievability, ReviewMode, scheduleReview } from "@/learning/fsrsService";
import { PoolEntry } from "@/learning/steps";
import { fromDbTime, toDbTime } from "@/learning/time";
import { AGAIN, glossOf, Grade, LearnCard, StepLog } from "@/learning/types";
import { uuidv7 } from "@/utils/uuidv7";
import { SQLiteDatabase } from "expo-sqlite";
import { dateKey, learningDayBounds } from "./home";
import { LearnSettings } from "./learning";

const SENSE_SQL = `
  SELECT NULL AS item_id, s.id AS sense_id, COALESCE(s.original_id, s.id) AS original_id,
         s.word_id, s.word_value, s.language_code, s.pos, s.ipas, w.ipas AS word_ipas, s.audio, w.audio AS word_audio,
         s.image_preview, m.image_link, m.image_keywords, s.contents, s.delta, s.global_difficulty, s.learner_count
  FROM ai_sense s
  LEFT JOIN ai_word w ON w.id = s.word_id
  LEFT JOIN sense_metadata m ON m.id = s.metadata_id
  WHERE s.is_deleted = 0 AND s.id IN`;

/** Nghĩa → thẻ học (đã gộp delta); chỉ giữ thẻ đủ dữ liệu (có bản dịch). Khoá: sense_id. */
const fetchSenseCards = async (db: SQLiteDatabase, senseIds: string[], userLang: string) => {
  const cards = new Map<string, LearnCard>();
  for (let i = 0; i < senseIds.length; i += 400) {
    const chunk = senseIds.slice(i, i + 400);
    const rows = await db.getAllAsync<CardRow>(`${SENSE_SQL} (${chunk.map(() => "?").join(",")})`, chunk);
    for (const row of rows) {
      const card = toCard(row, userLang);
      if (isReady(card, userLang)) cards.set(row.sense_id, card);
    }
  }
  return cards;
};

export interface ReviewCandidate {
  card: LearnCard;
  level: number;
  /** Khả năng còn nhớ lúc chọn thẻ (thấp trước). */
  retrievability: number;
}

export interface ReviewBatch {
  /** Thẻ đủ cấp để ôn bằng vuốt (tối đa 30). */
  quick: ReviewCandidate[];
  /** Thẻ cấp thấp ôn theo cụm (tối đa cluster_size). */
  normal: ReviewCandidate[];
  quickTotal: number;
  normalTotal: number;
  /** Nghĩa khác để làm đáp án nhiễu cho cụm. */
  pool: PoolEntry[];
}

const QUICK_COUNT = 30;

/**
 * Thẻ đến hạn ôn (luật như server tracking/learn.py pick_review): đã học, không ẩn, `next_review_at` trước cuối ngày học,
 * khả năng nhớ thấp nhất trước, mỗi từ 1 nghĩa mỗi lượt. Chia 2 nhóm theo cấp: vuốt (>= swipe_min_level) và theo cụm (còn lại).
 * Thẻ mà nghĩa chưa có trong máy / chưa có bản dịch thì bỏ qua (chưa ôn được offline).
 */
export const pickReviewBatch = async (
  db: SQLiteDatabase,
  userLang: string,
  settings: LearnSettings,
  now = new Date(),
  /** original_sense_id đã ôn trong lần mở màn này: không đưa lại (thẻ vừa ôn có thể hẹn lại vài giờ, vẫn nằm trước cuối ngày học). */
  exclude: ReadonlySet<string> = new Set(),
): Promise<ReviewBatch> => {
  const cutoff = learningDayBounds(settings.dayStartHour, now).end;
  const allRows = await db.getAllAsync<{ original_sense_id: string; level: number; stability: number; last_reviewed_at: string | null; sense_id: string }>(
    `SELECT p.original_sense_id, p.level, p.stability, p.last_reviewed_at,
            COALESCE((SELECT i.sense_id FROM collection_items i
                      WHERE COALESCE(i.original_id, i.sense_id) = p.original_sense_id AND i.is_deleted = 0
                      ORDER BY i.updated_at DESC LIMIT 1), p.original_sense_id) AS sense_id
     FROM user_sense_progress p
     WHERE p.is_deleted = 0 AND p.is_hidden = 0 AND p.is_avoid = 0 AND p.next_review_at IS NOT NULL
       AND NOT (p.state = 0 AND p.repetitions = 0) AND datetime(p.next_review_at) <= datetime(?)`,
    [toDbTime(cutoff)],
  );
  const rows = allRows.filter((r) => !exclude.has(r.original_sense_id));
  const cards = await fetchSenseCards(db, [...new Set(rows.map((r) => r.sense_id))], userLang);

  const due = rows
    .map((r) => {
      const card = cards.get(r.sense_id);
      const last = fromDbTime(r.last_reviewed_at);
      const elapsed = last ? (now.getTime() - last.getTime()) / 86400000 : 0;
      return card ? { card: { ...card, key: r.original_sense_id }, level: r.level, retrievability: retrievability(r.stability, elapsed) } : null;
    })
    .filter((c): c is ReviewCandidate => !!c)
    .sort((a, b) => a.retrievability - b.retrievability);

  const pick = (list: ReviewCandidate[], count: number) => {
    const words = new Set<string>();
    const out: ReviewCandidate[] = [];
    for (const c of list) {
      if (out.length >= count) break;
      if (words.has(c.card.wordId)) continue;
      words.add(c.card.wordId);
      out.push(c);
    }
    return out;
  };
  const quickAll = due.filter((c) => c.level >= settings.swipeMinLevel);
  const normalAll = due.filter((c) => c.level < settings.swipeMinLevel);
  const normal = pick(normalAll, settings.clusterSize);

  // Đáp án nhiễu cho cụm: các thẻ đến hạn khác, thiếu thì lấy thêm nghĩa đã học bất kỳ
  const chosen = new Set(normal.map((c) => c.card.key));
  const pool: PoolEntry[] = due.filter((c) => !chosen.has(c.card.key)).slice(0, 30).map((c) => ({ key: c.card.key, word: c.card.word, gloss: glossOf(c.card) }));
  if (normal.length && pool.length < 12) {
    const extra = await db.getAllAsync<{ original_sense_id: string }>(
      `SELECT original_sense_id FROM user_sense_progress WHERE is_deleted = 0 AND NOT (state = 0 AND repetitions = 0) ORDER BY RANDOM() LIMIT 40`,
    );
    const more = await fetchSenseCards(db, extra.map((r) => r.original_sense_id), userLang);
    for (const c of more.values()) if (!chosen.has(c.key) && !pool.some((p) => p.key === c.key)) pool.push({ key: c.key, word: c.word, gloss: glossOf(c) });
  }
  return { quick: pick(quickAll, QUICK_COUNT), normal, quickTotal: quickAll.length, normalTotal: normalAll.length, pool };
};

export interface ReviewCardResult {
  card: LearnCard;
  grade: Grade;
  /** Các bước làm trong phiên (review_log is_fsrs = 0): vuốt "chưa chắc" hoặc các bước của cụm. */
  steps: StepLog[];
  durationMs: number;
  hintCount: number;
  attempts: number;
}

export interface ReviewSaveInput {
  sessionId: string;
  mode: ReviewMode;
  startedAt: number;
  endedAt: number;
  results: ReviewCardResult[];
}

export interface ReviewSummary {
  reviewed: number;
  remembered: number;
  forgotten: number;
  xp: number;
  seconds: number;
}

const XP_REVIEW: Record<ReviewMode, number> = { normal: 5, quick: 2 };

/** Kết quả cụm (engine) → dạng ghi ôn tập: mỗi thẻ cộng các bước. */
export const reviewResultsFromCluster = (results: CardResult[]): ReviewCardResult[] =>
  results.map((r) => ({
    card: r.card,
    grade: r.grade,
    steps: r.logs,
    durationMs: r.logs.reduce((n, l) => n + l.durationMs, 0),
    hintCount: r.logs.reduce((n, l) => n + l.hintCount, 0),
    attempts: Math.max(1, r.logs.reduce((n, l) => n + l.attempts, 0)),
  }));

/**
 * Ghi kết quả 1 phiên ôn trong 1 giao dịch (luật như server learn/review/complete): chấm tiếp thẻ FSRS (vuốt dùng mục tiêu nhớ
 * cao hơn), cấp thẻ, review_log (bước is_fsrs = 0, mỗi thẻ 1 dòng is_fsrs = 1), learn_session, day_learn_log. Thẻ chưa học thì
 * bỏ qua. Cùng sessionId không ghi 2 lần.
 */
export const saveReviewResult = async (db: SQLiteDatabase, input: ReviewSaveInput, settings: LearnSettings): Promise<ReviewSummary> => {
  const seconds = Math.max(0, Math.round((input.endedAt - input.startedAt) / 1000));
  const summary: ReviewSummary = { reviewed: 0, remembered: 0, forgotten: 0, xp: 0, seconds };
  if (await db.getFirstAsync(`SELECT id FROM learn_session WHERE id = ? AND status = 'completed'`, [input.sessionId])) return summary;

  const scheduler = makeScheduler({
    retention: input.mode === "quick" ? settings.swipeRetention : settings.retention,
    firstReviewHours: settings.firstReviewHours,
  });
  const kinds = new Set<string>();
  const done: string[] = [];
  let correct = 0;
  let wrong = 0;

  await db.withTransactionAsync(async () => {
    for (const r of input.results) {
      const row = await db.getFirstAsync<any>(
        `SELECT level, state, stability, difficulty, learning_steps, repetitions, forget_count, last_reviewed_at, next_review_at
         FROM user_sense_progress WHERE original_sense_id = ? AND is_deleted = 0`,
        [r.card.key],
      );
      if (!row || (row.state === 0 && !row.repetitions)) continue; // chưa học: không ôn
      const last = fromDbTime(row.last_reviewed_at);
      const lastStep = r.steps.length ? Math.max(...r.steps.map((s) => s.at)) : input.endedAt;
      const at = new Date(Math.max(lastStep, last ? last.getTime() + 1000 : 0));
      const prog = scheduleReview(
        scheduler,
        {
          level: row.level, state: row.state, stability: row.stability, difficulty: row.difficulty, learningSteps: row.learning_steps,
          repetitions: row.repetitions, forgetCount: row.forget_count, lastReviewedAt: last, nextReviewAt: fromDbTime(row.next_review_at),
        },
        r.grade, at, input.mode,
      );
      const good = r.grade !== AGAIN ? 1 : 0;
      const elapsed = last ? Math.max(0, (at.getTime() - last.getTime()) / 86400000) : 0;
      await db.runAsync(
        `UPDATE user_sense_progress SET level = ?, max_level = MAX(max_level, ?), state = ?, stability = ?, difficulty = ?,
           scheduled_days = ?, learning_steps = ?, next_review_at = ?, last_reviewed_at = ?, last_seen_at = ?,
           repetitions = repetitions + 1, remember_count = remember_count + ?, forget_count = forget_count + ?,
           streak_correct = CASE WHEN ? = 1 THEN streak_correct + 1 ELSE 0 END,
           failed_at = CASE WHEN ? = 1 THEN failed_at ELSE ? END, is_mastered = ?, updated_at = DATETIME('now')
         WHERE original_sense_id = ?`,
        [
          prog.level, prog.level, prog.state, prog.stability, prog.difficulty, prog.scheduledDays, prog.learningSteps, toDbTime(prog.due),
          toDbTime(at), toDbTime(at), good, prog.lapsed ? 1 : 0, good, good, toDbTime(at), prog.level >= MAX_LEVEL ? 1 : 0, r.card.key,
        ],
      );

      const common = [r.card.key, r.card.senseId, input.sessionId];
      let ok = 0;
      let bad = 0;
      for (const step of r.steps) {
        kinds.add(step.kind);
        await db.runAsync(
          `INSERT OR IGNORE INTO review_log (id, original_sense_id, sense_id, session_id, rating, mode, is_fsrs, level, hint_count, attempts, duration_ms, reviewed_at)
           VALUES (?, ?, ?, ?, ?, ?, 0, ?, ?, ?, ?, ?)`,
          [uuidv7(), ...common, step.rating, `review:${step.kind}`, row.level, step.hintCount, step.attempts, step.durationMs, toDbTime(step.at)],
        );
        step.rating === AGAIN ? bad++ : ok++;
      }
      if (!r.steps.length) kinds.add(input.mode === "quick" ? "swipe" : "normal");
      await db.runAsync(
        `INSERT OR IGNORE INTO review_log
           (id, original_sense_id, sense_id, session_id, rating, mode, is_fsrs, level, hint_count, attempts, duration_ms,
            state, elapsed_days, scheduled_days, stability, difficulty, reviewed_at)
         VALUES (?, ?, ?, ?, ?, ?, 1, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          uuidv7(), ...common, r.grade, input.mode === "quick" ? "review:swipe" : "review:normal", row.level, r.hintCount, r.attempts,
          r.durationMs, prog.state, elapsed, prog.scheduledDays, prog.stability, prog.difficulty, toDbTime(at),
        ],
      );
      r.grade === AGAIN ? bad++ : ok++;
      correct += ok;
      wrong += bad;
      done.push(r.card.key);
      summary.reviewed += 1;
      summary.remembered += good;
      summary.forgotten += good ? 0 : 1;
      summary.xp += XP_REVIEW[input.mode];
    }

    await db.runAsync(
      `INSERT OR REPLACE INTO learn_session
         (id, type, status, mode, collection_id, methods, start_at, end_at, time, senses, sense_count, new_count, review_count,
          correct_count, wrong_count, xp_earned, updated_at)
       VALUES (?, 'review', 'completed', ?, NULL, ?, ?, ?, ?, ?, ?, 0, ?, ?, ?, ?, DATETIME('now'))`,
      [
        input.sessionId, input.mode, JSON.stringify([...kinds]), toDbTime(input.startedAt), toDbTime(input.endedAt), seconds,
        JSON.stringify(done), done.length, summary.reviewed, correct, wrong, summary.xp,
      ],
    );
    const day = dateKey(learningDayBounds(settings.dayStartHour, new Date(input.endedAt)).start);
    await db.runAsync(
      `INSERT INTO day_learn_log (id, date, words_relearned, learn_time, xp_earned, sessions_count)
       VALUES (?, ?, ?, ?, ?, 1)
       ON CONFLICT(date) DO UPDATE SET words_relearned = words_relearned + excluded.words_relearned,
         learn_time = learn_time + excluded.learn_time, xp_earned = xp_earned + excluded.xp_earned,
         sessions_count = sessions_count + 1, updated_at = DATETIME('now')`,
      [uuidv7(), day, summary.reviewed, seconds, summary.xp],
    );
  });
  return summary;
};
