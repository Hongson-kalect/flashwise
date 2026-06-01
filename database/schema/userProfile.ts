import { UserProfile } from "@/interfaces/db.type";
import { uuidv7 } from "@/utils/uuidv7";
import { SQLiteDatabase } from "expo-sqlite";

export const generateString = /*sql*/ `
CREATE TABLE IF NOT EXISTS user_profile (
    -- Identity
    id TEXT PRIMARY KEY, -- UUIDv7

    -- Basic profile
    full_name TEXT NOT NULL DEFAULT '',
    display_name TEXT NOT NULL DEFAULT '',
    avatar_url TEXT NOT NULL DEFAULT '',

    dob TEXT DEFAULT NULL,               -- YYYY-MM-DD
    country_code TEXT NOT NULL DEFAULT '',

    -- Language settings
    native_language TEXT NOT NULL DEFAULT '',
    learning_languages TEXT NOT NULL DEFAULT '',

    -- Gamification
    level INTEGER NOT NULL DEFAULT 1,
    total_xp INTEGER NOT NULL DEFAULT 0,

    current_streak INTEGER NOT NULL DEFAULT 0,
    max_streak INTEGER NOT NULL DEFAULT 0,

    total_words_learned INTEGER NOT NULL DEFAULT 0,
    total_sessions INTEGER NOT NULL DEFAULT 0,
    total_app_time INTEGER NOT NULL DEFAULT 0,

    -- Subscription
    tier TEXT NOT NULL DEFAULT 'guest'
        CHECK (
            tier IN (
                'guest',
                'free',
                'premium',
                'lifetime'
            )
        ),

    tier_expired_at TEXT DEFAULT NULL,

    -- Account provider
    provider TEXT NOT NULL DEFAULT ''
        CHECK (
            provider IN (
                '',
                'google',
                'facebook',
                'apple',
                'x'
            )
        ),

    identifier TEXT NOT NULL DEFAULT '',

    -- Sync
    time_zone TEXT NOT NULL DEFAULT '',
    last_sync TEXT DEFAULT NULL,
    is_get_server_theme INTEGER NOT NULL DEFAULT 1, -- 0: Not get, 1: Get - Lấy theme theo mùa server bắn cho

    created_at TEXT NOT NULL DEFAULT (DATETIME('now')),
    updated_at TEXT NOT NULL DEFAULT (DATETIME('now'))
);
`;

export const getUserProfile = async (
  db: SQLiteDatabase,
): Promise<UserProfile | null> => {
  // Vì local thường chỉ có 1 user active, ta lấy bản ghi mới nhất hoặc duy nhất
  const row = await db.getFirstAsync<UserProfile>(
    `SELECT * FROM user_profile ORDER BY updated_at DESC LIMIT 1;`,
  );
  if (!row) return null;

  return {
    ...row,
    // learning_languages: JSON.parse(row.learning_languages || '[]'),
    // learning_languages: JSON.parse(row.learning_languages || '[]'),
  };
};

const id = uuidv7();
export const seedData = /*sql*/ `
INSERT OR IGNORE INTO user_profile (
    id,
    native_language,
    learning_languages,
    tier,
    level,
    total_xp,
    current_streak,
    max_streak,
    total_words_learned,
    total_sessions,
    total_app_time
)

VALUES (
    '${id}',
    'vi',
    'en',
    'guest',
    1,
    0,
    0,
    0,
    0,
    0,
    0
);
`;
