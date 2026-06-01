
export const generateString =/*sql*/ `
CREATE TABLE IF NOT EXISTS user_collection (
    id TEXT PRIMARY KEY,                            -- UUIDv7 định danh cho bản ghi tiến độ này
    collection_id TEXT NOT NULL,                    -- Liên kết với collection(id) local hoặc hệ thống
    
    -- Lưu đệm (Denormalization) thông tin hiển thị để render UI Library nhanh, không cần JOIN sang bảng Collection
    name TEXT,                                      
    description TEXT,                               
    
    learned_count INTEGER DEFAULT 0,                -- Số lượng từ/sense đã học thuộc (phục vụ Progress Bar)
    version INTEGER DEFAULT 0,                      -- Phiên bản tiến độ để so khớp khi đồng bộ Cloud
    
    -- Trạng thái Local-First (Ép cứng thành INTEGER)
    is_active INTEGER DEFAULT 1,                    -- 1: Đang học | 0: Đã lưu trữ (Archive) không hiện ở màn hình chính
    is_deleted INTEGER DEFAULT 0,                   -- 1: Đã hủy theo dõi/Xóa bộ từ khỏi thư viện cá nhân (Chờ sync xóa)

    -- Các trường quản lý thời gian
    created_at TEXT DEFAULT (DATETIME('now')),
    updated_at TEXT DEFAULT (DATETIME('now')),

    -- RÀNG BUỘC UNIQUE: Một bộ từ chỉ xuất hiện tối đa 1 lần trong thư viện của user này
    CONSTRAINT unique_user_collection UNIQUE (collection_id)
);

-- INDEX 1: TỐI ƯU TUYỆT ĐỐI CHO MÀN HÌNH "THƯ VIỆN CỦA TÔI" (MY LIBRARY)
-- Câu lệnh CORE trên UI: SELECT * FROM user_collection WHERE is_active = 1 AND is_deleted = 0 ORDER BY created_at DESC;
-- Index này giúp render danh sách bộ từ đang học của user ngay lập tức mà không gặp độ trễ.
CREATE INDEX IF NOT EXISTS idx_user_coll_local_render
ON user_collection (is_active, created_at DESC)
WHERE is_deleted = 0;
`