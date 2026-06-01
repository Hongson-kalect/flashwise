
export const generateString =/*sql*/ `
CREATE TABLE IF NOT EXISTS image_library (
    id TEXT PRIMARY KEY,                            -- UUIDv7
    url TEXT NOT NULL,                              
    thumbnail_url TEXT,                             
    provider TEXT NOT NULL DEFAULT 'unsplash',      
    metadata TEXT DEFAULT '{}',                     -- {blurhash, width, height}
    attribution TEXT DEFAULT '{}',                  -- {author_name, author_link}
    
    is_deleted INTEGER DEFAULT 0,
    created_at TEXT DEFAULT (DATETIME('now')),
    updated_at TEXT DEFAULT (DATETIME('now'))
);
CREATE INDEX IF NOT EXISTS idx_image_library_url ON image_library (url) WHERE is_deleted = 0;


-- 2. BẢNG NGỮ CẢNH (ĐÃ GỘP BẢNG TRUNG GIAN)
CREATE TABLE IF NOT EXISTS image_context (
    id TEXT PRIMARY KEY,                            -- UUIDv7 (Đồng bộ từ ID của ImageContext hoặc ImageLibraryContext tùy cấu trúc API của Sơn)
    image_id TEXT NOT NULL,                         -- Khóa ngoại logic nối sang image_library
    description TEXT NOT NULL,                      -- Chuỗi text ngữ cảnh dùng để search local
    display_order INTEGER DEFAULT 0,                -- Đổi tên thành display_order để tường minh, dùng sắp xếp hiển thị ảnh (0 -> 4)
    provider TEXT NOT NULL DEFAULT 'unsplash',

    is_deleted INTEGER DEFAULT 0,
    created_at TEXT DEFAULT (DATETIME('now')),
    updated_at TEXT DEFAULT (DATETIME('now'))
);

-- INDEX TỐI ƯU CHO TRUY VẤN FLASHCARD: Lấy ngữ cảnh và ảnh sắp xếp theo thứ tự ưu tiên hiển thị
CREATE INDEX IF NOT EXISTS idx_image_context_query ON image_context (image_id, display_order ASC) WHERE is_deleted = 0;

-- INDEX TỐI ƯU CHO SEARCH LOCAL: Phục vụ tính năng tìm kiếm bộ từ/từ vựng bằng từ khóa ngữ cảnh
CREATE INDEX IF NOT EXISTS idx_image_context_search ON image_context (description);
`