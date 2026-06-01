
export const generateString =/*sql*/ `
CREATE TABLE IF NOT EXISTS collection_items (
    id TEXT PRIMARY KEY,                            -- UUIDv7 gán nhất quán từ Client/Server
    value TEXT,                                     -- Từ/Cụm từ hiển thị nhanh (Tránh phải JOIN sang bảng Sense liên tục chỉ để lấy text)
    collection_id TEXT,                             -- Khóa ngoại trỏ đến collection(id)
    original_id TEXT,                               -- Khóa UUIDv7 của AISense gốc từ hệ thống (không cho sửa)
    sense_id TEXT,                                  -- Khóa ngoại trỏ đến ai_sense(id) phục vụ học tập/sửa đổi cá nhân
    
    display_order REAL DEFAULT 0.0,                         -- Kiểu số thực tối ưu thuật toán kéo thả Reorder trên UI
    status TEXT DEFAULT 'ok',                       -- Trạng thái từ: 'loading', 'error', 'invalid', 'ok'
    version INTEGER DEFAULT 0,                      -- Quản lý phiên bản để đồng bộ vi mô từng item
    released INTEGER DEFAULT 0,                     -- Đánh dấu trạng thái xuất bản
    
    -- Các trường trạng thái (Ép cứng thành INTEGER thay vì NULL để tối ưu truy vấn)
    is_base INTEGER DEFAULT 1,                      -- 1: Bản cơ sở | 0: Bản đã qua chỉnh sửa cá nhân
    is_active INTEGER DEFAULT 1,                    -- 1: Hoạt động | 0: Tạm ẩn
    is_deleted INTEGER DEFAULT 0,                   -- 1: Đã xóa mềm (Chờ sync lệnh xóa lên server)

    -- Các trường cấu trúc phức tạp và thông tin quản lý
    parent TEXT DEFAULT '[]',                       -- Chuỗi mảng JSON lưu lịch sử fork: '["uuid1", "uuid2"]'
    created_by TEXT,                                -- Lưu username hoặc ID của người tạo dưới dạng chuỗi
    created_at TEXT DEFAULT (DATETIME('now')),
    updated_at TEXT DEFAULT (DATETIME('now')),

    -- RÀNG BUỘC UNIQUE: Đảm bảo một Sense không bị trùng lặp trong cùng một bộ từ
    CONSTRAINT unique_collection_sense UNIQUE (collection_id, sense_id)
);

-- INDEX 1: TỐI ƯU TUYỆT ĐỐI CHO UI RENDER DANH SÁCH TỪ (CORE QUERY)
-- Khi user mở 1 bộ từ, câu lệnh CORE sẽ là: SELECT * FROM collection_items WHERE collection_id = ? AND is_deleted = 0 ORDER BY order ASC, created_at ASC;
-- Index này giúp SQLite trả kết quả danh sách từ đã sắp xếp chuẩn trong vòng 0ms.
CREATE INDEX IF NOT EXISTS idx_coll_items_render
ON collection_items (collection_id, display_order, created_at)
WHERE is_deleted = 0;

-- INDEX 2: TỐI ƯU CHO VIỆC KIỂM TRA NGƯỢC (REVERSE LOOKUP)
-- Phục vụ cho các logic: "Từ này đang nằm trong những bộ từ nào?" hoặc xử lý đồng bộ theo cụm dữ liệu từ AI Sense.
CREATE INDEX IF NOT EXISTS idx_coll_items_sense_lookup
ON collection_items (sense_id, collection_id)
WHERE is_deleted = 0;
`;
