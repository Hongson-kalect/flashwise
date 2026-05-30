
export const generateString =/*sql*/ `
CREATE TABLE IF NOT EXISTS day_learn_log (
    id TEXT PRIMARY KEY,                            -- UUIDv7 gán thống nhất
    date TEXT NOT NULL DEFAULT (DATE('now')),       -- Lưu định dạng 'YYYY-MM-DD' làm khóa tĩnh theo ngày
    
    -- Các chỉ số tích lũy trong ngày
    words_learned INTEGER DEFAULT 0,
    words_relearned INTEGER DEFAULT 0,
    learn_time INTEGER DEFAULT 0,                   -- Tính bằng giây để đồng bộ đồng nhất với LearnSession
    app_time INTEGER DEFAULT 0,                     -- Tổng thời gian mở app (tính bằng giây)
    xp_earned INTEGER DEFAULT 0,
    sessions_count INTEGER DEFAULT 0,

    created_at TEXT DEFAULT (DATETIME('now')),
    updated_at TEXT DEFAULT (DATETIME('now')),

    CONSTRAINT unique_user_date UNIQUE (date)       -- Đảm bảo mỗi ngày chỉ có duy nhất 1 dòng log dưới máy máy
);

-- INDEX TỐI ƯU ĐỂ VẼ HEATMAP / DASHBOARD TRÊN ĐIỆN THOẠI
-- UI local sẽ query: Lấy log của 30 ngày gần nhất để vẽ biểu đồ
-- Câu lệnh: SELECT * FROM day_learn_log ORDER BY date DESC LIMIT 30;
CREATE INDEX IF NOT EXISTS idx_daily_log_history ON day_learn_log (date DESC);
`