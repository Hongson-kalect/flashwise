import * as SQLite from "expo-sqlite";
import { SQLiteDatabase } from "expo-sqlite";
import { generateString as aiSenseGenerateString } from "./aiSense";
import { generateString as aiWordGenerateString } from "./aiWord";
import { generateString as collectionGenerateString } from "./collection";
import { generateString as collectionItemsGenerateString } from "./collectionItems";
import { generateString as dailyStudyCacheGenerateString } from "./dailyStudyCache";
import { generateString as dayLearnLogGenerateString } from "./dayLearnLog";
import { generateString as imageLibraryGenerateString } from "./imageLibrary";
import { generateString as learnSessionGenerateString } from "./learnSession";
import { generateString as notificationGenerateString } from "./notification";
import { generateString as restrictedListGenerateString } from "./restrictedList";
import { generateString as reviewLogGenerateString } from "./reviewLog";
import { generateString as senseMetadataGenerateString } from "./senseMetadata";
import { generateString as syncQueueGenerateString } from "./syncQueue";
import {
  getSystemConfigs,
  generateString as systemConfigGenerateString,
  seedData as systemConfigseedData,
} from "./systemConfig";
import {
  getActiveTheme,
  generateString as themeGenerateString,
  seedData as themeseedData,
} from "./theme";
import { generateString as userCollectionGenerateString } from "./userCollection";
import { generateString as userInteractionGenerateString } from "./userInteraction";
import { generateString as userNoteGenerateString } from "./userNote";
import {
  getUserProfile,
  generateString as userProfileGenerateString,
  seedData as userProfileseedData,
} from "./userProfile";
import { generateString as userSenseProgressGenerateString } from "./userSenseProgress";
import {
  getUserSettings,
  setLearningLanguage,
  setSetting,
  setShowTranslation,
  setTranslateLanguage,
  generateString as userSettingGenerateString,
  seedData as userSettingseedData,
} from "./userSetting";

export const createDBService = (db: SQLiteDatabase) => ({
  getActiveTheme: () => getActiveTheme(db),
  getUserProfile: () => getUserProfile(db),
  getUserSettings: () => getUserSettings(db),
  getSystemConfigs: () => getSystemConfigs(db),
  setShowTranslation: (state: boolean) => setShowTranslation(db, state),
  setLearningLanguage: (val: string) => setLearningLanguage(db, val),
  setTranslateLanguage: (val: string) => setTranslateLanguage(db, val),
  setSetting: (key: string, val: unknown) => setSetting(db, key, val),
});

export const generateSchema = `
    ${notificationGenerateString}
    ${userProfileGenerateString}
    ${userSettingGenerateString}
    ${systemConfigGenerateString}
    ${themeGenerateString}
    ${aiWordGenerateString}
    ${senseMetadataGenerateString}
    ${aiSenseGenerateString}
    
    ${userNoteGenerateString}
    ${collectionGenerateString}
    ${collectionItemsGenerateString}
    ${dayLearnLogGenerateString}
    ${dailyStudyCacheGenerateString}
    ${imageLibraryGenerateString}
    
    ${learnSessionGenerateString}
    ${restrictedListGenerateString}
    ${userCollectionGenerateString}
    
    ${userInteractionGenerateString}
    ${userSenseProgressGenerateString}
    ${reviewLogGenerateString}
    ${syncQueueGenerateString}
`;

const generateSeedData = `
${systemConfigseedData}
${themeseedData}
${userProfileseedData}
${userSettingseedData}
`;

/** Băm chuỗi schema + seed (djb2, 31 bit) để biết schema có đổi không. */
const hashText = (text: string) => {
  let h = 5381;
  for (let i = 0; i < text.length; i++) h = ((h << 5) + h + text.charCodeAt(i)) & 0x7fffffff;
  return h;
};
// Seed chứa id ngẫu nhiên nên không đưa vào hash; đổi seed (theme, setting mặc định) thì tăng SEED_VERSION để DB tạo lại.
const SEED_VERSION = 1;
const SCHEMA_HASH = hashText(generateSchema + SEED_VERSION);

/**
 * Giữ nguyên dữ liệu giữa các lần mở app (cần cho bộ từ tải về học offline). Chỉ xoá và tạo lại DB khi
 * schema đổi hoặc SEED_VERSION đổi (hash lưu ở PRAGMA user_version), nên sửa schema trong lúc dev vẫn không cần migration.
 */
export const initDatabase = async (db: SQLiteDatabase) => {
  const row = await db.getFirstAsync<{ user_version: number }>("PRAGMA user_version");
  if (row?.user_version === SCHEMA_HASH) return;

  await clearDatabase(db);
  await db.execAsync(generateSchema);
  await db.execAsync(generateSeedData);
  await db.execAsync(`PRAGMA user_version = ${SCHEMA_HASH}`);
};

export const clearDatabase = async (db: SQLite.SQLiteDatabase) => {
  // 1. Tắt khóa ngoại tạm thời để xóa cho dễ
  await db.execAsync("PRAGMA foreign_keys = OFF;");

  // 2. Lấy danh sách tất cả các bảng hiện có (trừ các bảng hệ thống của SQLite)
  const tables = await db.getAllAsync<{ name: string }>(
    "SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%';",
  );

  // 3. Xóa từng bảng
  for (const table of tables) {
    await db.execAsync(`DROP TABLE IF EXISTS ${table.name};`);
  }

  // 4. Reset version về 0 để hàm migrateDbIfNeeded chạy lại từ đầu
  await db.execAsync(`PRAGMA user_version = 0;`);

  console.log("Database cleared successfully!");
};
