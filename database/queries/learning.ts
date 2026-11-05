import { CardResult } from "@/learning/engine";
import { CardRow, isReady, toCard } from "@/learning/cardData";
import { DEFAULT_MEDIAN_MS } from "@/learning/grade";
import { makeScheduler, MAX_LEVEL, scheduleNew } from "@/learning/fsrsService";
import { PoolEntry } from "@/learning/steps";
import { AGAIN, glossOf, LearnCard } from "@/learning/types";
import { toDbTime } from "@/learning/time";
import { uuidv7 } from "@/utils/uuidv7";
import { SQLiteDatabase } from "expo-sqlite";
import { dateKey, learningDayBounds } from "./home";
import { getUserSettings } from "../schema/userSetting";

export { toDbTime };

export interface LearnSettings {
  clusterSize: number;
  clusterSteps: number;
  retention: number;
  firstReviewHours: number;
  dayStartHour: number;
  hearable: boolean;
  /** Cho luyện nói (bước nói chỉ có khi máy có nhận dạng giọng nói). */
  talkable: boolean;
  /** Thẻ từ cấp này mới được ôn bằng vuốt (docs 5.2). */
  swipeMinLevel: number;
  swipeRetention: number;
  /** "left_remember" (vuốt trái = nhớ) hoặc "right_remember". */
  swipeDirection: string;
}

const num = (v: unknown, fallback: number, lo: number, hi: number) =>
  typeof v === "number" && v >= lo && v <= hi ? v : fallback;

export const loadLearnSettings = async (db: SQLiteDatabase): Promise<LearnSettings> => {
  const s = (await getUserSettings(db)) ?? {};
  return {
    clusterSize: Math.round(num(s.cluster_size, 6, 2, 12)),
    clusterSteps: Math.round(num(s.cluster_steps, 6, 3, 10)),
    retention: num(s.request_retention, 0.9, 0.7, 0.99),
    firstReviewHours: num(s.first_review_hours, 6, 1, 24),
    dayStartHour: Math.round(num(s.day_start_hour, 4, 0, 12)),
    hearable: s.hearable !== false,
    talkable: s.talkable !== false,
    swipeMinLevel: Math.round(num(s.swipe_min_level, 3, 0, 7)),
    swipeRetention: num(s.swipe_retention, 0.93, 0.7, 0.99),
    swipeDirection: typeof s.swipe_direction === "string" ? s.swipe_direction : "left_remember",
  };
};

const CARD_SQL = `
  SELECT i.id AS item_id, i.sense_id, COALESCE(i.original_id, i.sense_id) AS original_id,
         s.word_id, s.word_value, s.language_code, s.pos, s.ipas, w.ipas AS word_ipas, s.audio, w.audio AS word_audio,
         s.image_preview, m.image_link, m.image_keywords, s.contents, s.delta, s.global_difficulty, s.learner_count,
         p.state AS p_state, p.repetitions AS p_reps, p.is_hidden AS p_hidden, p.is_avoid AS p_avoid
  FROM collection_items i
  JOIN user_collection uc ON uc.collection_id = i.collection_id
  JOIN ai_sense s ON s.id = i.sense_id AND s.is_deleted = 0
  LEFT JOIN ai_word w ON w.id = s.word_id
  LEFT JOIN sense_metadata m ON m.id = s.metadata_id
  LEFT JOIN user_sense_progress p ON p.original_sense_id = COALESCE(i.original_id, i.sense_id) AND p.is_deleted = 0
  WHERE uc.id = ? AND i.is_deleted = 0
  ORDER BY i.display_order, i.created_at`;

export interface NewCards {
  /** Nghĩa mới của cụm (tối đa `count`), mỗi từ 1 nghĩa, chỉ nghĩa đã đủ bản dịch. */
  cards: LearnCard[];
  /** Nghĩa mới còn lại trong bộ (kể cả nghĩa dời sang lần sau vì trùng từ hoặc chưa có bản dịch). */
  available: number;
  /** Trong số đó, bao nhiêu nghĩa chưa có bản dịch sang ngôn ngữ của user. */
  waitingTranslation: number;
  /** Nghĩa khác trong bộ để làm đáp án nhiễu. */
  pool: PoolEntry[];
}

/** Luật như server (tracking/learn.py pick_new): nghĩa chưa học, bỏ nghĩa đã ẩn, mỗi từ 1 nghĩa, theo thứ tự hiển thị của bộ. */
export const pickNewCards = async (db: SQLiteDatabase, userCollectionId: string, userLang: string, count: number): Promise<NewCards> => {
  const rows = await db.getAllAsync<CardRow & { p_state: number | null; p_reps: number | null; p_hidden: number | null; p_avoid: number | null }>(
    CARD_SQL,
    [userCollectionId],
  );
  const cards: LearnCard[] = [];
  const pool: PoolEntry[] = [];
  const words = new Set<string>();
  const keys = new Set<string>();
  let available = 0;
  let waitingTranslation = 0;

  for (const row of rows) {
    if (row.p_hidden || row.p_avoid) continue;
    const card = toCard(row, userLang);
    if (keys.has(card.key)) continue;
    keys.add(card.key);
    const isNew = row.p_state == null || (row.p_state === 0 && !row.p_reps);
    const ready = isReady(card, userLang);
    if (isNew) {
      available += 1;
      if (!ready) waitingTranslation += 1;
    }
    if (isNew && ready && cards.length < count && !words.has(card.wordId)) {
      words.add(card.wordId);
      cards.push(card);
    } else if (ready) {
      pool.push({ key: card.key, word: card.word, gloss: glossOf(card) });
    }
  }
  return { cards, available, waitingTranslation, pool };
};

/** Thời gian trung vị (ms) của các bước trả lời gần đây của user; ít dữ liệu thì dùng mặc định. */
export const getMedianStepMs = async (db: SQLiteDatabase) => {
  const rows = await db.getAllAsync<{ duration_ms: number }>(
    `SELECT duration_ms FROM review_log WHERE is_fsrs = 0 AND duration_ms > 0 AND mode LIKE 'learn:choose%' ORDER BY reviewed_at DESC LIMIT 200`,
  );
  if (rows.length < 20) return DEFAULT_MEDIAN_MS;
  const sorted = rows.map((r) => r.duration_ms).sort((a, b) => a - b);
  return sorted[Math.floor(sorted.length / 2)];
};

export interface SaveInput {
  sessionId: string;
  /** Collection.id của bộ (learn_session.collection_id khớp server). */
  collectionId: string | null;
  startedAt: number;
  endedAt: number;
  results: CardResult[];
}

export interface SaveSummary {
  learned: number;
  known: number;
  xp: number;
  seconds: number;
}

const XP_NEW = 10;
const XP_KNOWN = 2;

/**
 * Ghi kết quả phiên học mới trong 1 giao dịch: tiến độ từng nghĩa (user_sense_progress, theo luật server ở learn/new/complete),
 * review_log (mỗi bước is_fsrs = 0, mỗi thẻ 1 dòng is_fsrs = 1), learn_session, day_learn_log. Chạy lại cùng sessionId không ghi 2 lần.
 */
export const saveLearnResult = async (db: SQLiteDatabase, input: SaveInput, settings: LearnSettings): Promise<SaveSummary> => {
  const done = await db.getFirstAsync<{ id: string }>(`SELECT id FROM learn_session WHERE id = ? AND status = 'completed'`, [input.sessionId]);
  const seconds = Math.max(0, Math.round((input.endedAt - input.startedAt) / 1000));
  const summary: SaveSummary = { learned: 0, known: 0, xp: 0, seconds };
  if (done) return summary;

  const scheduler = makeScheduler({ retention: settings.retention, firstReviewHours: settings.firstReviewHours });
  const sessionRows: { sense: string; ok: number; bad: number }[] = [];
  let correct = 0;
  let wrong = 0;
  const methods = new Set<string>();

  await db.withTransactionAsync(async () => {
    for (const r of input.results) {
      const last = r.logs.length ? Math.max(...r.logs.map((l) => l.at)) : input.endedAt;
      const at = new Date(last);
      const prog = scheduleNew(scheduler, r.grade, at, { globalDifficulty: r.card.globalDifficulty, learnerCount: r.card.learnerCount }, r.known);
      const good = r.grade !== AGAIN ? 1 : 0;
      await db.runAsync(
        `INSERT INTO user_sense_progress
           (id, original_sense_id, level, max_level, streak_correct, remember_count, repetitions, state, stability, difficulty,
            scheduled_days, learning_steps, failed_at, is_mastered, last_seen_at, last_reviewed_at, next_review_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, 1, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, DATETIME('now'))
         ON CONFLICT(original_sense_id) DO UPDATE SET
           level = excluded.level, max_level = MAX(max_level, excluded.max_level), streak_correct = excluded.streak_correct,
           remember_count = remember_count + excluded.remember_count, repetitions = repetitions + 1, state = excluded.state,
           stability = excluded.stability, difficulty = excluded.difficulty, scheduled_days = excluded.scheduled_days,
           learning_steps = excluded.learning_steps, failed_at = COALESCE(excluded.failed_at, failed_at),
           is_mastered = excluded.is_mastered, last_seen_at = excluded.last_seen_at, last_reviewed_at = excluded.last_reviewed_at,
           next_review_at = excluded.next_review_at, updated_at = DATETIME('now'), is_deleted = 0`,
        [
          uuidv7(), r.card.key, prog.level, prog.level, good, good, prog.state, prog.stability, prog.difficulty,
          prog.scheduledDays, prog.learningSteps, good ? null : toDbTime(at), prog.level >= MAX_LEVEL ? 1 : 0,
          toDbTime(at), toDbTime(at), toDbTime(prog.due),
        ],
      );

      const common = [r.card.key, r.card.senseId, input.sessionId];
      let ok = 0;
      let bad = 0;
      for (const log of r.logs) {
        methods.add(log.kind);
        await db.runAsync(
          `INSERT OR IGNORE INTO review_log (id, original_sense_id, sense_id, session_id, rating, mode, is_fsrs, level, hint_count, attempts, duration_ms, reviewed_at)
           VALUES (?, ?, ?, ?, ?, ?, 0, 0, ?, ?, ?, ?)`,
          [uuidv7(), ...common, log.rating, `learn:${log.kind}`, log.hintCount, log.attempts, log.durationMs, toDbTime(log.at)],
        );
        log.rating === AGAIN ? bad++ : ok++;
      }
      await db.runAsync(
        `INSERT OR IGNORE INTO review_log
           (id, original_sense_id, sense_id, session_id, rating, mode, is_fsrs, level, hint_count, attempts, duration_ms,
            state, elapsed_days, scheduled_days, stability, difficulty, reviewed_at)
         VALUES (?, ?, ?, ?, ?, ?, 1, 0, ?, ?, ?, ?, 0, ?, ?, ?, ?)`,
        [
          uuidv7(), ...common, r.known ? 4 : r.grade, r.known ? "learn:known" : "learn:normal",
          r.logs.reduce((n, l) => n + l.hintCount, 0), Math.max(1, r.logs.reduce((n, l) => n + l.attempts, 0)),
          r.logs.reduce((n, l) => n + l.durationMs, 0), prog.state, prog.scheduledDays, prog.stability, prog.difficulty, toDbTime(at),
        ],
      );
      r.grade === AGAIN ? bad++ : ok++;
      correct += ok;
      wrong += bad;
      sessionRows.push({ sense: r.card.key, ok, bad });
      summary.learned += 1;
      summary.known += r.known ? 1 : 0;
      summary.xp += r.known ? XP_KNOWN : XP_NEW;
    }

    await db.runAsync(
      `INSERT OR REPLACE INTO learn_session
         (id, type, status, mode, collection_id, methods, start_at, end_at, time, senses, sense_count, new_count, review_count,
          correct_count, wrong_count, xp_earned, updated_at)
       VALUES (?, 'learn', 'completed', 'normal', ?, ?, ?, ?, ?, ?, ?, ?, 0, ?, ?, ?, DATETIME('now'))`,
      [
        input.sessionId, input.collectionId, JSON.stringify([...methods]), toDbTime(input.startedAt), toDbTime(input.endedAt),
        seconds, JSON.stringify(sessionRows.map((s) => s.sense)), sessionRows.length, summary.learned, correct, wrong, summary.xp,
      ],
    );

    const day = dateKey(learningDayBounds(settings.dayStartHour, new Date(input.endedAt)).start);
    await db.runAsync(
      `INSERT INTO day_learn_log (id, date, words_learned, learn_time, xp_earned, sessions_count)
       VALUES (?, ?, ?, ?, ?, 1)
       ON CONFLICT(date) DO UPDATE SET words_learned = words_learned + excluded.words_learned,
         learn_time = learn_time + excluded.learn_time, xp_earned = xp_earned + excluded.xp_earned,
         sessions_count = sessions_count + 1, updated_at = DATETIME('now')`,
      [uuidv7(), day, summary.learned, seconds, summary.xp],
    );
  });
  return summary;
};
