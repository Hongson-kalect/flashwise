import { SQLiteDatabase } from "expo-sqlite";
import { uuidv7 } from "@/utils/uuidv7";

/** Ghi chú cá nhân của 1 nghĩa (mỗi nghĩa 1 ghi chú, chỉ nằm trên máy, chờ sync qua is_synced). */
export const getNote = async (db: SQLiteDatabase, senseId: string) => {
  const row = await db.getFirstAsync<{ content: string }>(
    `SELECT content FROM user_note WHERE sense_id = ? AND is_deleted = 0`,
    [senseId],
  );
  return row?.content ?? "";
};

/** Lưu ghi chú; nội dung rỗng = xoá. Xoá mềm để lần sync sau báo lên server. */
export const saveNote = async (db: SQLiteDatabase, senseId: string, content: string) => {
  const text = content.trim();
  if (!text) {
    await db.runAsync(
      `UPDATE user_note SET is_deleted = 1, is_synced = 0, version = version + 1, updated_at = DATETIME('now') WHERE sense_id = ?`,
      [senseId],
    );
    return;
  }
  await db.runAsync(
    `INSERT INTO user_note (id, sense_id, content) VALUES (?, ?, ?)
     ON CONFLICT(sense_id) DO UPDATE SET content = excluded.content, is_deleted = 0, is_synced = 0,
       version = version + 1, updated_at = DATETIME('now')`,
    [uuidv7(), senseId, text],
  );
};
