/**
 * Nâng cấp DB local theo số phiên bản (PRAGMA user_version), thay cho kiểu "schema đổi thì xoá hết tạo lại".
 *
 * Quy ước:
 * - Bảng dữ liệu của người dùng (user_sense_progress, review_log, day_learn_log, learn_session, user_note, user_settings,
 *   user_profile, habit_log, sync_queue, system_configs, user_collection) KHÔNG được mất: đổi schema bằng migration (ALTER / dựng lại bảng
 *   rồi chép dữ liệu). Dựng lại bảng thì tạo lại trigger sync (ensureSyncTracking tự tạo lại khi mở app, IF NOT EXISTS).
 * - Bảng cache nội dung (ai_word, ai_sense, sense_metadata, collection, collection_items, daily_study_cache, image_library...) tải lại được từ
 *   server: migration được phép DROP rồi tạo lại (sau đó người dùng tải lại bộ từ).
 * - DB mới tạo bằng schema đầy đủ (ddl.ts) rồi đặt thẳng version mới nhất. DB cũ chạy từng bước version + 1 trong 1 giao dịch,
 *   version đổi cùng giao dịch nên lỗi giữa chừng thì giữ nguyên version cũ.
 * - Sửa schema (database/schema/*.ts) thì: thêm bước vào MIGRATIONS, tăng LATEST_VERSION, chạy
 *   `npx tsx --test database/migrations/migrations.test.ts`.
 * - Bản trước migration dùng băm schema làm user_version (số rất lớn): coi như version 1.
 */

export interface MigrationDb {
  execAsync(sql: string): Promise<unknown>;
  runAsync(sql: string, params?: any[]): Promise<unknown>;
  getFirstAsync<T = any>(sql: string, params?: any[]): Promise<T | null>;
  getAllAsync<T = any>(sql: string, params?: any[]): Promise<T[]>;
  withTransactionAsync(fn: () => Promise<void>): Promise<void>;
}

/** user_version >= số này là mã băm của bản cũ (băm 31 bit, thực tế luôn rất lớn), không phải số phiên bản. */
export const LEGACY_HASH_THRESHOLD = 1_000_000;

export const LATEST_VERSION = 3;

/** Bước nâng từ version (n - 1) lên n. */
export const MIGRATIONS: Record<number, (db: MigrationDb) => Promise<void>> = {
  // 2: streak / khiên / habit (habit/engine.ts): cờ ngày khiên che ở day_learn_log + nhật ký habit_log
  2: async (db) => {
    const cols = await db.getAllAsync<{ name: string }>(`PRAGMA table_info(day_learn_log)`);
    if (!cols.some((c) => c.name === "is_shield")) await db.execAsync(`ALTER TABLE day_learn_log ADD COLUMN is_shield INTEGER DEFAULT 0`);
    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS habit_log (
          id TEXT PRIMARY KEY,
          log_date TEXT NOT NULL,
          type TEXT NOT NULL,
          habit_delta REAL NOT NULL DEFAULT 0,
          habit_snap REAL NOT NULL DEFAULT 0,
          shield_delta INTEGER NOT NULL DEFAULT 0,
          shield_snap INTEGER NOT NULL DEFAULT 0,
          retain_delta REAL NOT NULL DEFAULT 0,
          retain_snap REAL NOT NULL DEFAULT 0,
          missed_days INTEGER NOT NULL DEFAULT 0,
          note TEXT,
          created_at TEXT DEFAULT (DATETIME('now'))
      );
      CREATE INDEX IF NOT EXISTS idx_habit_log_date ON habit_log (log_date DESC, id DESC);
    `);
  },
};

// 3: bỏ thanh retain khỏi habit (cột retain_* của habit_log không còn dùng)
MIGRATIONS[3] = async (db) => {
  const cols = (await db.getAllAsync<{ name: string }>(`PRAGMA table_info(habit_log)`)).map((c) => c.name);
  for (const c of ["retain_delta", "retain_snap"]) if (cols.includes(c)) await db.execAsync(`ALTER TABLE habit_log DROP COLUMN ${c}`);
};

export type MigrateResult = { from: number; to: number; fresh: boolean };

/** Đưa DB lên LATEST_VERSION. `createFresh` dựng DB mới hoàn toàn (xoá bảng cũ nếu có, tạo schema + seed). */
export const migrate = async (db: MigrationDb, createFresh: () => Promise<void>): Promise<MigrateResult> => {
  const row = await db.getFirstAsync<{ user_version: number }>("PRAGMA user_version");
  let version = row?.user_version ?? 0;

  if (version === 0) {
    await createFresh();
    await db.execAsync(`PRAGMA user_version = ${LATEST_VERSION}`);
    return { from: 0, to: LATEST_VERSION, fresh: true };
  }
  if (version >= LEGACY_HASH_THRESHOLD) version = 1;
  if (version > LATEST_VERSION) throw new Error(`DB version ${version} mới hơn app (${LATEST_VERSION}): hãy cập nhật app`);

  const from = version;
  for (let v = version + 1; v <= LATEST_VERSION; v++) {
    const step = MIGRATIONS[v];
    if (!step) throw new Error(`Thiếu migration lên version ${v}`);
    await db.withTransactionAsync(async () => {
      await step(db);
      await db.execAsync(`PRAGMA user_version = ${v}`);
    });
  }
  return { from, to: LATEST_VERSION, fresh: false };
};
