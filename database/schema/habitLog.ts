/**
 * Nhật ký streak / khiên / habit (habit/engine.ts). Chỉ ở máy để vẽ lịch sử; trạng thái hiện tại nằm ở user_settings.habit_state
 * (có đồng bộ) nên cài lại máy vẫn lấy lại được streak, khiên, habit. Mỗi dòng là một lần thay đổi, `*_snap` là giá trị sau thay đổi.
 */
export const generateString = /*sql*/ `
CREATE TABLE IF NOT EXISTS habit_log (
    id TEXT PRIMARY KEY,                 -- UUIDv7
    log_date TEXT NOT NULL,              -- Ngày học 'YYYY-MM-DD'
    type TEXT NOT NULL,                  -- 'active' (có học) | 'shield' (khiên che ngày nghỉ) | 'lapse' (thiếu khiên, mất streak)
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
`;
