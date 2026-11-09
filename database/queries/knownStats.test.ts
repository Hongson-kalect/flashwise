import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { DatabaseSync } from "node:sqlite";
import { test } from "node:test";
import { maybeOptimizeFsrs, MIN_NEW_REVIEWS, MIN_REVIEWS, shouldOptimize } from "../../services/fsrsParams";
import { autoKnownBands, loadLearnedRows } from "./knownStats";

const schemaOf = (file: string) => readFileSync(`database/schema/${file}.ts`, "utf-8").match(/generateString\s*=\s*\/\*sql\*\/\s*`([\s\S]*?)`/)![1];

const makeDb = () => {
  const raw = new DatabaseSync(":memory:");
  for (const f of ["aiSense", "reviewLog", "systemConfig"]) raw.exec(schemaOf(f));
  return {
    raw,
    getAllAsync: async (sql: string, params: any[] = []) => raw.prepare(sql).all(...params) as any,
    getFirstAsync: async (sql: string, params: any[] = []) => (raw.prepare(sql).get(...params) as any) ?? null,
    runAsync: async (sql: string, params: any[] = []) => raw.prepare(sql).run(...params),
  };
};

let n = 0;
/** Học 1 thẻ mới ở mức `level` theo `mode`; `next` = điểm lần chấm FSRS kế tiếp (null = chưa ôn lại). */
const learn = (db: ReturnType<typeof makeDb>, level: string, mode: string, next: number | null) => {
  const id = `s${++n}`;
  db.raw.prepare(`INSERT INTO ai_sense (id, word_id, word_value, level) VALUES (?, 'w', 'x', ?)`).run(id, level);
  const log = db.raw.prepare(`INSERT INTO review_log (id, original_sense_id, sense_id, rating, mode, is_fsrs, reviewed_at) VALUES (?, ?, ?, ?, ?, ?, ?)`);
  log.run(`l${n}a`, id, id, 4, mode, 1, "2026-11-01 08:00:00");
  log.run(`l${n}b`, id, id, 3, "learn:write", 0, "2026-11-01 08:05:00"); // bước trong phiên: không tính
  if (next != null) log.run(`l${n}c`, id, id, next, "review:normal", 1, "2026-11-02 08:00:00");
};

test("loadLearnedRows: chỉ lấy lần học đầu, kèm điểm của lần chấm FSRS kế tiếp", async () => {
  const db = makeDb();
  learn(db, "A1", "learn:known", 3);
  learn(db, "A1", "learn:known", 1);
  learn(db, "A1", "learn:normal", null);
  learn(db, "B2", "learn:known_auto", 3);
  const rows = await loadLearnedRows(db as any);
  assert.equal(rows.length, 4);
  assert.deepEqual(rows.map((r) => [r.level, r.mode, r.next_rating]).sort(), [
    ["A1", "learn:known", 1], ["A1", "learn:known", 3], ["A1", "learn:normal", null], ["B2", "learn:known_auto", 3],
  ]);
});

test("autoKnownBands: mức user luôn biết và nhớ đúng thì tự bỏ qua, mức khác thì không", async () => {
  const db = makeDb();
  for (let i = 0; i < 12; i++) learn(db, "A1", "learn:known", 3);
  for (let i = 0; i < 12; i++) learn(db, "C1", "learn:normal", 3);
  for (let i = 0; i < 10; i++) learn(db, "B1", "learn:known", i < 5 ? 1 : 3);
  assert.deepEqual([...(await autoKnownBands(db as any))], ["A1"]);
});

test("shouldOptimize: đủ lượt, tăng thêm, và đã qua 1 ngày", () => {
  const day = 24 * 3600_000;
  const ok = { count: MIN_REVIEWS, lastCount: 0, lastAt: 0, now: day };
  assert.equal(shouldOptimize(ok), true);
  assert.equal(shouldOptimize({ ...ok, count: MIN_REVIEWS - 1 }), false);
  assert.equal(shouldOptimize({ ...ok, lastCount: MIN_REVIEWS - MIN_NEW_REVIEWS + 1 }), false);
  assert.equal(shouldOptimize({ ...ok, lastAt: 1, now: day }), false);
});

test("maybeOptimizeFsrs: gọi server khi đủ điều kiện, nhớ lần thử, lỗi mạng thì không ghi nhớ", async () => {
  const db = makeDb();
  const insert = db.raw.prepare(`INSERT INTO review_log (id, original_sense_id, rating, is_fsrs) VALUES (?, 's', 3, 1)`);
  for (let i = 0; i < MIN_REVIEWS; i++) insert.run(`r${i}`);
  const now = Date.UTC(2026, 10, 9);

  let calls = 0;
  assert.equal(await maybeOptimizeFsrs(db as any, async () => (calls++, { status: "kept" }), now), false);
  assert.equal(calls, 1);
  assert.equal(await maybeOptimizeFsrs(db as any, async () => (calls++, { status: "updated" }), now + 3600_000), false, "mới thử xong");
  assert.equal(calls, 1);

  for (let i = 0; i < MIN_NEW_REVIEWS; i++) insert.run(`x${i}`);
  await assert.rejects(maybeOptimizeFsrs(db as any, async () => { throw new Error("offline"); }, now + 2 * 24 * 3600_000));
  assert.equal(await maybeOptimizeFsrs(db as any, async () => (calls++, { status: "updated" }), now + 2 * 24 * 3600_000), true, "thử lại sau lỗi, server đã cập nhật");
  assert.equal(calls, 2);
});
