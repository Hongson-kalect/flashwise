import { Theme } from "@/interfaces/db.type";
import { SQLiteDatabase } from "expo-sqlite";

export const generateString = /*sql*/ `
CREATE TABLE IF NOT EXISTS theme (
    id TEXT PRIMARY KEY,

    name TEXT NOT NULL UNIQUE,

    color_palette TEXT NOT NULL DEFAULT '{}',

    font TEXT NOT NULL DEFAULT 'System',

    priority REAL NOT NULL DEFAULT 1.0,
    -- is_default INTEGER NOT NULL DEFAULT 0,
    -- is_active INTEGER NOT NULL DEFAULT 0,

    expired_at TEXT DEFAULT NULL,
    is_delete_on_expired INTEGER NOT NULL DEFAULT 0,

    is_deleted INTEGER NOT NULL DEFAULT 0,

    created_at TEXT NOT NULL DEFAULT (DATETIME('now')),
    updated_at TEXT NOT NULL DEFAULT (DATETIME('now'))
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_theme_single_default
ON theme(is_default)
WHERE is_default = 1 AND is_deleted = 0;

CREATE UNIQUE INDEX IF NOT EXISTS idx_theme_single_active
ON theme(is_active)
WHERE is_active = 1 AND is_deleted = 0;
`;

export const getActiveTheme = async (db: SQLiteDatabase): Promise<Theme | null> => {
    const now = new Date().toISOString();
    const row = await db.getFirstAsync<Theme>(
    `SELECT * FROM theme WHERE (expired_at IS NOT NULL OR expired_at < "${now}") AND is_deleted = 0 ORDER BY priority DESC LIMIT 1;`
    );
    if (!row) return null;

    return {
    ...row,
    color_palette: JSON.parse(row.color_palette || '{}'),
    };
}

export const seedData = /*sql*/ `
INSERT OR IGNORE INTO theme (
    id,
    name,
    color_palette,
    font,
    priority
)
VALUES (
    '018f0000-0000-7000-8000-000000000001',
    'Default Light',
    '{"primary":"#007AFF","background":"#FFFFFF","text":"#000000"}',
    'System',
    0.5
);

INSERT OR IGNORE INTO theme (
    id,
    name,
    color_palette,
    font,
    is_default,
    is_active
)
VALUES (
    '018f0000-0000-7000-8000-000000000002',
    'Default Dark',
    '{"primary":"#007AFF","background":"#121212","text":"#FFFFFF"}',
    'System',
    0,
);
`;