import { SQLiteDatabase } from "expo-sqlite";
import { listMyCollections } from "./collections";
import { pickNewCards } from "./learning";

/**
 * Bộ từ nên học tiếp khi không còn thẻ ôn:
 * - learn: bộ đầu tiên (theo thứ tự trong tab Bộ từ) đã tải và còn nghĩa mới.
 * - download: gặp bộ chưa tải trước khi tìm được bộ còn nghĩa mới: cần tải bộ đó.
 * - done: mọi bộ đều đã học hết (hoặc chưa có bộ nào).
 */
export type NextStudy =
  | { kind: "learn"; id: string; name: string; remaining: number }
  | { kind: "download"; id: string; name: string }
  | { kind: "done"; hasCollections: boolean };

export const findNextStudy = async (db: SQLiteDatabase, userLang: string): Promise<NextStudy> => {
  const list = await listMyCollections(db, { sort: "recent" });
  for (const c of list) {
    if (!c.downloaded) return { kind: "download", id: c.id, name: c.name };
    const { available } = await pickNewCards(db, c.id, userLang, 1);
    if (available > 0) return { kind: "learn", id: c.id, name: c.name, remaining: available };
  }
  return { kind: "done", hasCollections: list.length > 0 };
};
