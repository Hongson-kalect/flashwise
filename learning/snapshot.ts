import { SQLiteDatabase } from "expo-sqlite";

/** Phiên dở quá lâu thì bỏ (thẻ đã nguội, lịch ôn đã đổi). */
export const SNAPSHOT_TTL_MS = 60 * 60 * 1000;

const keyOf = (scope: string) => `run_snapshot:${scope}`;

export interface Snapshot<T> {
  savedAt: number;
  data: T;
}

/**
 * Lưu trạng thái phiên đang chạy vào system_configs (chỉ ở máy: bảng này không có trigger sync) để học tiếp phiên dở.
 * `scope` phân biệt phiên: "learn:<userCollectionId>" hoặc "review".
 */
export const saveSnapshot = async (db: SQLiteDatabase, scope: string, data: unknown, now = Date.now()) => {
  await db.runAsync(`INSERT OR REPLACE INTO system_configs (key, value) VALUES (?, ?)`, [keyOf(scope), JSON.stringify({ savedAt: now, data })]);
};

export const clearSnapshot = async (db: SQLiteDatabase, scope: string) => {
  await db.runAsync(`DELETE FROM system_configs WHERE key = ?`, [keyOf(scope)]);
};

/** Phiên dở còn hạn (≤ 1 giờ) hoặc null; hỏng / hết hạn thì xoá luôn. */
export const loadSnapshot = async <T>(db: SQLiteDatabase, scope: string, now = Date.now()): Promise<Snapshot<T> | null> => {
  const row = await db.getFirstAsync<{ value: string }>(`SELECT value FROM system_configs WHERE key = ?`, [keyOf(scope)]);
  if (!row) return null;
  try {
    const snap = JSON.parse(row.value) as Snapshot<T>;
    if (typeof snap.savedAt === "number" && now - snap.savedAt <= SNAPSHOT_TTL_MS && snap.data) return snap;
  } catch {
    // rơi xuống xoá
  }
  await clearSnapshot(db, scope);
  return null;
};
