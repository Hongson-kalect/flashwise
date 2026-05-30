
export const generateString =/*sql*/ `
CREATE TABLE IF NOT EXISTS user_collection (
    id TEXT PRIMARY KEY,                            -- UUIDv7 đồng bộ từ Server
    collection_id TEXT NOT NULL,                    -- ID của bộ sưu tập gốc
    name TEXT,                                      -- Tên hiển thị (Nếu user đổi tên riêng, không thì dùng tên gốc)
    description TEXT,
    learned_count INTEGER DEFAULT 0,                -- Đồng bộ số từ đã thuộc để render nhanh ở màn hình chính
    sync_status INTEGER DEFAULT 1,                  -- 1: Đã khớp với server, 0: Cần sync lại tiến độ learned_count
    
    -- Các trường Base tối giản cho hệ thống Local-First
    is_deleted INTEGER DEFAULT 0,
    created_at TEXT DEFAULT (DATETIME('now')),
    updated_at TEXT DEFAULT (DATETIME('now'))
);

-- INDEX TỐI ƯU RENDERING MÀN HÌNH CHÍNH (My Collections): Bốc nhanh danh sách các bộ từ mà user đã tải về máy
CREATE INDEX IF NOT EXISTS idx_user_collection_render 
ON user_collection (is_deleted, created_at DESC);
`