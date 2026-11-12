import assert from "node:assert/strict";
import { DatabaseSync } from "node:sqlite";
import { test } from "node:test";
import { generateSchema, generateSeedData } from "../schema/ddl";
import { BASELINE_V1_SCHEMA } from "./baselineV1";
import { LATEST_VERSION, LEGACY_HASH_THRESHOLD, migrate, MigrationDb, MIGRATIONS } from "./index";

const wrap = (raw: DatabaseSync): MigrationDb => {
  let depth = 0;
  return {
    execAsync: async (sql) => raw.exec(sql),
    runAsync: async (sql, params = []) => raw.prepare(sql).run(...params),
    getFirstAsync: async (sql, params = []) => (raw.prepare(sql).get(...params) as any) ?? null,
    getAllAsync: async (sql, params = []) => raw.prepare(sql).all(...params) as any,
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

const version = (raw: DatabaseSync) => (raw.prepare("PRAGMA user_version").get() as any).user_version as number;

/** Mô tả cấu trúc: bảng -> cột (tên, kiểu, notnull, mặc định, khoá) + index. Dùng để so DB migrate với DB mới tạo. */
const shape = (raw: DatabaseSync) => {
  const out: Record<string, unknown> = {};
  const tables = raw.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%' ORDER BY name").all() as { name: string }[];
  for (const { name } of tables) {
    const cols = (raw.prepare(`PRAGMA table_info(${name})`).all() as any[]).map((c) => [c.name, c.type, c.notnull, c.dflt_value, c.pk]).sort((a, b) => String(a[0]).localeCompare(String(b[0])));
    const idx = (raw.prepare(`PRAGMA index_list(${name})`).all() as any[]).map((i) => i.name).filter((n: string) => !n.startsWith("sqlite_autoindex")).sort();
    out[name] = { cols, idx };
  }
  return out;
};

const freshDb = () => {
  const raw = new DatabaseSync(":memory:");
  raw.exec(generateSchema);
  return raw;
};

test("DB mới: tạo schema + seed và đặt version mới nhất", async () => {
  const raw = new DatabaseSync(":memory:");
  const db = wrap(raw);
  const r = await migrate(db, async () => {
    raw.exec(generateSchema);
    raw.exec(generateSeedData);
  });
  assert.equal(r.fresh, true);
  assert.equal(version(raw), LATEST_VERSION);
  assert.ok((raw.prepare("SELECT COUNT(*) n FROM user_settings").get() as any).n > 0);
});

test("DB bản cũ (version là mã băm): migrate lên mới nhất, cấu trúc giống hệt DB mới tạo", async () => {
  const raw = new DatabaseSync(":memory:");
  raw.exec(BASELINE_V1_SCHEMA);
  raw.exec("PRAGMA user_version = 1234567890");
  assert.ok(1234567890 >= LEGACY_HASH_THRESHOLD);
  const r = await migrate(wrap(raw), async () => assert.fail("không được tạo lại DB cũ"));
  assert.equal(r.fresh, false);
  assert.equal(r.from, 1);
  assert.equal(version(raw), LATEST_VERSION);
  assert.deepEqual(shape(raw), shape(freshDb()));
});

test("migration giữ nguyên dữ liệu người dùng", async () => {
  const raw = new DatabaseSync(":memory:");
  raw.exec(BASELINE_V1_SCHEMA);
  raw.exec("PRAGMA user_version = 99999999");
  raw.exec(`INSERT INTO day_learn_log (id, date, words_learned, xp_earned) VALUES ('d1', '2026-11-10', 7, 70)`);
  raw.exec(`INSERT INTO user_settings (key, value) VALUES ('daily_goal', '30')`);
  raw.exec(`INSERT INTO sync_queue (table_name, record_id, action) VALUES ('day_learn_log', 'd1', 'UPSERT')`);
  await migrate(wrap(raw), async () => assert.fail("không tạo lại"));
  const row = raw.prepare("SELECT words_learned, xp_earned, is_shield FROM day_learn_log WHERE id = 'd1'").get() as any;
  assert.deepEqual({ ...row }, { words_learned: 7, xp_earned: 70, is_shield: 0 });
  assert.equal((raw.prepare("SELECT value FROM user_settings WHERE key = 'daily_goal'").get() as any).value, "30");
  assert.equal((raw.prepare("SELECT COUNT(*) n FROM sync_queue").get() as any).n, 1);
});

test("chạy lại migrate trên DB đã mới nhất: không làm gì", async () => {
  const raw = new DatabaseSync(":memory:");
  raw.exec(BASELINE_V1_SCHEMA);
  raw.exec("PRAGMA user_version = 99999999");
  await migrate(wrap(raw), async () => {});
  const r = await migrate(wrap(raw), async () => assert.fail("không tạo lại"));
  assert.equal(r.from, LATEST_VERSION);
  assert.equal(version(raw), LATEST_VERSION);
});

test("migration lỗi giữa chừng: giữ nguyên version và dữ liệu cũ", async () => {
  const raw = new DatabaseSync(":memory:");
  raw.exec(BASELINE_V1_SCHEMA);
  raw.exec("PRAGMA user_version = 1");
  raw.exec(`INSERT INTO day_learn_log (id, date) VALUES ('d1', '2026-11-10')`);
  const original = MIGRATIONS[2];
  MIGRATIONS[2] = async (db) => {
    await original(db);
    throw new Error("hỏng giữa chừng");
  };
  try {
    await assert.rejects(migrate(wrap(raw), async () => {}), /hỏng giữa chừng/);
  } finally {
    MIGRATIONS[2] = original;
  }
  assert.equal(version(raw), 1);
  const cols = (raw.prepare("PRAGMA table_info(day_learn_log)").all() as any[]).map((c) => c.name);
  assert.ok(!cols.includes("is_shield"), "ALTER phải được hoàn tác");
  assert.equal((raw.prepare("SELECT COUNT(*) n FROM day_learn_log").get() as any).n, 1);
});

test("DB mới hơn app thì từ chối (không hạ cấp)", async () => {
  const raw = new DatabaseSync(":memory:");
  raw.exec(`PRAGMA user_version = ${LATEST_VERSION + 1}`);
  await assert.rejects(migrate(wrap(raw), async () => {}), /mới hơn app/);
});

test("mỗi version từ 2 tới mới nhất đều có migration", () => {
  for (let v = 2; v <= LATEST_VERSION; v++) assert.equal(typeof MIGRATIONS[v], "function", `thiếu migration ${v}`);
});
