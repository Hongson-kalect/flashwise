export const generateString = /*sql*/ `
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
`;
