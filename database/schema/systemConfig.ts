export const generateString = /*sql*/`
    CREATE TABLE IF NOT EXISTS system_configs (
    key TEXT PRIMARY KEY,          -- Ví dụ: 'theme', 'srs_auto_play_audio', 'daily_goal'
    value TEXT                     -- Lưu chuỗi thuần hoặc chuỗi JSON đã stringify
);`


export const seedData = /*sql*/ `
INSERT OR IGNORE INTO system_config (key, value) VALUES

('db_version', '1'),

('schema_version', '1'),

('app_initialized', 'true'),

('last_sync', 'null'),

('last_sync_success', 'null'),

('sync_in_progress', 'false'),

('sync_cursor', 'null'),

('device_registered', 'false'),

('seed_version', '1'),

('first_launch_completed', 'false');
`;