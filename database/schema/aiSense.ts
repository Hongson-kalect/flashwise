
export const generateString =/*sql*/ `
/*sql*/
CREATE TABLE IF NOT EXISTS ai_sense (
    id TEXT PRIMARY KEY,                            -- UUIDv7 thống nhất hệ thống
    word_id TEXT NOT NULL,                          -- Khóa ngoại logic trỏ sang ai_word
    word_value TEXT NOT NULL,                       -- Lưu trực tiếp chữ để render UI không cần JOIN ngược
    metadata_id TEXT,                               -- Khóa ngoại logic trỏ sang sense_metadata
    image_context_id TEXT,                          -- Khóa ngoại logic trỏ sang image_context
    language_code TEXT NOT NULL DEFAULT 'en',
    
    -- Khối nội dung hiển thị dạng JSON Text
    preview TEXT DEFAULT '{}',                      -- Định nghĩa nhanh, ảnh preview, audio thô
    image_preview TEXT,                             
    contents TEXT DEFAULT '{}',                     -- Cấu trúc chi tiết giải nghĩa
    ipas TEXT DEFAULT '[]',                         -- Phiên âm, chữ Kanji có ruby, đính kèm link file âm thanh local/remote
    
    -- Thuộc tính phân loại để filter
    pos TEXT,                                       -- Từ loại (Noun, Verb, Adj)
    level TEXT,                                     -- Cấp độ từ vựng (IELTS, N1, TOPIK...)
    register TEXT DEFAULT '[]',                     -- Văn phong sử dụng dạng mảng JSON

    -- Trạng thái
    is_official INTEGER DEFAULT 1,
    is_offensive INTEGER DEFAULT 0,

    -- Điểm số
    score INTEGER DEFAULT 0,
    like_count INTEGER DEFAULT 0,
    main_count INTEGER DEFAULT 0,

    -- Các trường Base tối giản cho hệ thống Local-First
    is_deleted INTEGER DEFAULT 0,
    created_at TEXT DEFAULT (DATETIME('now')),
    updated_at TEXT DEFAULT (DATETIME('now'))
);

-- INDEX TỐI ƯU HOÀN HẢO CHO LOGIC HỌC TẬP (FLASHCARD RENDERING)
-- Truy vấn lấy nhanh toàn bộ các nghĩa đang hoạt động của một từ vựng cụ thể
CREATE INDEX IF NOT EXISTS idx_ai_sense_word_lookup 
ON ai_sense (word_id) 
WHERE is_deleted = 0;

-- INDEX HỖ TRỢ TÍNH NĂNG BỘ LỌC THÔNG MINH (SMART DECK FILTER)
-- Giúp user tạo bộ bài học nhanh dựa trên Từ loại (pos) hoặc Trình độ (level) offline
CREATE INDEX IF NOT EXISTS idx_ai_sense_filter_local 
ON ai_sense (language_code, pos, level) 
WHERE is_deleted = 0;
`