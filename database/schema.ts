import * as SQLite from "expo-sqlite";

// Hàm khởi tạo Database và bảng
export const initDatabase = async (db: SQLite.SQLiteDatabase) => {
  const DATABASE_VERSION = 1; // get from server
  // clearDatabase(db);

  let { user_version: currentDbVersion } = { user_version: 1 };
  if (currentDbVersion >= DATABASE_VERSION) {
    return;
  }

  if (currentDbVersion === 0) {
    await db.execAsync(`
        PRAGMA journal_mode = WAL;
        PRAGMA foreign_keys = ON
        `);

    await db.execAsync(/*sql*/ `
        -- 1. Bảng WORD (Gốc của từ)
        CREATE TABLE IF NOT EXISTS words (
            id TEXT PRIMARY KEY NOT NULL,
            value TEXT NOT NULL UNIQUE,
            description TEXT, -- Hiển thị bổ sung khi tìm kiếm, Nếu không thì chắc phải hiển thị bản dịch
            language TEXT NOT NULL,
            -- Base fields
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            created_by TEXT,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_by TEXT,
            is_active BOOLEAN DEFAULT 1,
            is_deleted BOOLEAN DEFAULT 0,
            deleted_at DATETIME
        );
        CREATE INDEX IF NOT EXISTS idx_words_value ON words (value);
        CREATE INDEX IF NOT EXISTS idx_words_status ON words (is_active, is_deleted);
    
        -- 3. Bảng SENSE_METADATA (Thông tin bổ trợ)
        CREATE TABLE IF NOT EXISTS sense_metadata (
            id TEXT PRIMARY KEY NOT NULL,
            level TEXT,
            synonyms TEXT,
            antonyms TEXT,
            relateds TEXT,
            forms TEXT,
            tags TEXT, -- JSON
            voted INTEGER DEFAULT 0,
            devoted INTEGER DEFAULT 0,
            likes INTEGER DEFAULT 0,
            views INTEGER DEFAULT 0,

            pos TEXT, -- Part of speech
            ipa TEXT, -- JSON: {label, audio, value}
            is_valid BOOLEAN DEFAULT 0,
            is_offensive BOOLEAN DEFAULT 0,
            register TEXT DEFAULT 'informal', -- Ví dụ: formal, informal
            
            image_desc TEXT,
            image_link TEXT,
            image_metadata TEXT,

            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            created_by TEXT,
            updated_by TEXT,
            is_active BOOLEAN DEFAULT 0,
            is_deleted BOOLEAN DEFAULT 0,
            deleted_at DATETIME
        );
        CREATE INDEX IF NOT EXISTS idx_sense_metadata_status ON sense_metadata (is_active, is_deleted);

        CREATE TABLE IF NOT EXISTS sense_content (
            id TEXT PRIMARY KEY NOT NULL,
            value TEXT,
            content_type TEXT,
            type TEXT,
            parent TEXT,
            reading TEXT,
            roman TEXT,
            ruby TEXT,
            language TEXT,
            language_code TEXT,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            created_by TEXT,
            updated_by TEXT,
            is_active BOOLEAN DEFAULT 0,
            is_deleted BOOLEAN DEFAULT 0,
            deleted_at DATETIME
        );
        CREATE INDEX IF NOT EXISTS idx_sense_content_status ON sense_content (is_active, is_deleted);
        CREATE INDEX IF NOT EXISTS idx_sense_content_value ON sense_content (value);
        CREATE INDEX IF NOT EXISTS idx_sense_content_parent ON sense_content (parent);
        CREATE INDEX IF NOT EXISTS idx_sense_content_language_code ON sense_content (language_code);

        -- 2. Bảng SENSE (Phiên bản nghĩa của từ)
        CREATE TABLE IF NOT EXISTS senses (
            id TEXT PRIMARY KEY NOT NULL,
            word_id TEXT NOT NULL,
            original_id TEXT, -- ID của sense ngay trước nó
            metadata_id TEXT, -- ID bảng metadata
            contents_id TEXT, -- JSON (danh sách ID hoặc value tùy bạn)
            new_contents TEXT,
            old_contents TEXT,

            is_frozen BOOLEAN DEFAULT 0,
            versions INTEGER DEFAULT 1,
            origins TEXT, -- JSON Array: [id1, id2, id3...]
            -- Base fields
            is_active BOOLEAN DEFAULT 1,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            created_by TEXT,
            updated_by TEXT,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            is_deleted BOOLEAN DEFAULT 0,
            deleted_at DATETIME,
            FOREIGN KEY (word_id) REFERENCES words (id) ON DELETE CASCADE,
            FOREIGN KEY (original_id) REFERENCES senses (id) ON DELETE SET NULL,
            FOREIGN KEY (metadata_id) REFERENCES sense_metadata (id) ON DELETE SET NULL
        );
        CREATE INDEX IF NOT EXISTS idx_senses_word_id ON senses (word_id);
        CREATE INDEX IF NOT EXISTS idx_senses_original_id ON senses (original_id);
        CREATE INDEX IF NOT EXISTS idx_senses_metadata_id ON senses (metadata_id);
        CREATE INDEX IF NOT EXISTS idx_senses_status ON senses (is_active, is_deleted);

        -- Bảng Like Summary
        CREATE TABLE IF NOT EXISTS likes_summary (
            target_type TEXT NOT NULL,
            target_id TEXT NOT NULL,
            like_count INTEGER DEFAULT 0,
            dislike_count INTEGER DEFAULT 0,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            is_active BOOLEAN DEFAULT 0,
            is_deleted BOOLEAN DEFAULT 0,
            deleted_at DATETIME,
            PRIMARY KEY (target_type, target_id)
        );
        CREATE INDEX IF NOT EXISTS idx_likes_summary_status ON likes_summary (is_active, is_deleted);
    
        -- Bảng Like Detail
        CREATE TABLE IF NOT EXISTS likes_detail (
            id TEXT PRIMARY KEY NOT NULL,
            target_type TEXT NOT NULL,
            target_id TEXT NOT NULL,
            user_id TEXT,
            status INTEGER DEFAULT 0,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            UNIQUE(target_type, target_id, user_id)
        );
        CREATE INDEX IF NOT EXISTS idx_likes_detail_target ON likes_detail (target_type, target_id);
    
        -- Bảng Note
        CREATE TABLE IF NOT EXISTS notes (
            id TEXT PRIMARY KEY NOT NULL,
            sense_id TEXT NOT NULL,
            user_id TEXT,
            content TEXT NOT NULL,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            is_active BOOLEAN DEFAULT 0,
            is_deleted BOOLEAN DEFAULT 0,
            deleted_at DATETIME,
            FOREIGN KEY (sense_id) REFERENCES senses (id) ON DELETE CASCADE
        );
        CREATE INDEX IF NOT EXISTS idx_notes_sense_id ON notes (sense_id);
        CREATE INDEX IF NOT EXISTS idx_notes_status ON notes (is_active, is_deleted);
    
        -- Bảng chứa các bản ghi được tạo, update khi trong trạng thái offline, gửi lần lượt full list lên server
        CREATE TABLE IF NOT EXISTS server_pendings (
        id INTEGER PRIMARY KEY AUTOINCREMENT, -- Tự tăng để đảm bảo thứ tự gửi
        target_id TEXT NOT NULL,               -- ID của từ/sense trong bảng chính
        table_name TEXT NOT NULL,              -- 'words', 'senses', v.v.
        action TEXT NOT NULL,                  -- 'CREATE', 'UPDATE', 'DELETE'
        data TEXT NOT NULL,                    -- JSON dữ liệu thay đổi
        status TEXT DEFAULT 'pending',         -- 'pending', 'syncing', 'error'
        error_message TEXT,                    -- Lưu lỗi nếu server từ chối
        retry_count INTEGER DEFAULT 0,         -- Số lần đã thử gửi lại
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        );
        CREATE INDEX IF NOT EXISTS idx_pending_status ON server_pendings (status);
        CREATE INDEX IF NOT EXISTS idx_pending_target ON server_pendings (target_id);

        CREATE TABLE SyncQueue (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          action_type TEXT, -- 'INSERT_WORD', 'UPDATE_PROGRESS', 'DELETE_CARD'
          table_name TEXT,  -- Tên bảng bị tác động
          payload TEXT,     -- Toàn bộ dữ liệu dưới dạng JSON
          timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
          status TEXT DEFAULT 'PENDING' -- PENDING, SYNCING, ERROR
        );
        CREATE TABLE AppSettings (
            key TEXT PRIMARY KEY,
            value TEXT, -- Lưu string, số, hoặc JSON string
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        );

        -- Khởi tạo các giá trị mặc định (Ví dụ)
        INSERT INTO AppSettings (key, value) VALUES ('last_sync_timestamp', '1970-01-01T00:00:00Z');
        INSERT INTO AppSettings (key, value) VALUES ('app_version', '1.0.0');
        INSERT INTO AppSettings (key, value) VALUES ('theme', 'dark');
        -- Lưu phiên bản nội dung hiện tại của máy
        INSERT INTO AppSettings (key, value) VALUES ('content_version', '20260318_v1');

        -- Lưu trạng thái gói cước (Dù có thể bị sửa nhưng dùng để hiển thị UI nhanh)
        INSERT INTO AppSettings (key, value) VALUES ('user_tier', 'free');
      `);
  }

  // if (currentDbVersion === 1) {
  //   Add more migrations
  // }

  await db.execAsync(`PRAGMA user_version = ${DATABASE_VERSION}`);

  //   return db;
};

const clearDatabase = async (db: SQLite.SQLiteDatabase) => {
  // 1. Tắt khóa ngoại tạm thời để xóa cho dễ
  await db.execAsync("PRAGMA foreign_keys = OFF;");

  // 2. Lấy danh sách tất cả các bảng hiện có (trừ các bảng hệ thống của SQLite)
  const tables = await db.getAllAsync<{ name: string }>(
    "SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%';"
  );

  // 3. Xóa từng bảng
  for (const table of tables) {
    await db.execAsync(`DROP TABLE IF EXISTS ${table.name};`);
  }

  // 4. Reset version về 0 để hàm migrateDbIfNeeded chạy lại từ đầu
  await db.execAsync(`PRAGMA user_version = 0;`);

  console.log("Database cleared successfully!");
};
