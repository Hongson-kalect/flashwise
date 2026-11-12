import {
  getCollectionEtag,
  saveBundle,
  saveMyCollections,
} from "@/database/queries/collections";
import { useAppStore } from "@/stores/appStore";
import useModalStore from "@/stores/modalStore";
import { SQLiteDatabase } from "expo-sqlite";
import {
  addWordsToCollection,
  createCollectionFromSenses,
  createCollectionFromWords,
  downloadCollection,
  fetchBundle,
  fetchMyCollections,
  publishCollection,
  resolvePendingWords,
  unpublishCollection,
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
 * Tải bộ không kích hoạt dịch (dịch lười khi học tới cụm nào, xem prefetchTranslation); `pending` chỉ là số nghĩa
 * chưa có bản dịch sang ngôn ngữ của user, lưu ở user_collection.translation_missing để hiện "đã dịch x / n".
 * Trả { pending }.
 */
export const downloadBundle = async (
  db: SQLiteDatabase,
  userCollectionId: string,
  userLang: string,
  opts: { force?: boolean; retries?: number } = {},
) => {
  let pending = 0;
  const retries = opts.retries ?? 0;
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
  const { id, offensive } = await downloadCollection(collectionId);
  if (offensive) noticeOffensive();
  await syncMyCollections(db);
  await downloadBundle(db, id, userLang);
  return id;
};

/**
 * Thông báo bộ có từ thô tục khi thêm từ hoặc tải bộ (kể cả khi đã bật hiện nội dung thô tục). Người dùng chọn "Không hiển thị lại"
 * thì ghi user_settings.offensive_notice_hidden và lần sau bỏ qua.
 */
export const noticeOffensive = (words?: string[]) => {
  const { settings, dbService, updateSetting } = useAppStore.getState();
  if (settings?.offensive_notice_hidden === true) return;
  const list = words?.length ? `\n\nTừ thô tục: ${words.slice(0, 5).join(", ")}${words.length > 5 ? "…" : ""}.` : "";
  useModalStore.getState().addModal({
    type: "menu",
    modalTitle: "Có nội dung thô tục",
    menuOptions: [
      { key: "info", label: `Bộ này có từ thô tục nên sẽ bị ẩn với người chưa bật hiện nội dung thô tục.${list}`, disabled: true },
      { key: "ok", label: "Đã hiểu" },
      {
        key: "never",
        label: "Không hiển thị lại",
        onPress: () => {
          updateSetting({ offensive_notice_hidden: true });
          dbService?.setSetting("offensive_notice_hidden", true);
        },
      },
    ],
  });
};

/** Giữ tên cũ cho chỗ gọi với danh sách từ thô tục trả từ server. */
export const warnOffensive = (words?: string[]) => {
  if (words?.length) noticeOffensive(words);
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
  p: { name: string; description: string; lang: string; userLang: string; words: string[]; senses?: Record<string, string> },
) => {
  const created = await createCollectionFromWords(p);
  warnOffensive(created.offensive_words);
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

/** Phát hành bộ rồi tải lại nội dung để máy thấy trạng thái mới (đã phát hành, version, dòng nháp thành bản phát hành). */
export const publish = async (
  db: SQLiteDatabase,
  userCollectionId: string,
  userLang: string,
  p: { title: string; desc: string; image?: string },
) => {
  const result = await publishCollection(userCollectionId, p);
  try {
    await syncMyCollections(db);
    await downloadBundle(db, userCollectionId, userLang, { force: true, retries: 0 });
  } catch {} // đã phát hành; mở lại bộ sẽ tải lại
  return result;
};

/** Thu hồi bộ rồi tải lại để máy thấy trạng thái mới (không còn công khai). */
export const unpublish = async (db: SQLiteDatabase, userCollectionId: string, userLang: string) => {
  await unpublishCollection(userCollectionId);
  try {
    await syncMyCollections(db);
    await downloadBundle(db, userCollectionId, userLang, { force: true, retries: 0 });
  } catch {} // đã thu hồi; mở lại bộ sẽ tải lại
};

