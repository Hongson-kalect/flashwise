import { UserSetting, UserSettingObj } from "@/interfaces/db.type";
import { SQLiteDatabase } from "expo-sqlite";

export const generateString =/*sql*/ `
CREATE TABLE IF NOT EXISTS user_setting (
    key TEXT PRIMARY KEY,   -- Vì dưới local chỉ quản lý cài đặt của CHÍNH user đang đăng nhập
    value TEXT
);
`

export const getUserSettings = async (db:SQLiteDatabase): Promise<UserSettingObj|null> => {
      const rows = await db.getAllAsync<UserSetting>(`SELECT * FROM user_setting;`);
      const settingsObj: UserSettingObj = {};
      
      rows.forEach((row) => {
        try {
          settingsObj[row.key] = JSON.parse(row.value);
        } catch {
          settingsObj[row.key] = row.value;
        }
      });
      return settingsObj;
    }

export const seedData = /*sql*/ `
INSERT OR IGNORE INTO user_setting (key, value) VALUES

('theme', '"system"'),

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