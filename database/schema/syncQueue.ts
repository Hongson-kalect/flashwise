export const generateString = /*sql*/`
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
`