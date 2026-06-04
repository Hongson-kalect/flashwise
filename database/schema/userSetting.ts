import { UserSetting, UserSettingObj } from "@/interfaces/db.type";
import { SQLiteDatabase } from "expo-sqlite";
import { createDBService } from ".";

export const generateString = /*sql*/ `
CREATE TABLE IF NOT EXISTS user_settings (
    key TEXT PRIMARY KEY,   -- Vì dưới local chỉ quản lý cài đặt của CHÍNH user đang đăng nhập
    value TEXT
);
`;

export const getUserSettings = async (
  db: SQLiteDatabase,
): Promise<UserSettingObj | null> => {
  const rows = await db.getAllAsync<UserSetting>(
    `SELECT * FROM user_settings;`,
  );
  const settingsObj: UserSettingObj = {};

  rows.forEach((row) => {
    try {
      settingsObj[row.key] = JSON.parse(row.value);
    } catch {
      settingsObj[row.key] = row.value;
    }
  });
  return settingsObj;
};

export const setShowTranslation = async (db: SQLiteDatabase, value: boolean) => {
  await db.runAsync(`UPDATE user_settings SET value = ? WHERE key = ?;`, [
    JSON.stringify(value),
    "show_translation",
  ]);
};

export const setLearningLanguage = async (db: SQLiteDatabase, value: string) => {
  await db.runAsync(`UPDATE user_settings SET value = ? WHERE key = ?;`, [
    JSON.stringify(value),
    "learning_language",
  ]);
};

export const setTranslateLanguage = async (db: SQLiteDatabase, value: string) => {
  await db.runAsync(`UPDATE user_settings SET value = ? WHERE key = ?;`, [
    JSON.stringify(value),
    "translate_language",
  ]);
};

export const seedData = /*sql*/ `
INSERT OR IGNORE INTO user_settings (key, value) VALUES

('theme', '"system"'),

('translate_language', '"vi"'),

('learning_language', '"en"'),

('daily_goal', '20'),

('review_limit', '100'),

('auto_play_audio', 'true'),

('sound_enabled', 'true'),

('notification_enabled', 'true'),

('show_phonetic', 'true'),

('show_translation', 'true'),

('study_reminder_hour', '20'),

('new_word_first', 'true'),

('offline_mode', 'true');
`;
