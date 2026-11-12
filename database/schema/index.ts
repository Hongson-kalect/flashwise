import { copyAsync, deleteAsync } from "expo-file-system";
import * as SQLite from "expo-sqlite";
import { SQLiteDatabase } from "expo-sqlite";
import { LATEST_VERSION, migrate, MigrationDb } from "../migrations";
import { generateSchema, generateSeedData } from "./ddl";
import { getSystemConfigs } from "./systemConfig";
import { getActiveTheme } from "./theme";
import { getUserProfile } from "./userProfile";
import { getUserSettings, setLearningLanguage, setSetting, setShowTranslation, setTranslateLanguage } from "./userSetting";

export { generateSchema } from "./ddl";

export const createDBService = (db: SQLiteDatabase) => ({
  getActiveTheme: () => getActiveTheme(db),
  getUserProfile: () => getUserProfile(db),
  getUserSettings: () => getUserSettings(db),
  getSystemConfigs: () => getSystemConfigs(db),
  setShowTranslation: (state: boolean) => setShowTranslation(db, state),
  setLearningLanguage: (val: string) => setLearningLanguage(db, val),
  setTranslateLanguage: (val: string) => setTranslateLanguage(db, val),
  setSetting: (key: string, val: unknown) => setSetting(db, key, val),
});

/**
 * Mở DB: DB mới thì tạo schema + seed; DB cũ thì nâng version bằng migration (database/migrations), giữ nguyên dữ liệu học.
 * Chép file DB ra `.bak` trước khi nâng (chỉ giữ 1 bản); migration lỗi thì ném lỗi (app báo lỗi, không chạy tiếp trên schema thiếu cột).
 */
export const initDatabase = async (db: SQLiteDatabase) => {
  const row = await db.getFirstAsync<{ user_version: number }>("PRAGMA user_version");
  if (row && row.user_version !== 0 && row.user_version !== LATEST_VERSION) await backupBeforeMigrate(db);
  const result = await migrate(db as unknown as MigrationDb, async () => {
    await clearDatabase(db);
    await db.execAsync(generateSchema);
    await db.execAsync(generateSeedData);
  });
  if (!result.fresh && result.from !== result.to) console.log(`[DB] migration ${result.from} -> ${result.to}`);
};

const backupBeforeMigrate = async (db: SQLiteDatabase) => {
  try {
    await db.execAsync("PRAGMA wal_checkpoint(TRUNCATE)");
    const path = (db as any).databasePath as string | undefined;
    if (!path) return;
    const uri = path.startsWith("file://") ? path : `file://${path}`;
    await deleteAsync(`${uri}.bak`, { idempotent: true });
    await copyAsync({ from: uri, to: `${uri}.bak` });
  } catch (e) {
    console.warn("[DB] không sao lưu được trước khi migrate:", e);
  }
};

export const clearDatabase = async (db: SQLite.SQLiteDatabase) => {
  // 1. Tắt khóa ngoại tạm thời để xóa cho dễ
  await db.execAsync("PRAGMA foreign_keys = OFF;");

  // 2. Lấy danh sách tất cả các bảng hiện có (trừ các bảng hệ thống của SQLite)
  const tables = await db.getAllAsync<{ name: string }>(
    "SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%';",
  );

  // 3. Xóa từng bảng
  for (const table of tables) {
    await db.execAsync(`DROP TABLE IF EXISTS ${table.name};`);
  }

  // 4. Reset version về 0 để hàm migrateDbIfNeeded chạy lại từ đầu
  await db.execAsync(`PRAGMA user_version = 0;`);

  console.log("Database cleared successfully!");
};
