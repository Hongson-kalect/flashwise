
export const generateString =/*sql*/ `
CREATE TABLE IF NOT EXISTS dashboard_cache (
    id TEXT PRIMARY KEY,                            -- UUIDv7 thống nhất từ hệ thống
    language_code TEXT NOT NULL,                    -- Mã ngôn ngữ (Ví dụ: 'en', 'ja')
    summary TEXT DEFAULT '{}',                      -- Toàn bộ object {xp_total, words_learned, streak_days, chart_data}
    updated_at TEXT DEFAULT (DATETIME('now'))
);

-- INDEX TỐI ƯU TRUY VẤN LOCAL: Bốc nhanh dữ liệu dashboard dựa trên ngôn ngữ đang chọn học trên UI
CREATE UNIQUE INDEX IF NOT EXISTS idx_dashboard_local_lookup ON dashboard_cache (language_code);
`