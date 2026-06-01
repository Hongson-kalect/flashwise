export const generateString = /*sql*/ `
CREATE TABLE IF NOT EXISTS restricted_list (
    target_id TEXT PRIMARY KEY,        -- Chỉ cần lưu ID của những kẻ bị user này xử lý
    is_muted INTEGER DEFAULT 0,
    is_blocked INTEGER DEFAULT 1
);
`;
