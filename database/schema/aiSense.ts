export const generateString =/*sql*/ `
CREATE TABLE IF NOT EXISTS ai_sense (
    id TEXT PRIMARY KEY,                            -- UUIDv7 thống nhất hệ thống
    word_id TEXT NOT NULL,                          -- Khóa ngoại logic trỏ sang ai_word
    word_value TEXT NOT NULL,                       -- Lưu trực tiếp chữ để render UI không cần JOIN ngược
    original_id TEXT,                               -- Nghĩa gốc (null = chính nó là gốc); tiến độ học gắn với original (user_sense_progress.original_sense_id)
    delta TEXT DEFAULT '{}',                        -- Nghĩa riêng dạng delta: áp lên contents (contents lấy của bản gốc)
    metadata_id TEXT,                             -- Khóa ngoại logic trỏ sang sense_metadata
    image_context_id TEXT,                          -- Khóa ngoại logic trỏ sang image_context
    language_code TEXT NOT NULL DEFAULT 'en',
    
    -- Khối nội dung hiển thị dạng JSON Text
    preview TEXT DEFAULT '{}',                      -- Định nghĩa nhanh, ảnh preview, audio thô
    image_preview TEXT,                             
    contents TEXT DEFAULT '{}',                     -- Cấu trúc chi tiết giải nghĩa
    ipas TEXT DEFAULT '[]',                         -- Phiên âm riêng của nghĩa; rỗng thì dùng ai_word.ipas
    audio TEXT,                                     -- Âm thanh riêng của nghĩa; thứ tự dùng: sense.audio > word.audio > giọng máy
    
    -- Thuộc tính phân loại để filter
    pos TEXT,                                       -- Từ loại (Noun, Verb, Adj)
    level TEXT,                                     -- Cấp độ từ vựng (IELTS, N1, TOPIK...)
    register TEXT DEFAULT '[]',                     -- Văn phong sử dụng dạng mảng JSON

    -- Trạng thái
    is_official INTEGER DEFAULT 1,
    is_offensive INTEGER DEFAULT 0,
    quality_status TEXT DEFAULT 'draft',            -- draft | refined | verified (khớp server): draft thì app làm mới nền khi mở từ
    ai_pass INTEGER DEFAULT 1,                      -- Số lần AI đã xử lý (2 = đã refine)

    -- Điểm số
    score INTEGER DEFAULT 0,
    like_count INTEGER DEFAULT 0,
    main_count INTEGER DEFAULT 0,

    -- Thống kê học của mọi user (server cộng dồn từ review_log)
    global_difficulty REAL DEFAULT 0,               -- Độ khó FSRS ban đầu trung bình (1-10), 0 = chưa ai học; chiếm 3 phần khi khởi tạo thẻ
    learner_count INTEGER DEFAULT 0,                -- Số user đã học, ít người thì giảm trọng số global_difficulty

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