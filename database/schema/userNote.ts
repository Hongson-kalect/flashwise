
export const generateString =/*sql*/ `
CREATE TABLE IF NOT EXISTS user_note (
    id TEXT PRIMARY KEY,                            -- UUIDv7 sinh từ Client
    sense_id TEXT NOT NULL,                         -- Ghi chú cho từ/nghĩa nào
    content TEXT NOT NULL,                          -- Nội dung text ghi chú
    
    version INTEGER DEFAULT 0,
    is_synced INTEGER DEFAULT 0,
    is_deleted INTEGER DEFAULT 0,                   -- 1: User xóa ghi chú (Chờ đồng bộ xóa lên Cloud)

    created_at TEXT DEFAULT (DATETIME('now')),
    updated_at TEXT DEFAULT (DATETIME('now')),

    CONSTRAINT unique_sense_note UNIQUE (sense_id)
);
CREATE INDEX IF NOT EXISTS idx_note_sync ON user_note (is_synced) WHERE is_synced = 0;
`