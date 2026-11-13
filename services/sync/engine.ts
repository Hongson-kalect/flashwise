/**
 * Đồng bộ local-first SQLite <-> server (flashwise_api/tracking/sync.py), thuần (không đụng React / axios): nhận `db` và `api` vào.
 *
 * - Theo dõi thay đổi: trigger SQLite ghi vào `sync_queue` (mỗi dòng 1 mục, ghi lại thì thay mục cũ). Việc áp dữ liệu kéo về
 *   chạy trong giao dịch có cờ `sync_applying` nên trigger bỏ qua, không đẩy ngược lại những gì vừa kéo.
 * - Push: đọc hàng đợi từng bảng (tối đa 500 dòng / bảng / lần), gửi, xoá mục đã gửi (kể cả dòng server từ chối: lỗi vĩnh viễn,
 *   chỉ ghi nhận). Lỗi mạng / 5xx thì giữ nguyên hàng đợi. Server gộp idempotent nên gửi lại an toàn.
 * - Pull: luôn push trước rồi mới pull (dữ liệu local chưa gửi không bị bản server cũ đè). Con trỏ từng bảng lưu ở
 *   `system_configs`. Tiến độ: bản có `last_reviewed_at` mới hơn thắng; day_learn_log lấy max từng bộ đếm.
 */

export interface Db {
  getAllAsync<T = any>(sql: string, params?: any[]): Promise<T[]>;
  getFirstAsync<T = any>(sql: string, params?: any[]): Promise<T | null>;
  runAsync(sql: string, params?: any[]): Promise<unknown>;
  withTransactionAsync(fn: () => Promise<void>): Promise<void>;
  /** expo-sqlite: giao dịch độc quyền trên kết nối riêng, ghi từ chỗ khác phải chờ (không chen vào lúc kéo dữ liệu). */
  withExclusiveTransactionAsync?(fn: (txn: Db) => Promise<void>): Promise<void>;
}

export interface PushResult {
  accepted: number;
  skipped: number;
  rejected: { id: string | null; reason: string }[];
}

export interface SyncApi {
  push(changes: Record<string, any[]>): Promise<{ results: Record<string, PushResult> }>;
  pull(params: { tables: string[]; cursors: Record<string, string>; limit: number }): Promise<{
    tables: Record<string, { items: any[]; has_more: boolean; cursor: string | null }>;
  }>;
}

export interface SyncReport {
  pushed: number;
  rejected: { table: string; id: string | null; reason: string }[];
  pulled: number;
  /** Có dữ liệu mới kéo về (để UI làm mới). */
  changed: boolean;
}

const MAX_BATCH = 500;
const MAX_ROUNDS = 40;

/** Bảng đẩy lên, theo thứ tự (tiến độ trước nhật ký); khoá nhận dạng dòng trong hàng đợi. */
const PUSH_TABLES: { table: string; key: "id" | "key"; events: ("INSERT" | "UPDATE")[] }[] = [
  { table: "user_sense_progress", key: "id", events: ["INSERT", "UPDATE"] },
  { table: "review_log", key: "id", events: ["INSERT"] }, // chỉ thêm
  { table: "day_learn_log", key: "id", events: ["INSERT", "UPDATE"] },
  { table: "learn_session", key: "id", events: ["INSERT", "UPDATE"] },
  { table: "user_note", key: "id", events: ["INSERT", "UPDATE"] },
  { table: "user_settings", key: "key", events: ["INSERT", "UPDATE"] },
];

/** Bảng kéo về (review_log mặc định không kéo; user_collection do services/collections lo). */
const PULL_TABLES = ["user_sense_progress", "day_learn_log", "learn_session", "user_note", "user_settings"];

const GUARD_KEY = "sync_applying";
const BOOT_KEY = "sync_bootstrapped";

export const toDbTime = (d: Date | number) => new Date(d).toISOString().replace("T", " ").slice(0, 19);
const dbTime = (value: any) => {
  if (typeof value !== "string" || !value) return null;
  const d = new Date(value.includes("T") ? value : `${value.replace(" ", "T")}Z`);
  return Number.isNaN(d.getTime()) ? null : toDbTime(d);
};

// ---------------------------------------------------------------- theo dõi thay đổi

/**
 * Tạo trigger ghi `sync_queue` (chạy mỗi lần mở app: DROP rồi tạo lại để đổi định nghĩa là áp được cho máy cũ).
 * Lần đầu còn đưa dữ liệu có sẵn vào hàng đợi (trừ cài đặt: bản mặc định không được đè cài đặt của máy khác).
 */
export const ensureSyncTracking = async (db: Db) => {
  const guard = `WHEN NOT EXISTS (SELECT 1 FROM system_configs WHERE key = '${GUARD_KEY}')`;
  // DROP rồi tạo lại mỗi lần mở app (trong 1 giao dịch): đổi định nghĩa trigger ở bản app mới thì máy cũ cũng được áp dụng
  await db.withTransactionAsync(async () => {
    for (const { table, key, events } of PUSH_TABLES) {
      for (const event of events) {
        const name = `trg_sync_${table}_${event.toLowerCase()}`;
        await db.runAsync(`DROP TRIGGER IF EXISTS ${name}`);
        // Cài đặt: ghi giờ sửa vào updated_at (không có lúc áp dữ liệu kéo về: giữ giờ của server)
        const touch = table === "user_settings" ? `UPDATE user_settings SET updated_at = DATETIME('now') WHERE key = NEW.key;` : "";
        await db.runAsync(
          `CREATE TRIGGER ${name} AFTER ${event} ON ${table} ${guard}
           BEGIN
             DELETE FROM sync_queue WHERE table_name = '${table}' AND record_id = NEW.${key};
             INSERT INTO sync_queue (table_name, record_id, action) VALUES ('${table}', NEW.${key}, 'UPSERT');
             ${touch}
           END`,
        );
      }
    }
  });
  if (await db.getFirstAsync(`SELECT 1 FROM system_configs WHERE key = ?`, [BOOT_KEY])) return;
  await db.withTransactionAsync(async () => {
    for (const { table, key } of PUSH_TABLES) {
      if (table === "user_settings") continue;
      await db.runAsync(
        `INSERT INTO sync_queue (table_name, record_id, action)
         SELECT '${table}', ${key}, 'UPSERT' FROM ${table}
         WHERE ${key} NOT IN (SELECT record_id FROM sync_queue WHERE table_name = '${table}')`,
      );
    }
    await db.runAsync(`INSERT OR REPLACE INTO system_configs (key, value) VALUES (?, '1')`, [BOOT_KEY]);
  });
};

export const pendingCount = async (db: Db) => (await db.getFirstAsync<{ n: number }>(`SELECT COUNT(*) AS n FROM sync_queue`))?.n ?? 0;

// ---------------------------------------------------------------- push

const parseJson = (value: any, fallback: any) => {
  if (typeof value !== "string") return value ?? fallback;
  try {
    return JSON.parse(value);
  } catch {
    return fallback;
  }
};

/** Dòng SQLite -> dòng gửi server (cột client-only bỏ đi, JSON dạng chuỗi parse lại). */
const toPayload = (table: string, row: any) => {
  if (table === "learn_session") {
    const { snapshot, ...rest } = row;
    return { ...rest, senses: parseJson(row.senses, []), methods: parseJson(row.methods, []) };
  }
  if (table === "user_settings") {
    // Giờ sửa thật của máy này (cột updated_at do trigger ghi); dòng cũ chưa có thì dùng giờ đẩy
    return { key: row.key, value: parseJson(row.value, row.value), updated_at: row.updated_at ? `${row.updated_at.replace(" ", "T")}Z` : new Date().toISOString() };
  }
  return row;
};

const chunkIds = <T,>(items: T[], size = 400) => Array.from({ length: Math.ceil(items.length / size) }, (_, i) => items.slice(i * size, (i + 1) * size));

export const pushChanges = async (db: Db, api: SyncApi, report: SyncReport) => {
  for (let round = 0; round < MAX_ROUNDS; round++) {
    const changes: Record<string, any[]> = {};
    const sent: Record<string, number[]> = {};
    for (const { table, key } of PUSH_TABLES) {
      const queued = await db.getAllAsync<{ id: number; record_id: string }>(
        `SELECT id, record_id FROM sync_queue WHERE table_name = ? ORDER BY id LIMIT ${MAX_BATCH}`,
        [table],
      );
      if (!queued.length) continue;
      const rows: any[] = [];
      for (const ids of chunkIds(queued.map((q) => q.record_id))) {
        rows.push(...(await db.getAllAsync(`SELECT * FROM ${table} WHERE ${key} IN (${ids.map(() => "?").join(",")})`, ids)));
      }
      if (rows.length) changes[table] = rows.map((r) => toPayload(table, r));
      sent[table] = queued.map((q) => q.id); // dòng đã bị xoá mất thì mục hàng đợi cũng bỏ
    }
    if (!Object.keys(sent).length) return;

    const res = await api.push(changes);
    for (const [table, ids] of Object.entries(sent)) {
      for (const part of chunkIds(ids)) await db.runAsync(`DELETE FROM sync_queue WHERE id IN (${part.map(() => "?").join(",")})`, part);
      const result = res.results?.[table];
      report.pushed += result?.accepted ?? 0;
      for (const r of result?.rejected ?? []) report.rejected.push({ table, id: r.id, reason: r.reason });
    }
  }
};

// ---------------------------------------------------------------- pull

const columnCache = new WeakMap<object, Map<string, string[]>>();
const tableColumns = async (db: Db, table: string) => {
  let perDb = columnCache.get(db);
  if (!perDb) columnCache.set(db, (perDb = new Map()));
  if (!perDb.has(table)) perDb.set(table, (await db.getAllAsync<{ name: string }>(`PRAGMA table_info(${table})`)).map((c) => c.name));
  return perDb.get(table)!;
};

const TIME_COLUMNS = ["failed_at", "last_seen_at", "last_reviewed_at", "next_review_at", "created_at", "updated_at", "start_at", "end_at", "reviewed_at"];

/** Dòng server -> giá trị cột SQLite: giờ về 'YYYY-MM-DD HH:MM:SS' UTC, bool về 0 / 1, mảng / object về JSON. */
const normalize = (raw: Record<string, any>, cols: string[]) => {
  const out: Record<string, any> = {};
  for (const c of cols) {
    let v = raw[c];
    if (v === undefined) continue;
    if (v !== null && TIME_COLUMNS.includes(c)) v = dbTime(v);
    else if (typeof v === "boolean") v = v ? 1 : 0;
    else if (v !== null && typeof v === "object") v = JSON.stringify(v);
    out[c] = v;
  }
  return out;
};

const upsert = async (db: Db, table: string, row: Record<string, any>, conflict: string, keep: string[] = []) => {
  const keys = Object.keys(row);
  const update = keys.filter((k) => k !== conflict && !keep.includes(k)).map((k) => `${k} = excluded.${k}`);
  await db.runAsync(
    `INSERT INTO ${table} (${keys.join(",")}) VALUES (${keys.map(() => "?").join(",")})
     ON CONFLICT(${conflict}) DO UPDATE SET ${update.join(", ") || `${conflict} = ${conflict}`}`,
    keys.map((k) => row[k]),
  );
};

const applyRows: Record<string, (db: Db, rows: any[]) => Promise<number>> = {
  async user_sense_progress(db, rows) {
    const cols = await tableColumns(db, "user_sense_progress");
    let n = 0;
    for (const raw of rows) {
      const row = normalize(raw, cols);
      if (!row.original_sense_id) continue;
      const local = await db.getFirstAsync<{ last_reviewed_at: string | null }>(`SELECT last_reviewed_at FROM user_sense_progress WHERE original_sense_id = ?`, [row.original_sense_id]);
      // Máy này đã chấm sau bản server (chưa kịp đẩy / bản echo cũ): giữ bản local
      if (local?.last_reviewed_at && row.last_reviewed_at && local.last_reviewed_at > row.last_reviewed_at) continue;
      if (local?.last_reviewed_at && !row.last_reviewed_at) continue;
      delete row.id; // khoá là original_sense_id; id local giữ nguyên nếu đã có
      await upsert(db, "user_sense_progress", { id: raw.id, ...row }, "original_sense_id", ["id", "created_at"]);
      n++;
    }
    return n;
  },
  async day_learn_log(db, rows) {
    const cols = await tableColumns(db, "day_learn_log");
    let n = 0;
    for (const raw of rows) {
      const row = normalize(raw, cols);
      if (!row.date) continue;
      const counters = ["words_learned", "words_relearned", "learn_time", "app_time", "xp_earned", "sessions_count", "is_shield"].filter((c) => c in row);
      const keys = Object.keys(row);
      // Bộ đếm chỉ tăng: 2 máy cùng ngày thì lấy giá trị lớn hơn (is_shield: 1 nếu máy nào đó đã đánh dấu khiên che)
      await db.runAsync(
        `INSERT INTO day_learn_log (${keys.join(",")}) VALUES (${keys.map(() => "?").join(",")})
         ON CONFLICT(date) DO UPDATE SET ${counters.map((c) => `${c} = MAX(${c}, excluded.${c})`).join(", ") || "date = date"}`,
        keys.map((k) => row[k]),
      );
      n++;
    }
    return n;
  },
  async learn_session(db, rows) {
    const cols = (await tableColumns(db, "learn_session")).filter((c) => c !== "snapshot");
    let n = 0;
    for (const raw of rows) {
      const row = normalize(raw, cols);
      if (!row.id) continue;
      await upsert(db, "learn_session", row, "id", ["created_at"]);
      n++;
    }
    return n;
  },
  async user_note(db, rows) {
    const cols = await tableColumns(db, "user_note");
    let n = 0;
    for (const raw of rows) {
      const row: Record<string, any> = { ...normalize(raw, cols), is_synced: 1 };
      if (!row.sense_id || row.content == null) continue;
      await upsert(db, "user_note", row, "sense_id", ["id", "created_at"]);
      n++;
    }
    return n;
  },
  async user_settings(db, rows) {
    let n = 0;
    for (const raw of rows) {
      if (typeof raw.key !== "string") continue;
      if (raw.is_deleted) await db.runAsync(`DELETE FROM user_settings WHERE key = ?`, [raw.key]);
      else await upsert(db, "user_settings", { key: raw.key, value: JSON.stringify(raw.value), updated_at: dbTime(raw.updated_at) }, "key");
      n++;
    }
    return n;
  },
};

const readCursors = async (db: Db, id: string): Promise<Record<string, string>> => {
  const row = await db.getFirstAsync<{ value: string }>(`SELECT value FROM system_configs WHERE key = ?`, [`sync_cursor:${id}`]);
  return parseJson(row?.value, {}) ?? {};
};

export const pullChanges = async (db: Db, api: SyncApi, report: SyncReport, accountId = "me") => {
  const cursors = await readCursors(db, accountId);
  const pending = new Set(PULL_TABLES);
  for (let round = 0; round < MAX_ROUNDS && pending.size; round++) {
    const res = await api.pull({ tables: [...pending], cursors: { ...cursors }, limit: MAX_BATCH });
    const apply = async (tx: Db) => {
      await tx.runAsync(`INSERT OR REPLACE INTO system_configs (key, value) VALUES (?, '1')`, [GUARD_KEY]);
      for (const [table, page] of Object.entries(res.tables ?? {})) {
        if (!applyRows[table]) continue;
        report.pulled += await applyRows[table](tx, page.items ?? []);
        if (page.cursor) cursors[table] = page.cursor;
        if (!page.has_more) pending.delete(table);
      }
      await tx.runAsync(`DELETE FROM system_configs WHERE key = ?`, [GUARD_KEY]);
      await tx.runAsync(`INSERT OR REPLACE INTO system_configs (key, value) VALUES (?, ?)`, [`sync_cursor:${accountId}`, JSON.stringify(cursors)]);
    };
    // Độc quyền (nếu có): ghi chấm thẻ / review_log từ nơi khác không lọt vào lúc cờ `sync_applying` đang tắt trigger
    if (db.withExclusiveTransactionAsync) await db.withExclusiveTransactionAsync(apply);
    else await db.withTransactionAsync(() => apply(db));
  }
  report.changed = report.changed || report.pulled > 0;
};

/** 1 lượt đồng bộ đầy đủ: push rồi pull. Ném lỗi mạng / server cho nơi gọi (hàng đợi và con trỏ vẫn nguyên, lần sau chạy tiếp). */
export const runSync = async (db: Db, api: SyncApi, accountId = "me"): Promise<SyncReport> => {
  const report: SyncReport = { pushed: 0, rejected: [], pulled: 0, changed: false };
  await pushChanges(db, api, report);
  await pullChanges(db, api, report, accountId);
  return report;
};
