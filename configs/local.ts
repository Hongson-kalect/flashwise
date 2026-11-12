/**
 * Đọc / ghi từ vựng trong SQLite ở trang từ. Bật: từ đã lưu hiện ngay và dùng được offline, chỉ hỏi server khi bản lưu còn
 * draft / thiếu dịch / thiếu ảnh. Tắt (dùng khi dữ liệu server đang đổi cấu trúc, cần xem đúng những gì server trả): trang từ
 * luôn hỏi server; tab Từ vựng chỉ hiện những gì đã ghi trước đó.
 */
export const LOCAL_WORDS_ENABLED = true;
