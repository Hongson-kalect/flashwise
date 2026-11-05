import {
  getCollectionEtag,
  saveBundle,
  saveMyCollections,
} from "@/database/queries/collections";
import { SQLiteDatabase } from "expo-sqlite";
import {
  addWordsToCollection,
  createCollectionFromSenses,
  createCollectionFromWords,
  downloadCollection,
  fetchBundle,
  fetchMyCollections,
  resolvePendingWords,
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

/** Sau khi tạo bộ: kéo danh sách bộ + tải nội dung về máy. Lỗi mạng ở bước này không làm mất bộ đã tạo (mở ra sẽ có nút tải). */
const finishCreate = async (db: SQLiteDatabase, userCollectionId: string, userLang: string) => {
  try {
    await syncMyCollections(db);
    await downloadBundle(db, userCollectionId, userLang, { force: true, retries: 0 });
  } catch {}
  return userCollectionId;
};

/** Chế độ nhanh: dán danh sách từ, server chọn nghĩa tốt nhất cho từng từ. Trả id UserCollection. */
export const createQuick = async (
  db: SQLiteDatabase,
  p: { name: string; description: string; lang: string; userLang: string; words: string[] },
) => {
  const created = await createCollectionFromWords(p);
  return finishCreate(db, created.user_collection, p.userLang);
};

/**
 * Chế độ chuyên sâu: bộ gồm các nghĩa đã chọn; từ chưa có nghĩa nào để chọn (đang chờ AI) đi đường thêm từ, tự lấy nghĩa tốt nhất
 * khi tạo xong. Trả id UserCollection.
 */
export const createAdvanced = async (
  db: SQLiteDatabase,
  p: { name: string; description: string; lang: string; userLang: string; senseIds: string[]; pendingWords: string[] },
) => {
  const created = await createCollectionFromSenses(p);
  if (p.pendingWords.length) {
    try {
      await addWordsToCollection(created.user_collection, p.pendingWords, p.userLang);
    } catch {} // bộ đã tạo; từ chờ thêm lại được trong chi tiết bộ
  }
  return finishCreate(db, created.user_collection, p.userLang);
};

/** Bộ còn từ đang chờ AI: gom từ đã tạo xong vào bộ rồi tải lại nội dung. Trả số nghĩa còn thiếu bản dịch. */
export const refreshPending = async (db: SQLiteDatabase, userCollectionId: string, collectionId: string, userLang: string) => {
  await resolvePendingWords(collectionId);
  return downloadBundle(db, userCollectionId, userLang, { retries: 0 });
};
