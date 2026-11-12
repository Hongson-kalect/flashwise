/**
 * Schema và seed đầy đủ của DB mới (thuần, không import expo-sqlite nên chạy được trong test Node).
 * DB đã có dữ liệu lên phiên bản mới bằng database/migrations: sửa schema ở đây thì phải thêm 1 bước migration tương ứng
 * (test `database/migrations/migrations.test.ts` so DB đi qua migration với DB mới tạo, lệch là báo lỗi).
 */
import { generateString as aiSenseGenerateString } from "./aiSense";
import { generateString as aiWordGenerateString } from "./aiWord";
import { generateString as collectionGenerateString } from "./collection";
import { generateString as collectionItemsGenerateString } from "./collectionItems";
import { generateString as dailyStudyCacheGenerateString } from "./dailyStudyCache";
import { generateString as dayLearnLogGenerateString } from "./dayLearnLog";
import { generateString as habitLogGenerateString } from "./habitLog";
import { generateString as imageLibraryGenerateString } from "./imageLibrary";
import { generateString as learnSessionGenerateString } from "./learnSession";
import { generateString as notificationGenerateString } from "./notification";
import { generateString as restrictedListGenerateString } from "./restrictedList";
import { generateString as reviewLogGenerateString } from "./reviewLog";
import { generateString as senseMetadataGenerateString } from "./senseMetadata";
import { generateString as syncQueueGenerateString } from "./syncQueue";
import { generateString as systemConfigGenerateString, seedData as systemConfigseedData } from "./systemConfig";
import { generateString as themeGenerateString, seedData as themeseedData } from "./theme";
import { generateString as userCollectionGenerateString } from "./userCollection";
import { generateString as userInteractionGenerateString } from "./userInteraction";
import { generateString as userNoteGenerateString } from "./userNote";
import { generateString as userProfileGenerateString, seedData as userProfileseedData } from "./userProfile";
import { generateString as userSenseProgressGenerateString } from "./userSenseProgress";
import { generateString as userSettingGenerateString, seedData as userSettingseedData } from "./userSetting";

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
    ${habitLogGenerateString}
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

export const generateSeedData = `
${systemConfigseedData}
${themeseedData}
${userProfileseedData}
${userSettingseedData}
`;
