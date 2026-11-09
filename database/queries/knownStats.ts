import { bandOf, LearnedRow, shouldAutoKnown, tallyBands } from "@/learning/knownStats";
import { SQLiteDatabase } from "expo-sqlite";

/** Mỗi lần học thẻ mới (dòng review_log FSRS đầu của thẻ) kèm mức của nghĩa và điểm của lần chấm FSRS kế tiếp. */
export const loadLearnedRows = async (db: SQLiteDatabase): Promise<LearnedRow[]> =>
  db.getAllAsync<LearnedRow>(
    `SELECT s.level AS level, k.mode AS mode,
            (SELECT r.rating FROM review_log r
              WHERE r.original_sense_id = k.original_sense_id AND r.is_fsrs = 1 AND r.reviewed_at > k.reviewed_at
              ORDER BY r.reviewed_at LIMIT 1) AS next_rating
     FROM review_log k
     LEFT JOIN ai_sense s ON s.id = k.sense_id
     WHERE k.is_fsrs = 1 AND k.mode IN ('learn:known', 'learn:known_auto', 'learn:normal')`,
  );

/** Các mức mà từ mới nên được tự đánh dấu "đã biết" (cần bật `auto_known`). */
export const autoKnownBands = async (db: SQLiteDatabase): Promise<Set<string>> => {
  const bands = tallyBands(await loadLearnedRows(db));
  return new Set([...bands.keys()].filter((band) => shouldAutoKnown(bands.get(band))));
};

export { bandOf };
