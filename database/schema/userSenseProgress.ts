
export const generateString =/*sql*/ `
CREATE TABLE IF NOT EXISTS user_sense_progress (
    id TEXT PRIMARY KEY,                            -- UUIDv7 định danh tiến trình
    original_sense_id TEXT NOT NULL,                -- ID tĩnh của nghĩa từ vựng
    
    level INTEGER DEFAULT 1,                        -- 1: New, 2: Learning, 3: Review, 4: Mastered
    max_level INTEGER DEFAULT 1,

    -- Bộ đếm học tập
    streak_correct INTEGER DEFAULT 0,
    forget_count INTEGER DEFAULT 0,
    remember_count INTEGER DEFAULT 0,
    repetitions INTEGER DEFAULT 0,

    -- Chỉ số thuật toán FSRS
    difficulty REAL DEFAULT 2.5,
    stable INTEGER DEFAULT 0,
    failed_at INTEGER,

    -- Cờ lọc trạng thái nhanh
    is_mastered INTEGER DEFAULT 0,
    is_hidden INTEGER DEFAULT 0,
    is_avoid INTEGER DEFAULT 0,

    -- Thời gian định dạng ISO8601 String ('YYYY-MM-DD HH:MM:SS')
    last_seen_at TEXT,
    last_reviewed_at TEXT,
    next_review_at TEXT,

    created_at TEXT DEFAULT (DATETIME('now')),
    updated_at TEXT DEFAULT (DATETIME('now')),

    CONSTRAINT unique_user_sense_target UNIQUE (original_sense_id)
);

-- INDEX SIÊU TỐC: Quét từ vựng đến hạn ôn tập hàng ngày trên Mobile
-- Lọc bỏ toàn bộ các từ đã mastered, hidden, avoid ngay từ tầng cấu trúc index vật lý
CREATE INDEX IF NOT EXISTS idx_srs_mobile_queue
ON user_sense_progress (next_review_at)
WHERE is_mastered = 0 AND is_hidden = 0 AND is_avoid = 0;
`;
