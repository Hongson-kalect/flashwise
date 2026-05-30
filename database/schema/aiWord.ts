
export const generateString =/*sql*/ `
CREATE TABLE IF NOT EXISTS ai_word (
    id TEXT PRIMARY KEY,                       -- UUIDv7 gán từ client hoặc server
    value TEXT NOT NULL,
    language_code TEXT NOT NULL DEFAULT 'en',
    status TEXT NOT NULL DEFAULT 'PENDING',
    description TEXT,
    is_active INTEGER DEFAULT 1,               -- SQLite không có Boolean, dùng 0/1
    created_at TEXT DEFAULT (DATETIME('now')),
    updated_at TEXT DEFAULT (DATETIME('now'))
);

-- Index tổ hợp tăng tốc độ tìm kiếm từ vựng theo ngôn ngữ (Hỗ trợ tìm kiếm nhanh/Autocomplete trên UI)
CREATE INDEX IF NOT EXISTS idx_ai_word_lang_value ON ai_word (language_code, value);
`