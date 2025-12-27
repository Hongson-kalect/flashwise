import { SQLiteDatabase } from "expo-sqlite";

export const create = async (db: SQLiteDatabase) => {
  await db.prepareAsync(`
        INSERT INTO $WORD(...) VALUES($...);
    `);
};
