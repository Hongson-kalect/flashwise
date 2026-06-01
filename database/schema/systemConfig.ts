import {
  SystemConfig,
  SystemConfigObj
} from "@/interfaces/db.type";
import { SQLiteDatabase } from "expo-sqlite";

export const generateString = /*sql*/ `
    CREATE TABLE IF NOT EXISTS system_configs (
    key TEXT PRIMARY KEY,          -- Ví dụ: 'theme', 'srs_auto_play_audio', 'daily_goal'
    value TEXT                     -- Lưu chuỗi thuần hoặc chuỗi JSON đã stringify
);`;

export const getSystemConfigs = async (
  db: SQLiteDatabase,
): Promise<SystemConfigObj | null> => {
  const rows = await db.getAllAsync<SystemConfig>(
    `SELECT * FROM system_configs;`,
  );
  const settingsObj: SystemConfigObj = {};

  rows.forEach((row) => {
    try {
      settingsObj[row.key] = JSON.parse(row.value);
    } catch {
      settingsObj[row.key] = row.value;
    }
  });
  return settingsObj;
};

export const seedData = /*sql*/ `
INSERT OR IGNORE INTO system_configs (key, value) VALUES

('db_version', '1'),
('app_version', '1'),
('min_version', '1'), -- version tối thiểu để chạy app, bắt buộc cập nhật

('schema_version', '1'),

('app_initialized', 'true'),

('last_sync', 'null'),

('last_sync_success', 'null'),

('sync_in_progress', 'false'),

('sync_cursor', 'null'),

('device_registered', 'false'),

('seed_version', '1'),

('first_launch_completed', 'false');
`;
