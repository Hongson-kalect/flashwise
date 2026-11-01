export const generateString = /*sql*/ `
CREATE TABLE IF NOT EXISTS review_log (
    id TEXT PRIMARY KEY,                            -- UUIDv7, chỉ thêm, không sửa (tên cột giống bảng review_log phía server)
    original_sense_id TEXT NOT NULL,                -- Nghĩa gốc (khoá tiến độ)
    sense_id TEXT,                                  -- Bản nghĩa đang học lúc chấm (có thể là bản riêng)
    session_id TEXT,                                -- learn_session chứa lần chấm này

    rating INTEGER NOT NULL,                        -- 1: Again, 2: Hard, 3: Good, 4: Easy
    mode TEXT DEFAULT '',                           -- <kiểu phiên>:<phương pháp>, vd 'learn:cloze', 'review:swipe', 'voice:speak'
    is_fsrs INTEGER DEFAULT 1,                      -- 1: lần chấm đưa vào FSRS (1 dòng / thẻ / phiên); 0: bước trong phiên / thẻ quay lại (chỉ thống kê)
    level INTEGER DEFAULT 0,                        -- Cấp thẻ lúc chấm
    hint_count INTEGER DEFAULT 0,                   -- Số gợi ý đã dùng
    attempts INTEGER DEFAULT 1,                     -- Số lần trả lời tới khi xong bước
    duration_ms INTEGER DEFAULT 0,                  -- Thời gian suy nghĩ trước khi trả lời

    -- Trạng thái FSRS trước khi chấm
    state INTEGER DEFAULT 0,
    elapsed_days REAL DEFAULT 0,                    -- Số ngày kể từ lần ôn trước
    scheduled_days REAL DEFAULT 0,                  -- Số ngày đã hẹn ở lần trước
    stability REAL DEFAULT 0,
    difficulty REAL DEFAULT 0,

    reviewed_at TEXT NOT NULL DEFAULT (DATETIME('now')),
    created_at TEXT DEFAULT (DATETIME('now'))
);

-- Lịch sử chấm của 1 nghĩa (thống kê, tính lại tiến độ)
CREATE INDEX IF NOT EXISTS idx_review_log_sense
ON review_log (original_sense_id, reviewed_at);
`;
