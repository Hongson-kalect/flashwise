
export const generateString =/*sql*/ `
CREATE TABLE IF NOT EXISTS notification (
    id TEXT PRIMARY KEY,             -- ID UUIDv7 đồng bộ từ Server
    type TEXT NOT NULL,
    title TEXT NOT NULL,
    content TEXT,
    is_read INTEGER DEFAULT 0,       -- 0: Chưa đọc, 1: Đã đọc
    data TEXT,                       -- Dữ liệu JSON string phục vụ Deep Link
    created_at TEXT
);

CREATE INDEX IF NOT EXISTS idx_notification_user ON notification (created_at DESC);
`