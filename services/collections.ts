import {
  getCollectionEtag,
  saveBundle,
  saveMyCollections,
} from "@/database/queries/collections";
import { SQLiteDatabase } from "expo-sqlite";
import {
  downloadCollection,
  fetchBundle,
  fetchMyCollections,
} from "./api/collections";

/** Kéo danh sách bộ của mình từ server về SQLite (chưa kèm nội dung nghĩa). Lỗi mạng thì giữ bản local. */
export const syncMyCollections = async (db: SQLiteDatabase) => {
  const rows = await fetchMyCollections();
  await saveMyCollections(db, rows);
  return rows.length;
};

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

/**
 * Tải (hoặc cập nhật) nội dung 1 bộ về SQLite để học offline. Gửi etag cũ nên không đổi thì gần như không tốn gì.
 * Nghĩa còn chờ dịch sang ngôn ngữ của user (`pending`) thì thử tải lại vài lần, mỗi lần cách vài giây.
 * Trả { pending: số nghĩa còn thiếu bản dịch }.
 */
export const downloadBundle = async (
  db: SQLiteDatabase,
  userCollectionId: string,
  userLang: string,
  opts: { force?: boolean; retries?: number } = {},
) => {
  let pending = 0;
  const retries = opts.retries ?? 3;
  for (let attempt = 0; attempt <= retries; attempt++) {
    const etag = opts.force && attempt === 0 ? null : await getCollectionEtag(db, userCollectionId);
    const bundle = await fetchBundle(userCollectionId, userLang, etag);
    if (!bundle.unchanged) await saveBundle(db, bundle);
    pending = bundle.pending?.length ?? 0;
    if (!pending) break;
    if (attempt < retries) await sleep(4000);
  }
  return { pending };
};

/** Thêm bộ có sẵn (Discover / gợi ý) vào thư viện rồi tải về máy. Trả id UserCollection. */
export const addAndDownload = async (db: SQLiteDatabase, collectionId: string, userLang: string) => {
  const id = await downloadCollection(collectionId);
  await syncMyCollections(db);
  await downloadBundle(db, id, userLang);
  return id;
};
