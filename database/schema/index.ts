import { SQLiteDatabase } from 'expo-sqlite'
import {generateString as aiSenseGenerateString} from './aiSense'
import {generateString as aiWordGenerateString} from './aiWord'
import {generateString as collectionGenerateString} from './collection'
import {generateString as collectionItemsGenerateString} from './collectionItems'
import {generateString as dailyStudyCacheGenerateString} from './dailyStudyCache'
import {generateString as dayLearnLogGenerateString} from './dayLearnLog'
import {generateString as imageLibraryGenerateString} from './imageLibrary'
import {generateString as learnSessionGenerateString} from './learnSession'
import {generateString as notificationGenerateString} from './notification'
import {generateString as restrictedListGenerateString} from './restrictedList'
import {generateString as senseMetadataGenerateString} from './senseMetadata'
import {generateString as syncQueueGenerateString} from './syncQueue'
import {generateString as systemConfigGenerateString} from './systemConfig'
import {generateString as themeGenerateString, getActiveTheme} from './theme'
import {generateString as userCollectionGenerateString} from './userCollection'
import {generateString as userInteractionGenerateString} from './userInteraction'
import {generateString as userNoteGenerateString} from './userNote'
import {generateString as userProfileGenerateString, getUserProfile} from './userProfile'
import {generateString as userSenseProgressGenerateString} from './userSenseProgress'
import {generateString as userSettingGenerateString, getUserSettings} from './userSetting'

export const createDBService = (db:SQLiteDatabase)=> ({
    getActiveTheme: ()=>getActiveTheme(db),
    getUserProfile: ()=>getUserProfile(db),
    getUserSettings: ()=>getUserSettings(db)
});

export const generateSchema = `
    ${aiSenseGenerateString}
    ${aiWordGenerateString}
    ${collectionGenerateString}
    ${collectionItemsGenerateString}
    ${dailyStudyCacheGenerateString}
    ${dayLearnLogGenerateString}
    ${imageLibraryGenerateString}
    ${learnSessionGenerateString}
    ${notificationGenerateString}
    ${restrictedListGenerateString}
    ${senseMetadataGenerateString}
    ${syncQueueGenerateString}
    ${systemConfigGenerateString}
    ${themeGenerateString}
    ${userCollectionGenerateString}
    ${userInteractionGenerateString}
    ${userNoteGenerateString}
    ${userProfileGenerateString}
    ${userSenseProgressGenerateString}
    ${userSettingGenerateString}
`;

export const initDatabase = async (db: SQLiteDatabase) => {
  const DATABASE_VERSION = 1; // get from server
  // clearDatabase(db);

  let { user_version: currentDbVersion } = { user_version: 1 };
  if (currentDbVersion >= DATABASE_VERSION) {
    return;
  }

  if (currentDbVersion === 0) {
    await db.execAsync(generateSchema)
    }

    await db.execAsync(`PRAGMA user_version = ${DATABASE_VERSION}`);

}

