
export const generateString =/*sql*/ `
CREATE TABLE IF NOT EXISTS user_interaction (
    id TEXT PRIMARY KEY,                  -- UUIDv7 tự sinh dưới client khi tương tác
    target_type TEXT NOT NULL,            -- 'collection' | 'word' | 'sense' | 'quiz' (Dễ dàng thêm mới)
    target_id TEXT NOT NULL,              -- UUIDv7 của thực thể được tương tác
    
    interaction_type TEXT NOT NULL,       -- 'like' | 'bookmark' | 'favorite' | 'share'
    status INTEGER DEFAULT 1,             -- 1 = Active (Thích), 0 = Inactive (Bỏ thích)
    
    version INTEGER DEFAULT 1,
    updated_at TEXT DEFAULT (DATETIME('now'))
);

-- Tạo chỉ mục tối ưu để Render UI cực nhanh
-- Ví dụ: Bật một Collection lên, check xem user đã LIKE nó chưa trong vòng 0ms
CREATE UNIQUE INDEX IF NOT EXISTS idx_user_interaction_unique 
ON user_interaction (target_type, target_id, interaction_type);

-- Chỉ mục phục vụ tìm nhanh danh sách đã Bookmark/Favorite để gom vào một màn hình
CREATE INDEX IF NOT EXISTS idx_user_interaction_lookup
ON user_interaction (interaction_type, status);
`