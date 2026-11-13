import assert from "node:assert/strict";
import { DatabaseSync } from "node:sqlite";
import { beforeEach, test } from "node:test";
import { generateSchema, generateSeedData } from "../schema/ddl";
import { countReadyDue, pickReviewBatch, reviewQuota } from "./review";
import { loadLearnSettings } from "./learning";

let raw: DatabaseSync;
const db = (): any => ({
  getAllAsync: async (sql: string, params: any[] = []) => raw.prepare(sql).all(...params) as any,
  getFirstAsync: async (sql: string, params: any[] = []) => (raw.prepare(sql).get(...params) as any) ?? null,
  runAsync: async (sql: string, params: any[] = []) => raw.prepare(sql).run(...params) as any,
});
const NOW = new Date("2026-11-13T12:00:00");

/** Thêm 1 nghĩa + tiến độ đến hạn. `translated = false` thì thiếu bản dịch tiếng Việt (ôn chưa được). */
const addCard = (n: number, opts: { translated?: boolean; level?: number; mastered?: boolean } = {}) => {
  const { translated = true, level = 0, mastered = false } = opts;
  const contents = JSON.stringify({ definition: { en: { value: `def ${n}` } }, translations: translated ? { vi: [`nghia ${n}`] } : {} });
  raw.prepare(`INSERT INTO ai_word (id, value, language_code) VALUES (?, ?, 'en')`).run(`w${n}`, `word${n}`);
  raw.prepare(`INSERT INTO ai_sense (id, word_id, word_value, language_code, contents) VALUES (?, ?, ?, 'en', ?)`).run(`s${n}`, `w${n}`, `word${n}`, contents);
  raw.prepare(
    `INSERT INTO user_sense_progress (id, original_sense_id, state, repetitions, level, is_mastered, stability, next_review_at, last_reviewed_at)
     VALUES (?, ?, 2, 3, ?, ?, 5, '2026-11-12 10:00:00', '2026-11-08 10:00:00')`,
  ).run(`p${n}`, `s${n}`, level, mastered ? 1 : 0);
};

beforeEach(() => {
  raw = new DatabaseSync(":memory:");
  raw.exec(generateSchema);
  raw.exec(generateSeedData);
});

test("Home đếm khớp màn ôn: bỏ thẻ thiếu bản dịch và thẻ đã thuộc hẳn", async () => {
  addCard(1);
  addCard(2);
  addCard(3, { translated: false });
  addCard(4, { mastered: true });
  assert.equal(await countReadyDue(db(), "vi", 4, NOW), 2);
  const batch = await pickReviewBatch(db(), "vi", await loadLearnSettings(db()), NOW);
  assert.equal(batch.normalTotal + batch.quickTotal, 2);
});

test("ôn nhẹ: review_limit chia thẻ dồn lại ra nhiều ngày", async () => {
  for (let i = 1; i <= 10; i++) addCard(i);
  raw.prepare(`UPDATE user_settings SET value = '4' WHERE key = 'review_limit'`).run();
  const settings = await loadLearnSettings(db());
  assert.equal(settings.reviewLimit, 4);
  assert.equal(await countReadyDue(db(), "vi", 4, NOW, 4), 4);
  const batch = await pickReviewBatch(db(), "vi", settings, NOW);
  assert.equal(batch.normal.length, 4);
  assert.equal(batch.normalTotal, 4);
  // đã ôn 3 thẻ hôm nay → còn 1
  raw.prepare(`INSERT INTO day_learn_log (id, date, words_relearned) VALUES ('d', '2026-11-13', 3)`).run();
  assert.equal(await reviewQuota(db(), 4, 4, NOW), 1);
  assert.equal((await pickReviewBatch(db(), "vi", settings, NOW)).normal.length, 1);
  // không giới hạn
  assert.equal(await reviewQuota(db(), 0, 4, NOW), Infinity);
});

test("số thẻ vuốt mỗi lượt theo swipe_count", async () => {
  for (let i = 1; i <= 15; i++) addCard(i, { level: 4 });
  raw.prepare(`INSERT INTO user_settings (key, value) VALUES ('swipe_count', '12') ON CONFLICT(key) DO UPDATE SET value = '12'`).run();
  const batch = await pickReviewBatch(db(), "vi", await loadLearnSettings(db()), NOW);
  assert.equal(batch.quick.length, 12);
  assert.equal(batch.quickTotal, 15);
});
