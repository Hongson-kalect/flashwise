export const generateString = /*sql*/`
    CREATE TABLE IF NOT EXISTS daily_study_cache (
    date TEXT PRIMARY KEY,          -- Định dạng 'YYYY-MM-DD' (Ví dụ: '2026-05-28')
    words_reviewed_count INTEGER DEFAULT 0, -- Số lượt quẹt thẻ ôn tập trong ngày
    words_learned_count INTEGER DEFAULT 0,  -- Số từ mới tinh bắt đầu học trong ngày
    minutes_spent INTEGER DEFAULT 0,        -- Số phút học tích lũy trong ngày
    forget_count INTEGER DEFAULT 0          -- Số lần bấm "Quên" (Total-forget) trong ngày
);
`