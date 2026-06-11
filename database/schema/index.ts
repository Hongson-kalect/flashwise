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
    ${syncQueueGenerateString}
`;

const generateSeedData = `
${systemConfigseedData}
${themeseedData}
${userProfileseedData}
${userSettingseedData}
`;

export const initDatabase = async (db: SQLiteDatabase) => {
  const DATABASE_VERSION = 1; // get from server
  // clearDatabase(db);
  let version = 0;
  await clearDatabase(db);
  try {
    const db_version = await db.getFirstAsync<{ key: string; value: string }>(
      `select * from system_config where key='db_version'`,
    );
    if (db_version) {
      version = Number(db_version.value);
    }
  } catch {
    console.log("no system_config");
  }

  // if(version==DATABASE_VERSION){
  if (version >= 1) {
    return;
  }

  let { user_version: currentDbVersion } = { user_version: 0 };
  if (version >= DATABASE_VERSION) {
    return;
  }

  if (version === 0) {
    await db.execAsync(generateSchema);
    console.log("qq");
    await db.execAsync(generateSeedData);
  }

  await db.execAsync(`PRAGMA user_version = ${DATABASE_VERSION}`);
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
