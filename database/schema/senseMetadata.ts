
export const generateString =/*sql*/ `
CREATE TABLE IF NOT EXISTS sense_metadata (
    id TEXT PRIMARY KEY,                            -- UUIDv7 đồng bộ từ Server
    image_link TEXT,
    advanced TEXT DEFAULT '{}',                     -- Lưu chuỗi JSON stringify
    tags TEXT DEFAULT '[]',                         -- Lưu chuỗi mảng JSON stringify (Ví dụ: '["TOEIC", "Verb"]')
    image_keywords TEXT DEFAULT '[]',               -- Lưu chuỗi mảng JSON stringify
    image_metadata TEXT DEFAULT '{}',               -- Lưu chuỗi JSON stringify
    is_active INTEGER DEFAULT 1,
    created_at TEXT DEFAULT (DATETIME('now')),
    updated_at TEXT DEFAULT (DATETIME('now'))
);

-- Index đặc biệt: Trích xuất và lập chỉ mục cho các thẻ tag bên trong chuỗi JSON của SQLite
-- Giúp tăng tốc độ tối đa khi Sơn chạy lệnh kiểu: WHERE json_each.value = 'TOEIC'
CREATE INDEX IF NOT EXISTS idx_sense_metadata_tags ON sense_metadata (json_extract(tags, '$'));
CREATE INDEX IF NOT EXISTS idx_sense_metadata_created ON sense_metadata (created_at DESC);
`