export const generateString = /*sql*/ `
CREATE TABLE IF NOT EXISTS collection (
    id TEXT PRIMARY KEY,                            -- UUIDv7 sinh từ Client/Server để đồng bộ nhất quán
    name TEXT NOT NULL,
    description TEXT,
    image_url TEXT,
    score INTEGER DEFAULT 0,                        -- Điểm uy tín hoặc độ ưu tiên hiển thị bộ từ
    item_count INTEGER DEFAULT 0,                   -- Tổng số lượng từ/sense (dùng để tính toán % tiến độ học trên UI)
    language_code TEXT NOT NULL DEFAULT 'en',       -- Phục vụ filter bộ từ theo ngôn ngữ đang học

    downloaded_count INTEGER DEFAULT 0,             -- Tổng số lượng từ/sense (dùng để tính toán % tiến độ học trên UI)
    like_count INTEGER DEFAULT 0,                   -- Tổng số lượng từ/sense (dùng để tính toán % tiến độ học trên UI)
    view_count INTEGER DEFAULT 0,                   -- Tổng số lượng từ/sense (dùng để tính toán % tiến độ học trên UI)

    
    -- Các trường dữ liệu phức tạp được ép phẳng thành JSON String để tăng tốc độ đọc
    tags TEXT DEFAULT '[]',                         -- Ví dụ: '["IELTS", "Vocabulary", "Hot"]'
    metadatas TEXT DEFAULT '[]',                    -- Lưu change log, thông tin phụ bản dịch...
    parents TEXT DEFAULT '[]',                      -- Mảng UUID lịch sử fork bộ từ
    previous TEXT DEFAULT '',                      -- Mảng UUID lịch sử fork bộ từ
    invalid_words TEXT DEFAULT '[]',                -- Danh sách từ lỗi/bị loại bỏ
    pending_words TEXT DEFAULT '[]',                -- Danh sách từ đang đợi AI xử lý offline/online
    
    -- Trạng thái đồng bộ và bản quyền
    version INTEGER DEFAULT 0,                      -- Số tăng dần để check xem cần kéo update từ server về không
    is_official INTEGER DEFAULT 0,                  -- 0: Bộ từ cá nhân user tự tạo | 1: Bộ từ hệ thống khóa sẵn
    is_active INTEGER DEFAULT 1,                    -- 0: Bộ từ bị ẩn (User tạm cất đi không học nữa)
    is_frozen INTEGER DEFAULT 0,                    -- 1: Đóng băng không cho sửa đổi cấu trúc dữ liệu

    -- Các trường Base quản lý trạng thái local-first
    is_deleted INTEGER DEFAULT 0,                   -- Xóa mềm (Soft delete) để đồng bộ trạng thái xóa lên server
    created_at TEXT DEFAULT (DATETIME('now')),     -- Thời gian tạo (ISO8601 string để dễ sắp xếp)
    updated_at TEXT DEFAULT (DATETIME('now'))
);

-- INDEX 1: TỐI ƯU CORE QUERY CHO DASHBOARD LOCAL
-- Tối ưu tuyệt đối cho màn hình Home/Dashboard khi gọi câu lệnh lấy các bộ từ đang kích hoạt, chưa xóa, xếp theo bộ từ mới tạo lên đầu.
-- SQLite hỗ trợ Partial Index rất mạnh nên ta tận dụng luôn WHERE để thu nhỏ kích thước file index.
CREATE INDEX IF NOT EXISTS idx_collection_local_render 
ON collection (language_code, is_active, created_at DESC) 
WHERE is_deleted = 0;

-- INDEX 2: TỐI ƯU TÌM KIẾM OFFLINE (SEARCH BAR)
-- Hỗ trợ tìm kiếm tức thì (Instant Search) khi người dùng gõ tên bộ từ trên thanh tìm kiếm của app.
-- Vì SQLite mặc định so khớp chuỗi có phân biệt hoa thường, index này sẽ hoạt động tốt nhất với mệnh đề: WHERE name LIKE 'keyword%'
CREATE INDEX IF NOT EXISTS idx_collection_local_search 
ON collection (name);
`;
