import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { DatabaseSync } from "node:sqlite";
import { beforeEach, test } from "node:test";
import { Db, ensureSyncTracking, pendingCount, PushResult, runSync, SyncApi } from "./engine";

const schemaOf = (file: string) => readFileSync(`database/schema/${file}.ts`, "utf-8").match(/generateString\s*=\s*\/\*sql\*\/\s*`([\s\S]*?)`/)![1];

/** Bọc node:sqlite thành giao diện giống expo-sqlite (đủ cho engine). */
const makeDb = (): Db & { raw: DatabaseSync } => {
  const raw = new DatabaseSync(":memory:");
  for (const f of ["userSenseProgress", "reviewLog", "dayLearnLog", "learnSession", "userNote", "userSetting", "systemConfig", "syncQueue"]) raw.exec(schemaOf(f));
  let depth = 0;
  return {
    raw,
    getAllAsync: async (sql, params = []) => raw.prepare(sql).all(...params) as any,
    getFirstAsync: async (sql, params = []) => (raw.prepare(sql).get(...params) as any) ?? null,
    runAsync: async (sql, params = []) => raw.prepare(sql).run(...params),
    withTransactionAsync: async (fn) => {
      if (depth++ === 0) raw.exec("BEGIN");
      try {
        await fn();
        if (depth === 1) raw.exec("COMMIT");
      } catch (e) {
        if (depth === 1) raw.exec("ROLLBACK");
        throw e;
      } finally {
        depth--;
      }
    },
  };
};

type Pages = Record<string, { items: any[]; has_more?: boolean; cursor?: string }[]>;

const makeApi = (pages: Pages = {}, opts: { rejectIds?: string[]; failPush?: boolean } = {}) => {
  const pushes: Record<string, any[]>[] = [];
  const pulls: any[] = [];
  const served: Record<string, number> = {};
  const api: SyncApi = {
    async push(changes) {
      if (opts.failPush) throw new Error("offline");
      pushes.push(changes);
      const results: Record<string, PushResult> = {};
      for (const [table, rows] of Object.entries(changes)) {
        const rejected = rows.filter((r) => opts.rejectIds?.includes(r.id)).map((r) => ({ id: r.id, reason: "invalid:test" }));
        results[table] = { accepted: rows.length - rejected.length, skipped: 0, rejected };
      }
      return { results };
    },
    async pull(params) {
      pulls.push(params);
      const tables: Record<string, any> = {};
      for (const t of params.tables) {
        const i = served[t] ?? 0;
        const page = pages[t]?.[i];
        served[t] = i + 1;
        tables[t] = page ? { items: page.items, has_more: !!page.has_more, cursor: page.cursor ?? `c${i}` } : { items: [], has_more: false, cursor: params.cursors[t] ?? null };
      }
      return { tables };
    },
  };
  return { api, pushes, pulls };
};

const U1 = "01a00000-0000-7000-8000-000000000001";
const U2 = "01a00000-0000-7000-8000-000000000002";
const S1 = "01a00000-0000-7000-8000-0000000000a1";

let db: ReturnType<typeof makeDb>;
beforeEach(async () => {
  db = makeDb();
  await ensureSyncTracking(db);
});

const addProgress = (id: string, sense: string, extra = "") =>
  db.runAsync(`INSERT INTO user_sense_progress (id, original_sense_id, level, state, repetitions, last_reviewed_at, next_review_at${extra ? ", " + extra.split("=")[0] : ""}) VALUES (?, ?, 2, 2, 1, '2026-11-05 08:00:00', '2026-11-12 08:00:00'${extra ? ", " + extra.split("=")[1] : ""})`, [id, sense]);

test("thay đổi local vào hàng đợi, ghi lại thì chỉ giữ 1 mục / dòng", async () => {
  await addProgress(U1, S1);
  await db.runAsync(`UPDATE user_sense_progress SET level = 3 WHERE id = ?`, [U1]);
  await db.runAsync(`UPDATE user_sense_progress SET level = 4 WHERE id = ?`, [U1]);
  assert.equal(await pendingCount(db), 1);
  await db.runAsync(`INSERT INTO user_settings (key, value) VALUES ('cluster_size', '8') ON CONFLICT(key) DO UPDATE SET value = excluded.value`);
  assert.equal(await pendingCount(db), 2);
});

test("lần đầu đưa dữ liệu có sẵn vào hàng đợi (trừ cài đặt), chỉ 1 lần", async () => {
  const fresh = makeDb();
  fresh.raw.exec(`INSERT INTO user_sense_progress (id, original_sense_id, state) VALUES ('${U1}', '${S1}', 2)`);
  fresh.raw.exec(`INSERT INTO user_settings (key, value) VALUES ('daily_goal', '20')`);
  await ensureSyncTracking(fresh);
  assert.equal(await pendingCount(fresh), 1); // chỉ progress, không có cài đặt mặc định
  await fresh.runAsync(`DELETE FROM sync_queue`);
  await ensureSyncTracking(fresh);
  assert.equal(await pendingCount(fresh), 0);
});

test("push: gửi đúng dạng, xoá hàng đợi, dòng bị từ chối cũng bỏ khỏi hàng đợi và được báo", async () => {
  await addProgress(U1, S1);
  await db.runAsync(`INSERT INTO learn_session (id, type, status, methods, senses, sense_count) VALUES (?, 'learn', 'completed', '["copy"]', '["${S1}"]', 1)`, [U2]);
  await db.runAsync(`INSERT INTO user_settings (key, value) VALUES ('swipe_direction', '"right_remember"') ON CONFLICT(key) DO UPDATE SET value = excluded.value`);
  const { api, pushes } = makeApi({}, { rejectIds: [U2] });
  const report = await runSync(db, api);
  const sent = pushes[0];
  assert.equal(sent.user_sense_progress[0].original_sense_id, S1);
  assert.deepEqual(sent.learn_session[0].senses, [S1]);
  assert.deepEqual(sent.learn_session[0].methods, ["copy"]);
  assert.equal("snapshot" in sent.learn_session[0], false);
  assert.equal(sent.user_settings[0].value, "right_remember");
  assert.equal(report.pushed, 2);
  assert.deepEqual(report.rejected.map((r) => r.reason), ["invalid:test"]);
  assert.equal(await pendingCount(db), 0);
});

test("lỗi mạng: hàng đợi và con trỏ giữ nguyên, lần sau gửi lại", async () => {
  await addProgress(U1, S1);
  await assert.rejects(runSync(db, makeApi({}, { failPush: true }).api), /offline/);
  assert.equal(await pendingCount(db), 1);
  const { api, pushes } = makeApi();
  await runSync(db, api);
  assert.equal(pushes.length, 1);
  assert.equal(await pendingCount(db), 0);
});

test("pull: áp dữ liệu server không tạo mục đẩy ngược, lưu con trỏ, nhiều trang", async () => {
  const item = (id: string, sense: string, reviewed: string) => ({ id, original_sense_id: sense, level: 3, state: 2, stability: 9.5, difficulty: 4, repetitions: 4, is_mastered: false, last_reviewed_at: reviewed, next_review_at: "2026-11-20T08:00:00.123456Z", updated_at: "2026-11-05T09:00:00Z" });
  const { api, pulls } = makeApi({
    user_sense_progress: [
      { items: [item(U1, S1, "2026-11-05T08:00:00Z")], has_more: true, cursor: "p1" },
      { items: [item(U2, "01a00000-0000-7000-8000-0000000000a2", "2026-11-05T08:30:00Z")], cursor: "p2" },
    ],
    user_settings: [{ items: [{ key: "cluster_size", value: 8, is_deleted: false }, { key: "gone", value: 1, is_deleted: true }] }],
  });
  const report = await runSync(db, api);
  assert.equal(report.pulled, 4);
  assert.equal(report.changed, true);
  assert.equal(await pendingCount(db), 0); // không đẩy ngược
  const rows = await db.getAllAsync<any>(`SELECT original_sense_id, level, is_mastered, last_reviewed_at, next_review_at FROM user_sense_progress ORDER BY original_sense_id`);
  assert.equal(rows.length, 2);
  assert.equal(rows[0].next_review_at, "2026-11-20 08:00:00"); // giờ ISO của server về định dạng SQLite
  assert.equal(rows[0].is_mastered, 0);
  assert.equal((await db.getFirstAsync<any>(`SELECT value FROM user_settings WHERE key = 'cluster_size'`)).value, "8");
  assert.equal(pulls.length, 2); // hết has_more thì thôi
  assert.equal(pulls[1].cursors.user_sense_progress, "p1");
  assert.equal(JSON.parse((await db.getFirstAsync<any>(`SELECT value FROM system_configs WHERE key = 'sync_cursor:me'`)).value).user_sense_progress, "p2");
  // sau khi kéo, sửa local lại vào hàng đợi bình thường (cờ đã gỡ)
  await db.runAsync(`UPDATE user_sense_progress SET level = 5 WHERE original_sense_id = ?`, [S1]);
  assert.equal(await pendingCount(db), 1);
});

test("pull: tiến độ local mới hơn bản server thì giữ local; server mới hơn thì ghi đè", async () => {
  await addProgress(U1, S1); // local last_reviewed 2026-11-05 08:00
  await db.runAsync(`DELETE FROM sync_queue`);
  const stale = { id: "x", original_sense_id: S1, level: 0, state: 1, stability: 1, difficulty: 5, repetitions: 1, last_reviewed_at: "2026-11-05T07:00:00Z", updated_at: "2026-11-05T07:00:00Z" };
  await runSync(db, makeApi({ user_sense_progress: [{ items: [stale] }] }).api);
  assert.equal((await db.getFirstAsync<any>(`SELECT level FROM user_sense_progress WHERE original_sense_id = ?`, [S1])).level, 2);
  const fresh = { ...stale, level: 6, state: 2, last_reviewed_at: "2026-11-06T07:00:00Z" };
  await runSync(db, makeApi({ user_sense_progress: [{ items: [fresh] }] }).api);
  const row = await db.getFirstAsync<any>(`SELECT id, level FROM user_sense_progress WHERE original_sense_id = ?`, [S1]);
  assert.deepEqual([row.id, row.level], [U1, 6]); // id local giữ nguyên
});

test("pull day_learn_log: ngày khiên che (is_shield) kéo về được và không bị gỡ cờ", async () => {
  await db.runAsync(`INSERT INTO day_learn_log (id, date, is_shield) VALUES (?, '2026-11-06', 1)`, [U1]);
  await db.runAsync(`DELETE FROM sync_queue`);
  await runSync(
    db,
    makeApi({
      day_learn_log: [
        {
          items: [
            { id: "s1", date: "2026-11-07", is_shield: true, updated_at: "2026-11-08T10:00:00Z" },
            { id: "s2", date: "2026-11-06", is_shield: false, updated_at: "2026-11-08T10:00:00Z" }, // server cũ chưa có cờ: không gỡ cờ ở máy
          ],
        },
      ],
    }).api,
  );
  const rows = await db.getAllAsync<any>(`SELECT date, is_shield FROM day_learn_log ORDER BY date`);
  assert.deepEqual(rows.map((r) => [r.date, r.is_shield]), [["2026-11-06", 1], ["2026-11-07", 1]]);
});

test("pull day_learn_log: bộ đếm lấy max; note và session áp được", async () => {
  await db.runAsync(`INSERT INTO day_learn_log (id, date, words_learned, xp_earned) VALUES (?, '2026-11-05', 6, 35)`, [U1]);
  await db.runAsync(`DELETE FROM sync_queue`);
  await runSync(
    db,
    makeApi({
      day_learn_log: [{ items: [{ id: "z", date: "2026-11-05", words_learned: 4, words_relearned: 9, learn_time: 100, xp_earned: 50, sessions_count: 2, updated_at: "2026-11-05T10:00:00Z" }] }],
      user_note: [{ items: [{ id: "n1", sense_id: S1, content: "mẹo nhớ", version: 2, is_deleted: false, updated_at: "2026-11-05T10:00:00Z" }] }],
      learn_session: [{ items: [{ id: U2, type: "review", status: "completed", mode: "quick", methods: ["swipe"], senses: [S1], start_at: "2026-11-05T09:00:00Z", time: 30, updated_at: "2026-11-05T09:01:00Z" }] }],
    }).api,
  );
  const day = await db.getFirstAsync<any>(`SELECT words_learned, words_relearned, xp_earned FROM day_learn_log WHERE date = '2026-11-05'`);
  assert.deepEqual([day.words_learned, day.words_relearned, day.xp_earned], [6, 9, 50]);
  assert.equal((await db.getFirstAsync<any>(`SELECT content FROM user_note WHERE sense_id = ?`, [S1])).content, "mẹo nhớ");
  assert.equal(JSON.parse((await db.getFirstAsync<any>(`SELECT methods FROM learn_session WHERE id = ?`, [U2])).methods)[0], "swipe");
  assert.equal(await pendingCount(db), 0);
});
