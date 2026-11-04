/**
 * Tạm tắt đọc / ghi từ vựng trong SQLite khi trang từ: dữ liệu server đang đổi cấu trúc (dạng biến cách, sense dạng) nên chưa
 * đối chiếu được. Bật lại khi server xong và đã biết local cần lưu những gì. Tắt thì trang từ luôn hỏi server; tab Từ vựng chỉ
 * hiện những gì đã ghi trước đó.
 */
export const LOCAL_WORDS_ENABLED = false;
