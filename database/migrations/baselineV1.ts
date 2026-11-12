/**
 * Schema đóng băng của phiên bản 1 (trước khi có migration đánh số). KHÔNG sửa file này.
 * Dùng trong test để dựng DB cũ rồi chạy migration lên, so với schema mới (database/migrations.test.ts).
 */
export const BASELINE_V1_SCHEMA = `
-- notification
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

-- userProfile
CREATE TABLE IF NOT EXISTS user_profile (
    -- Identity
    id TEXT PRIMARY KEY, -- UUIDv7

    -- Basic profile
    full_name TEXT NOT NULL DEFAULT '',
    display_name TEXT NOT NULL DEFAULT '',
    avatar_url TEXT NOT NULL DEFAULT '',

    dob TEXT DEFAULT NULL,               -- YYYY-MM-DD
    country_code TEXT NOT NULL DEFAULT '',

    -- Language settings
    native_language TEXT NOT NULL DEFAULT '',
    learning_languages TEXT NOT NULL DEFAULT '',

    -- Gamification
    level INTEGER NOT NULL DEFAULT 1,
    total_xp INTEGER NOT NULL DEFAULT 0,

    current_streak INTEGER NOT NULL DEFAULT 0,
    max_streak INTEGER NOT NULL DEFAULT 0,

    total_words_learned INTEGER NOT NULL DEFAULT 0,
    total_sessions INTEGER NOT NULL DEFAULT 0,
    total_app_time INTEGER NOT NULL DEFAULT 0,

    -- Subscription
    tier TEXT NOT NULL DEFAULT 'guest'
        CHECK (
            tier IN (
                'guest',
                'free',
                'premium',
                'lifetime'
            )
        ),

    tier_expired_at TEXT DEFAULT NULL,

    -- Account provider
    provider TEXT NOT NULL DEFAULT ''
        CHECK (
            provider IN (
                '',
                'google',
                'facebook',
                'apple',
                'x'
            )
        ),

    identifier TEXT NOT NULL DEFAULT '',

    -- Sync
    time_zone TEXT NOT NULL DEFAULT '',
    last_sync TEXT DEFAULT NULL,
    is_get_server_theme INTEGER NOT NULL DEFAULT 1, -- 0: Not get, 1: Get - Lấy theme theo mùa server bắn cho

    created_at TEXT NOT NULL DEFAULT (DATETIME('now')),
    updated_at TEXT NOT NULL DEFAULT (DATETIME('now'))
);

-- userSetting
CREATE TABLE IF NOT EXISTS user_settings (
    key TEXT PRIMARY KEY,   -- Vì dưới local chỉ quản lý cài đặt của CHÍNH user đang đăng nhập
    value TEXT
);

-- systemConfig
CREATE TABLE IF NOT EXISTS system_configs (
    key TEXT PRIMARY KEY,          -- Ví dụ: 'theme', 'srs_auto_play_audio', 'daily_goal'
    value TEXT                     -- Lưu chuỗi thuần hoặc chuỗi JSON đã stringify
);

-- theme
CREATE TABLE IF NOT EXISTS theme (
    id TEXT PRIMARY KEY,

    name TEXT NOT NULL UNIQUE,

    color_palette TEXT NOT NULL DEFAULT '{}',

    font TEXT NOT NULL DEFAULT 'System',

    priority REAL NOT NULL DEFAULT 1.0,
    -- is_default INTEGER NOT NULL DEFAULT 0,
    -- is_active INTEGER NOT NULL DEFAULT 0,

    expired_at TEXT DEFAULT NULL,
    is_delete_on_expired INTEGER NOT NULL DEFAULT 0,

    is_deleted INTEGER NOT NULL DEFAULT 0,

    created_at TEXT NOT NULL DEFAULT (DATETIME('now')),
    updated_at TEXT NOT NULL DEFAULT (DATETIME('now'))
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_theme_single_default
ON theme(priority);

-- Không để UNIQUE: UNIQUE trên is_deleted chỉ cho tồn tại 1 theme chưa xoá
CREATE INDEX IF NOT EXISTS idx_theme_active_lookup
ON theme(is_deleted, priority DESC);

-- aiWord
CREATE TABLE IF NOT EXISTS ai_word (
    id TEXT PRIMARY KEY,                       -- UUIDv7 gán từ client hoặc server
    value TEXT NOT NULL,
    language_code TEXT NOT NULL DEFAULT 'en',
    status TEXT NOT NULL DEFAULT 'PENDING',
    description TEXT,
    ipas TEXT DEFAULT '[]',                    -- Phiên âm chung của từ (JSON [{label, value, roman}])
    audio TEXT,                                -- Đường dẫn âm thanh chung; rỗng thì đọc bằng giọng máy
    is_active INTEGER DEFAULT 1,               -- SQLite không có Boolean, dùng 0/1
    created_at TEXT DEFAULT (DATETIME('now')),
    updated_at TEXT DEFAULT (DATETIME('now'))
);

-- Index tổ hợp tăng tốc độ tìm kiếm từ vựng theo ngôn ngữ (Hỗ trợ tìm kiếm nhanh/Autocomplete trên UI)
CREATE INDEX IF NOT EXISTS idx_ai_word_lang_value ON ai_word (language_code, value);

-- senseMetadata
CREATE TABLE IF NOT EXISTS sense_metadata (
    id TEXT PRIMARY KEY,                            -- UUIDv7 đồng bộ từ Server
    image_link TEXT,
    advanced TEXT DEFAULT '{}',                     -- Lưu chuỗi JSON stringify
    tags TEXT DEFAULT '[]',                         -- Lưu chuỗi mảng JSON stringify (Ví dụ: '["TOEIC", "Verb"]')
    image_keywords TEXT DEFAULT '[]',               -- Lưu chuỗi mảng JSON stringify
    image_metadata TEXT DEFAULT '{}',               -- Lưu chuỗi JSON stringify
    is_active INTEGER DEFAULT 1,
    created_at TEXT DEFAULT (DATETIME('now')),
    updated_at TEXT DEFAULT (DATETIME('now'))
);

-- Index đặc biệt: Trích xuất và lập chỉ mục cho các thẻ tag bên trong chuỗi JSON của SQLite
-- Giúp tăng tốc độ tối đa khi Sơn chạy lệnh kiểu: WHERE json_each.value = 'TOEIC'
CREATE INDEX IF NOT EXISTS idx_sense_metadata_tags ON sense_metadata (json_extract(tags, '$'));
CREATE INDEX IF NOT EXISTS idx_sense_metadata_created ON sense_metadata (created_at DESC);

-- aiSense
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
    concept TEXT,                                   -- JSON {id, label, status, equivalents[]}: nghĩa giống hệt ở ngôn ngữ khác (server nối, null = chưa nối)
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

-- userNote
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

-- collection
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

-- collectionItems
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

-- dayLearnLog
CREATE TABLE IF NOT EXISTS day_learn_log (
    id TEXT PRIMARY KEY,                            -- UUIDv7 gán thống nhất
    date TEXT NOT NULL DEFAULT (DATE('now')),       -- Lưu định dạng 'YYYY-MM-DD' làm khóa tĩnh theo ngày
    
    -- Các chỉ số tích lũy trong ngày
    words_learned INTEGER DEFAULT 0,
    words_relearned INTEGER DEFAULT 0,
    learn_time INTEGER DEFAULT 0,                   -- Tính bằng giây để đồng bộ đồng nhất với LearnSession
    app_time INTEGER DEFAULT 0,                     -- Tổng thời gian mở app (tính bằng giây)
    xp_earned INTEGER DEFAULT 0,
    sessions_count INTEGER DEFAULT 0,

    created_at TEXT DEFAULT (DATETIME('now')),
    updated_at TEXT DEFAULT (DATETIME('now')),

    CONSTRAINT unique_user_date UNIQUE (date)       -- Đảm bảo mỗi ngày chỉ có duy nhất 1 dòng log dưới máy máy
);

-- INDEX TỐI ƯU ĐỂ VẼ HEATMAP / DASHBOARD TRÊN ĐIỆN THOẠI
-- UI local sẽ query: Lấy log của 30 ngày gần nhất để vẽ biểu đồ
-- Câu lệnh: SELECT * FROM day_learn_log ORDER BY date DESC LIMIT 30;
CREATE INDEX IF NOT EXISTS idx_daily_log_history ON day_learn_log (date DESC);

-- dailyStudyCache
CREATE TABLE IF NOT EXISTS daily_study_cache (
    date TEXT PRIMARY KEY,          -- Định dạng 'YYYY-MM-DD' (Ví dụ: '2026-05-28')
    words_reviewed_count INTEGER DEFAULT 0, -- Số lượt quẹt thẻ ôn tập trong ngày
    words_learned_count INTEGER DEFAULT 0,  -- Số từ mới tinh bắt đầu học trong ngày
    minutes_spent INTEGER DEFAULT 0,        -- Số phút học tích lũy trong ngày
    forget_count INTEGER DEFAULT 0          -- Số lần bấm "Quên" (Total-forget) trong ngày
);

-- imageLibrary
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

-- learnSession
CREATE TABLE IF NOT EXISTS learn_session (
        id TEXT PRIMARY KEY,                            -- UUIDv7 sinh ra ngay khi phiên học bắt đầu (Client tự cấp)
        type TEXT NOT NULL DEFAULT 'learn',             -- 'learn' (học cụm), 'review' (vuốt), 'voice', 'speed', 'mixed' (docs/learning-design.md)
        status TEXT NOT NULL DEFAULT 'in_progress',     -- 'in_progress' | 'completed' | 'abandoned'
        mode TEXT DEFAULT 'normal',                     -- Kiểu học / ôn: 'normal' | 'quick' (vuốt / đọc)
        collection_id TEXT,                             -- Bộ từ đang học (NULL = hàng đợi ôn chung)
        methods TEXT DEFAULT '[]',                      -- JSON mã phương pháp đã bật, vd ["write","cloze","listen"]
        
        -- Lưu trữ thời gian (Định dạng ISO8601 String để dễ sắp xếp và tính toán khoảng cách)
        start_at TEXT NOT NULL DEFAULT (DATETIME('now')), 
        end_at TEXT,                                    -- Điền vào khi user bấm "Kết thúc" hoặc hoàn thành từ cuối cùng
        time INTEGER DEFAULT 0,                         -- Tổng thời gian học thực tế (tính bằng giây)
        
        -- Dữ liệu danh sách từ vựng trong phiên học này
        senses TEXT DEFAULT '[]',                        -- Mảng JSON stringify lưu danh sách UUID các từ tham gia phiên học này
        sense_count INTEGER DEFAULT 0,                   -- Tổng số lượng từ (Dùng để hiển thị nhanh ở màn hình History/Thống kê mà không cần parse mảng JSON)
        new_count INTEGER DEFAULT 0,                    -- Số từ mới
        review_count INTEGER DEFAULT 0,                 -- Số từ ôn
        correct_count INTEGER DEFAULT 0,                -- Số lần trả lời đúng (mọi bước)
        wrong_count INTEGER DEFAULT 0,
        xp_earned INTEGER DEFAULT 0,

        -- Chỉ ở máy, KHÔNG sync: trạng thái hàng đợi + bước từng thẻ để học tiếp phiên dở
        snapshot TEXT DEFAULT '{}',

        -- Trạng thái Local-First (Ép cứng thành INTEGER)
        is_deleted INTEGER DEFAULT 0,                   -- 1: Đã xóa mềm (nếu user muốn xóa lịch sử học này)

        -- Các trường quản lý thời gian đồng bộ cấu trúc nền
        created_at TEXT DEFAULT (DATETIME('now')),
        updated_at TEXT DEFAULT (DATETIME('now'))
    );

    -- INDEX TỐI ƯU CHO TRANG THỐI KÊ & LỊCH SỬ HỌC (ANALYTICS / HISTORY)
    -- UI local sẽ cần truy vấn: "Lấy tất cả các phiên học của tháng này, xếp từ mới nhất xuống cũ nhất"
    -- Câu lệnh: SELECT * FROM learn_session WHERE is_deleted = 0 ORDER BY start_at DESC;
    CREATE INDEX IF NOT EXISTS idx_learn_session_history
    ON learn_session (start_at DESC)
    WHERE is_deleted = 0;

-- restrictedList
CREATE TABLE IF NOT EXISTS restricted_list (
    target_id TEXT PRIMARY KEY,        -- Chỉ cần lưu ID của những kẻ bị user này xử lý
    is_muted INTEGER DEFAULT 0,
    is_blocked INTEGER DEFAULT 1
);

-- userCollection
CREATE TABLE IF NOT EXISTS user_collection (
    id TEXT PRIMARY KEY,                            -- UUIDv7 định danh cho bản ghi tiến độ này
    collection_id TEXT NOT NULL,                    -- Liên kết với collection(id) local hoặc hệ thống
    
    -- Lưu đệm (Denormalization) thông tin hiển thị để render UI Library nhanh, không cần JOIN sang bảng Collection
    name TEXT,                                      
    description TEXT,                               
    
    learned_count INTEGER DEFAULT 0,                -- Số lượng từ/sense đã học thuộc (phục vụ Progress Bar)
    version INTEGER DEFAULT 0,                      -- Phiên bản tiến độ để so khớp khi đồng bộ Cloud
    etag TEXT,                                      -- etag gói học offline lần tải gần nhất (chỉ ở máy, không sync)
    downloaded_at TEXT,                             -- NULL = chưa tải nội dung bộ về máy (chỉ ở máy, không sync)
    is_author INTEGER DEFAULT 0,                    -- 1: mình là tác giả của bộ (bundle trả về, chỉ ở máy)
    is_released INTEGER DEFAULT 0,                  -- 1: bộ đã phát hành (bundle trả về, chỉ ở máy)
    translation_missing INTEGER DEFAULT 0,          -- số nghĩa chưa có bản dịch sang ngôn ngữ của user (bundle trả về, chỉ ở máy)
    
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

-- userInteraction
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

-- userSenseProgress
CREATE TABLE IF NOT EXISTS user_sense_progress (
    id TEXT PRIMARY KEY,                            -- UUIDv7 định danh tiến trình
    original_sense_id TEXT NOT NULL,                -- ID tĩnh của nghĩa từ vựng
    
    level INTEGER DEFAULT 0,                        -- Cấp thẻ 0-7: quyết định kiểu thẻ / phương pháp (docs/learning-design.md)
    max_level INTEGER DEFAULT 0,                    -- Cấp cao nhất từng đạt, lên lại nhanh khi học lại

    -- Bộ đếm học tập
    streak_correct INTEGER DEFAULT 0,
    forget_count INTEGER DEFAULT 0,
    remember_count INTEGER DEFAULT 0,
    repetitions INTEGER DEFAULT 0,

    -- Chỉ số thuật toán FSRS (tên cột giống bảng user_sense_progress phía server)
    state INTEGER DEFAULT 0,                        -- 0: New, 1: Learning, 2: Review, 3: Relearning
    stability REAL DEFAULT 0,                       -- Số ngày để xác suất nhớ giảm còn 90%
    difficulty REAL DEFAULT 0,                      -- 1 - 10, 0 = chưa học lần nào
    scheduled_days REAL DEFAULT 0,                  -- Khoảng ôn đã hẹn ở lần chấm gần nhất (ngày)
    learning_steps INTEGER DEFAULT 0,               -- Bước học ngắn hạn hiện tại (ts-fsrs)
    failed_at TEXT,                                 -- Lần quên gần nhất (ISO8601)

    -- Cờ lọc trạng thái nhanh
    is_mastered INTEGER DEFAULT 0,
    is_hidden INTEGER DEFAULT 0,
    is_avoid INTEGER DEFAULT 0,
    is_deleted INTEGER DEFAULT 0,                   -- Xóa mềm, chờ sync lên server

    -- Thời gian định dạng ISO8601 String ('YYYY-MM-DD HH:MM:SS')
    last_seen_at TEXT,
    last_reviewed_at TEXT,
    next_review_at TEXT,

    created_at TEXT DEFAULT (DATETIME('now')),
    updated_at TEXT DEFAULT (DATETIME('now')),

    CONSTRAINT unique_user_sense_target UNIQUE (original_sense_id)
);

-- INDEX SIÊU TỐC: Quét từ vựng đến hạn ôn tập hàng ngày trên Mobile
-- Lọc bỏ toàn bộ các từ đã mastered, hidden, avoid ngay từ tầng cấu trúc index vật lý
CREATE INDEX IF NOT EXISTS idx_srs_mobile_queue
ON user_sense_progress (next_review_at)
WHERE is_mastered = 0 AND is_hidden = 0 AND is_avoid = 0 AND is_deleted = 0;

-- reviewLog
CREATE TABLE IF NOT EXISTS review_log (
    id TEXT PRIMARY KEY,                            -- UUIDv7, chỉ thêm, không sửa (tên cột giống bảng review_log phía server)
    original_sense_id TEXT NOT NULL,                -- Nghĩa gốc (khoá tiến độ)
    sense_id TEXT,                                  -- Bản nghĩa đang học lúc chấm (có thể là bản riêng)
    session_id TEXT,                                -- learn_session chứa lần chấm này

    rating INTEGER NOT NULL,                        -- 1: Again, 2: Hard, 3: Good, 4: Easy
    mode TEXT DEFAULT '',                           -- <kiểu phiên>:<phương pháp>, vd 'learn:cloze', 'review:swipe', 'voice:speak'
    is_fsrs INTEGER DEFAULT 1,                      -- 1: lần chấm đưa vào FSRS (1 dòng / thẻ / phiên); 0: bước trong phiên / thẻ quay lại (chỉ thống kê)
    level INTEGER DEFAULT 0,                        -- Cấp thẻ lúc chấm
    hint_count INTEGER DEFAULT 0,                   -- Số gợi ý đã dùng
    attempts INTEGER DEFAULT 1,                     -- Số lần trả lời tới khi xong bước
    duration_ms INTEGER DEFAULT 0,                  -- Thời gian suy nghĩ trước khi trả lời

    -- Trạng thái FSRS trước khi chấm
    state INTEGER DEFAULT 0,
    elapsed_days REAL DEFAULT 0,                    -- Số ngày kể từ lần ôn trước
    scheduled_days REAL DEFAULT 0,                  -- Số ngày đã hẹn ở lần trước
    stability REAL DEFAULT 0,
    difficulty REAL DEFAULT 0,

    reviewed_at TEXT NOT NULL DEFAULT (DATETIME('now')),
    created_at TEXT DEFAULT (DATETIME('now'))
);

-- Lịch sử chấm của 1 nghĩa (thống kê, tính lại tiến độ)
CREATE INDEX IF NOT EXISTS idx_review_log_sense
ON review_log (original_sense_id, reviewed_at);

-- syncQueue
CREATE TABLE IF NOT EXISTS sync_queue (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    table_name TEXT NOT NULL,      -- Tên bảng bị thay đổi (Ví dụ: 'collections', 'items')
    record_id TEXT NOT NULL,       -- ID (UUID) của bản ghi bị thay đổi
    action TEXT NOT NULL,          -- Loại hành động: 'INSERT', 'UPDATE', 'DELETE'
    payload TEXT,                  -- Dữ liệu thay đổi dạng JSON string (Chỉ cần cho INSERT/UPDATE)
    query TEXT,                    -- Nếu cấu trúc không cho phép thì dùng full query - khá nguy hiểm

    -- HÀNH ĐỘNG SAU KHI HOÀN TẤT - chỉnh sửa dữ liệu local
    callback_action TEXT,           -- Loại hành động: 'INSERT', 'UPDATE', 'DELETE'
    callback_payload TEXT,          -- Dữ liệu thay đổi dạng JSON string (Chî cần cho INSERT/UPDATE)
    callback_table_name TEXT,
    callback_record_id TEXT,
    callback_query TEXT,

    created_at TEXT DEFAULT (DATETIME('now'))
);
`;
