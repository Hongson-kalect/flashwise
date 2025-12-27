import * as SQLite from "expo-sqlite";

// Hàm khởi tạo Database và bảng
export const initDatabase = async (db: SQLite.SQLiteDatabase) => {
  const DATABASE_VERSION = 1; // get from server
  //   clearDatabase(db);

  let { user_version: currentDbVersion } = { user_version: 0 };
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
            is_valid BOOLEAN DEFAULT 0,
            is_offensive BOOLEAN DEFAULT 0,
            register TEXT DEFAULT 'informal', -- Ví dụ: formal, informal
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
    
        -- 2. Bảng SENSE (Phiên bản nghĩa của từ)
        CREATE TABLE IF NOT EXISTS senses (
            id TEXT PRIMARY KEY NOT NULL,
            word_id TEXT NOT NULL,
            original_id TEXT, -- ID của sense ngay trước nó
            metadata_id TEXT, -- ID bảng metadata
            definition_id TEXT, -- JSON (danh sách ID hoặc value tùy bạn)
            examples_id TEXT, -- JSON
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
            FOREIGN KEY (metadata_id) REFERENCES sense_metadata (id) ON DELETE SET NULL,
            FOREIGN KEY (definition_id) REFERENCES definitions (id) ON DELETE SET NULL,
            FOREIGN KEY (examples_id) REFERENCES examples (id) ON DELETE SET NULL
        );
        CREATE INDEX IF NOT EXISTS idx_senses_word_id ON senses (word_id);
        CREATE INDEX IF NOT EXISTS idx_senses_original_id ON senses (original_id);
        CREATE INDEX IF NOT EXISTS idx_senses_metadata_id ON senses (metadata_id);
        CREATE INDEX IF NOT EXISTS idx_senses_definition_id ON senses (definition_id);
        CREATE INDEX IF NOT EXISTS idx_senses_examples_id ON senses (examples_id);
        CREATE INDEX IF NOT EXISTS idx_senses_status ON senses (is_active, is_deleted);
    
        -- 3. Bảng SENSE_METADATA (Thông tin bổ trợ)
        CREATE TABLE IF NOT EXISTS sense_metadata (
            id TEXT PRIMARY KEY NOT NULL,
            translations TEXT, -- JSON
            tags TEXT, -- JSON
            voted INTEGER DEFAULT 0,
            devoted INTEGER DEFAULT 0,
            likes INTEGER DEFAULT 0,
            views INTEGER DEFAULT 0,
            pos TEXT, -- Part of speech
            ipa TEXT, -- JSON: {label, audio, value}
            image_desc TEXT,
            image_link TEXT,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            is_active BOOLEAN DEFAULT 0,
            is_deleted BOOLEAN DEFAULT 0,
            deleted_at DATETIME
        );
        CREATE INDEX IF NOT EXISTS idx_sense_metadata_status ON sense_metadata (is_active, is_deleted);
    
        -- 4. Bảng DEFINITION
        CREATE TABLE IF NOT EXISTS definitions (
            id TEXT PRIMARY KEY NOT NULL,
            value TEXT NOT NULL,
            language TEXT NOT NULL,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            is_active BOOLEAN DEFAULT 0,
            is_deleted BOOLEAN DEFAULT 0,
            deleted_at DATETIME
        );
        CREATE INDEX IF NOT EXISTS idx_definitions_status ON definitions (is_active, is_deleted);
    
        -- 5. Bảng EXAMPLE
        CREATE TABLE IF NOT EXISTS examples (
            id TEXT PRIMARY KEY NOT NULL,
            value TEXT NOT NULL,
            language TEXT NOT NULL,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            is_active BOOLEAN DEFAULT 0,
            is_deleted BOOLEAN DEFAULT 0,
            deleted_at DATETIME
        );
        CREATE INDEX IF NOT EXISTS idx_examples_status ON examples (is_active, is_deleted);
    
        -- 6. Bảng EXAMPLE_TRANSLATED
        CREATE TABLE IF NOT EXISTS example_translated (
            id TEXT PRIMARY KEY NOT NULL,
            example_id TEXT,
            value TEXT NOT NULL,
            language TEXT NOT NULL,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            is_active BOOLEAN DEFAULT 0,
            is_deleted BOOLEAN DEFAULT 0,
            deleted_at DATETIME,
            FOREIGN KEY (example_id) REFERENCES examples (id) ON DELETE CASCADE
        );
        CREATE INDEX IF NOT EXISTS idx_example_translated_example_id ON example_translated (example_id);
        CREATE INDEX IF NOT EXISTS idx_example_translated_status ON example_translated (is_active, is_deleted);
        -- Bảng Like Summary
        CREATE TABLE IF NOT EXISTS likes_summary (
            target_type TEXT NOT NULL,
            target_id INTEGER NOT NULL,
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
            target_id INTEGER NOT NULL,
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
