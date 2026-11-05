import type { CollectionBundle, MyCollectionRow } from "@/services/api/collections";
import { SQLiteDatabase } from "expo-sqlite";

const parse = (v: unknown, fallback: any) => {
  if (typeof v !== "string") return v ?? fallback;
  try {
    return JSON.parse(v);
  } catch {
    return fallback;
  }
};

// Cột thật của từng bảng (đọc 1 lần): bundle có thể có cột app chưa dùng, bỏ qua thay vì lỗi.
const columnCache = new Map<string, string[]>();
const tableColumns = async (db: SQLiteDatabase, table: string) => {
  let cols = columnCache.get(table);
  if (!cols) {
    const info = await db.getAllAsync<{ name: string }>(`PRAGMA table_info(${table})`);
    cols = info.map((c) => c.name);
    columnCache.set(table, cols);
  }
  return cols;
};

const toSql = (v: unknown) => {
  if (v === undefined || v === null) return null;
  if (typeof v === "boolean") return v ? 1 : 0;
  if (typeof v === "object") return JSON.stringify(v);
  return v as string | number;
};

/** INSERT OR REPLACE các dòng server trả về (object theo tên cột), JSON thì tự stringify. */
const upsertRows = async (
  db: SQLiteDatabase,
  table: string,
  rows: Record<string, any>[] | undefined,
  extra?: (row: Record<string, any>) => Record<string, any>,
) => {
  if (!rows?.length) return;
  const cols = await tableColumns(db, table);
  for (const raw of rows) {
    const row = extra ? { ...raw, ...extra(raw) } : raw;
    // Bỏ null để cột lấy giá trị mặc định của schema (vd is_deleted = 0)
    const keys = cols.filter((c) => row[c] !== undefined && row[c] !== null);
    if (!keys.length) continue;
    await db.runAsync(
      `INSERT OR REPLACE INTO ${table} (${keys.join(",")}) VALUES (${keys.map(() => "?").join(",")})`,
      keys.map((k) => toSql(row[k])) as any,
    );
  }
};

/**
 * Ghi gói học offline của 1 bộ vào SQLite: từ, nghĩa, metadata, dòng bộ từ (thay hẳn các dòng cũ của bộ này),
 * xoá nghĩa bị ban. Gọi lại an toàn.
 */
export const saveBundle = async (db: SQLiteDatabase, b: CollectionBundle) => {
  if (b.unchanged || !b.collection || !b.user_collection) return;
  const collectionId = String(b.collection.id);
  const senseWord = new Map((b.senses ?? []).map((s) => [String(s.id), s.word_value as string]));

  await db.withTransactionAsync(async () => {
    await upsertRows(db, "collection", [b.collection!]);
    await upsertRows(db, "ai_word", b.words);
    await upsertRows(db, "sense_metadata", b.sense_metadata);
    await upsertRows(db, "ai_sense", b.senses, () => ({ quality_status: "refined" }));

    await db.runAsync(`DELETE FROM collection_items WHERE collection_id = ?`, [collectionId]);
    await upsertRows(db, "collection_items", b.items, (it) => ({
      value: it.value ?? senseWord.get(String(it.sense_id)) ?? null,
      status: it.status ?? "ok",
      is_deleted: it.is_deleted ? 1 : 0,
    }));

    for (const id of b.banned ?? []) {
      await db.runAsync(`DELETE FROM collection_items WHERE sense_id = ?`, [id]);
      await db.runAsync(`DELETE FROM ai_sense WHERE id = ?`, [id]);
    }

    await upsertRows(db, "user_collection", [b.user_collection!], () => ({
      etag: b.etag,
      downloaded_at: new Date().toISOString(),
    }));
  });
};

/** Bỏ 1 bộ khỏi máy: dòng user_collection + dòng bộ từ. Từ / nghĩa giữ lại (có thể bộ khác dùng). */
export const removeLocalCollection = async (
  db: SQLiteDatabase,
  userCollectionId: string,
  collectionId: string,
) => {
  await db.runAsync(`DELETE FROM collection_items WHERE collection_id = ?`, [collectionId]);
  await db.runAsync(`DELETE FROM user_collection WHERE id = ?`, [userCollectionId]);
};

/**
 * Đưa danh sách bộ trên server (GET user-collections/) vào SQLite, chưa kèm nội dung nghĩa. Bộ đã tải giữ nguyên
 * etag / downloaded_at; bộ không còn trên server thì xoá khỏi máy.
 */
export const saveMyCollections = async (db: SQLiteDatabase, rows: MyCollectionRow[]) => {
  await db.withTransactionAsync(async () => {
    for (const r of rows) {
      const c = r.collection;
      await db.runAsync(
        `INSERT INTO collection (id, name, description, image_url, item_count, language_code, version, is_official, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, DATETIME('now'))
         ON CONFLICT(id) DO UPDATE SET name = excluded.name, description = excluded.description,
           image_url = excluded.image_url, item_count = excluded.item_count, language_code = excluded.language_code,
           version = excluded.version, is_official = excluded.is_official`,
        [
          c.id,
          c.name,
          c.description ?? "",
          c.image_url,
          c.item_count ?? 0,
          c.language_code ?? "en",
          c.version ?? 0,
          c.is_official ? 1 : 0,
        ],
      );
      // Phát hành remix: server chuyển bộ của mình sang bộ mới (cùng id UserCollection, collection_id khác). Chuyển dòng ở máy
      // theo, bỏ nội dung bộ cũ (bộ gốc vẫn của tác giả) và buộc tải lại bundle của bộ mới.
      const old = await db.getFirstAsync<{ collection_id: string }>(
        `SELECT collection_id FROM user_collection WHERE id = ? AND collection_id != ?`,
        [r.id, c.id],
      );
      if (old) {
        await db.runAsync(`DELETE FROM collection_items WHERE collection_id = ?`, [old.collection_id]);
        await db.runAsync(
          `UPDATE user_collection SET collection_id = ?, etag = NULL, downloaded_at = NULL, version = ? WHERE id = ?`,
          [c.id, c.version ?? 0, r.id],
        );
      }
      // `version` của user_collection là bản user đã tải: chỉ đặt khi tạo, sau đó do saveBundle cập nhật
      await db.runAsync(
        `INSERT INTO user_collection (id, collection_id, name, description, learned_count, version, is_active, is_deleted)
         VALUES (?, ?, ?, ?, ?, ?, 1, 0)
         ON CONFLICT(collection_id) DO UPDATE SET id = excluded.id, name = excluded.name,
           description = excluded.description, learned_count = excluded.learned_count, is_deleted = 0`,
        [r.id, c.id, c.name, c.description ?? "", r.learned_count ?? 0, c.version ?? 0],
      );
    }
    const keep = rows.map((r) => r.id);
    const gone = await db.getAllAsync<{ id: string; collection_id: string }>(
      `SELECT id, collection_id FROM user_collection WHERE is_deleted = 0` +
        (keep.length ? ` AND id NOT IN (${keep.map(() => "?").join(",")})` : ""),
      keep as any,
    );
    for (const g of gone) await removeLocalCollection(db, g.id, g.collection_id);
  });
};

export type MyCollection = {
  id: string; // UserCollection
  collectionId: string;
  name: string;
  description: string;
  imageUrl: string | null;
  languageCode: string;
  isOfficial: boolean;
  total: number;
  learned: number;
  downloaded: boolean;
  needsUpdate: boolean; // server có version mới hơn bản đã tải
  updatedAt: string;
  /** Ảnh bìa lấy từ nghĩa trong bộ (khi bộ chưa có ảnh riêng), và từ khoá để tìm ảnh nếu nghĩa cũng chưa có. */
  coverUri: string | null;
  coverWord: string | null;
  coverKeywords: string[];
  /** Từ đang chờ AI tạo (tự vào bộ khi xong) và từ bị từ chối / không dùng được. */
  pendingWords: string[];
  invalidWords: string[];
  /** Tác giả của bộ chưa phát hành, đã tải về: được đổi ảnh bìa. */
  canEditCover: boolean;
  /** Số nghĩa trong bộ chưa có bản dịch sang ngôn ngữ của user (dịch lười khi học tới). */
  translationMissing: number;
  /** Mình là tác giả (bộ do mình tạo). */
  isAuthor: boolean;
  /** Bộ đã được phát hành công khai. */
  released: boolean;
  /** Phiên bản đã phát hành (0 = chưa phát hành lần nào). */
  version: number;
  /** Số dòng nháp chưa phát hành (nghĩa mới thêm / đổi / xoá). Server loại dòng không đổi gì khi phát hành. */
  draftCount: number;
  /** draft = chưa từng phát hành; live = đang công khai; revoked = đã phát hành rồi thu hồi (giữ version, chỉ mình thấy). */
  publishState: "draft" | "live" | "revoked";
  /** Tác giả, đã tải về: có thể bấm phát hành / cập nhật / tiếp tục phát hành (nút sáng khi có gì để gửi). */
  canPublish: boolean;
  /** Người khác (đã tải) đã sửa bộ: phát hành sẽ tạo bản remix riêng, bộ gốc không đổi. */
  canRemix: boolean;
  /** Bộ này là bản remix từ bộ nào (tên bộ gốc), null nếu không phải remix. */
  remixedFrom: string | null;
};

const COLLECTION_SQL = `
  SELECT uc.id, uc.collection_id, COALESCE(c.name, uc.name) AS name, COALESCE(c.description, uc.description) AS description, uc.learned_count, uc.downloaded_at, uc.version AS uc_version,
         uc.created_at, uc.is_author, uc.is_released, uc.translation_missing, c.image_url, c.language_code, c.is_official, c.item_count, c.version AS c_version,
         c.pending_words, c.invalid_words, c.metadatas,
         (SELECT COALESCE(s.image_preview, m.image_link) FROM collection_items i
            JOIN ai_sense s ON s.id = i.sense_id LEFT JOIN sense_metadata m ON m.id = s.metadata_id
          WHERE i.collection_id = uc.collection_id AND i.is_deleted = 0
          ORDER BY (COALESCE(s.image_preview, m.image_link) IS NULL), i.display_order LIMIT 1) AS cover_uri,
         (SELECT s.word_value || '|' || COALESCE(m.image_keywords, '[]') FROM collection_items i
            JOIN ai_sense s ON s.id = i.sense_id LEFT JOIN sense_metadata m ON m.id = s.metadata_id
          WHERE i.collection_id = uc.collection_id AND i.is_deleted = 0
          ORDER BY (COALESCE(s.image_preview, m.image_link) IS NULL), i.display_order LIMIT 1) AS cover_hint,
         (SELECT COUNT(*) FROM collection_items i WHERE i.collection_id = uc.collection_id AND i.is_deleted = 0) AS local_items,
         (SELECT COUNT(*) FROM collection_items i WHERE i.collection_id = uc.collection_id AND i.released = 0) AS draft_count,
         (SELECT COUNT(*) FROM collection_items i
            JOIN ai_sense s ON s.id = i.sense_id
            JOIN user_sense_progress p ON p.original_sense_id = COALESCE(s.original_id, s.id)
          WHERE i.collection_id = uc.collection_id AND i.is_deleted = 0 AND (p.state > 0 OR p.repetitions > 0)) AS local_learned
  FROM user_collection uc
  LEFT JOIN collection c ON c.id = uc.collection_id
  WHERE uc.is_deleted = 0`;

const toMyCollection = (r: any): MyCollection => {
  const downloaded = !!r.downloaded_at;
  const sep = typeof r.cover_hint === "string" ? r.cover_hint.indexOf("|") : -1;
  return {
    canEditCover: downloaded && !!r.is_author && !r.is_released,
    translationMissing: r.translation_missing ?? 0,
    isAuthor: !!r.is_author,
    released: !!r.is_released,
    version: r.c_version ?? 0,
    draftCount: r.draft_count ?? 0,
    publishState: r.is_released ? "live" : (r.c_version ?? 0) > 0 ? "revoked" : "draft",
    canPublish: downloaded && !!r.is_author && (r.is_released ? (r.draft_count ?? 0) > 0 : (r.c_version ?? 0) > 0 || (r.draft_count ?? 0) > 0),
    canRemix: downloaded && !r.is_author && (r.draft_count ?? 0) > 0,
    remixedFrom: (parse(r.metadatas, []) as any[]).find((m) => m?.remixed_from?.name)?.remixed_from.name ?? null,
    pendingWords: parse(r.pending_words, []),
    invalidWords: parse(r.invalid_words, []),
    coverUri: r.cover_uri ?? null,
    coverWord: sep > 0 ? r.cover_hint.slice(0, sep) : null,
    coverKeywords: sep > 0 ? parse(r.cover_hint.slice(sep + 1), []) : [],
    id: r.id,
    collectionId: r.collection_id,
    name: r.name ?? "",
    description: r.description ?? "",
    imageUrl: r.image_url ?? null,
    languageCode: r.language_code ?? "en",
    isOfficial: !!r.is_official,
    total: Math.max(r.item_count ?? 0, r.local_items ?? 0),
    learned: downloaded ? (r.local_learned ?? 0) : (r.learned_count ?? 0),
    downloaded,
    needsUpdate: downloaded && (r.c_version ?? 0) > (r.uc_version ?? 0),
    updatedAt: r.created_at ?? "",
  };
};

export type CollectionSort = "recent" | "alpha" | "progress";

export const listMyCollections = async (
  db: SQLiteDatabase,
  opts: { q?: string; sort?: CollectionSort } = {},
): Promise<MyCollection[]> => {
  const q = opts.q?.trim();
  const order = opts.sort === "alpha" ? "COALESCE(c.name, uc.name) COLLATE NOCASE" : "uc.created_at DESC";
  const rows = await db.getAllAsync<any>(
    `${COLLECTION_SQL} ${q ? "AND COALESCE(c.name, uc.name) LIKE ?" : ""} ORDER BY ${order}`,
    q ? [`%${q}%`] : [],
  );
  const list = rows.map(toMyCollection);
  if (opts.sort === "progress")
    list.sort((a, b) => b.learned / (b.total || 1) - a.learned / (a.total || 1));
  return list;
};

export const getMyCollection = async (
  db: SQLiteDatabase,
  id: string,
): Promise<MyCollection | null> => {
  const r = await db.getFirstAsync<any>(`${COLLECTION_SQL} AND uc.id = ?`, [id]);
  return r ? toMyCollection(r) : null;
};

export const getCollectionEtag = async (db: SQLiteDatabase, id: string) =>
  (
    await db.getFirstAsync<{ etag: string | null }>(
      `SELECT etag FROM user_collection WHERE id = ?`,
      [id],
    )
  )?.etag ?? null;

export type CollectionSense = {
  itemId: string;
  senseId: string;
  value: string;
  languageCode: string;
  pos: string | null;
  level: string | null;
  ipa: string;
  gloss: string;
  definition: string;
  imageUri: string | null;
  keywords: string[];
  learned: boolean;
};

/** Các nghĩa trong 1 bộ đã tải, theo thứ tự bộ (display_order). `userLang` để lấy bản dịch ngắn. */
export const listCollectionSenses = async (
  db: SQLiteDatabase,
  collectionId: string,
  opts: { q?: string; userLang?: string } = {},
): Promise<CollectionSense[]> => {
  const q = opts.q?.trim();
  const rows = await db.getAllAsync<any>(
    `SELECT i.id AS item_id, i.display_order, s.id AS sense_id, s.word_value, s.language_code, s.pos, s.level, s.ipas,
            s.image_preview, s.contents, w.ipas AS word_ipas, m.image_link, m.image_keywords,
            COALESCE(p.repetitions, 0) AS reps, COALESCE(p.state, 0) AS state
     FROM collection_items i
     JOIN ai_sense s ON s.id = i.sense_id
     LEFT JOIN ai_word w ON w.id = s.word_id
     LEFT JOIN sense_metadata m ON m.id = s.metadata_id
     LEFT JOIN user_sense_progress p ON p.original_sense_id = COALESCE(s.original_id, s.id)
     WHERE i.collection_id = ? AND i.is_deleted = 0 AND s.is_deleted = 0 ${q ? "AND s.word_value LIKE ?" : ""}
     ORDER BY i.display_order, i.created_at`,
    q ? [collectionId, `%${q}%`] : [collectionId],
  );
  const lang = opts.userLang ?? "";
  return rows.map((r) => {
    const contents = parse(r.contents, {});
    const trans: string[] = contents?.translations?.[lang] ?? [];
    const definition: string =
      contents?.definition?.[lang]?.value ?? contents?.definition?.[r.language_code]?.value ?? "";
    const ipa = parse(r.ipas, [])?.[0]?.value || parse(r.word_ipas, [])?.[0]?.value || "";
    return {
      itemId: r.item_id,
      senseId: r.sense_id,
      value: r.word_value,
      languageCode: r.language_code,
      pos: r.pos ? String(r.pos).toLowerCase() : null,
      level: r.level ?? null,
      ipa,
      gloss: trans.length ? trans.join(", ") : definition,
      definition,
      imageUri: r.image_preview || r.image_link || null,
      keywords: parse(r.image_keywords, []),
      learned: r.state > 0 || r.reps > 0,
    };
  });
};

/** Ghi ảnh bìa mới vào máy ngay sau khi server nhận (null = về ảnh tự động). */
export const setLocalCover = async (db: SQLiteDatabase, collectionId: string, image: string | null) => {
  await db.runAsync(`UPDATE collection SET image_url = ?, updated_at = DATETIME('now') WHERE id = ?`, [image, collectionId]);
};

/** Ghi thứ tự mới của các dòng trong bộ vào máy (sau khi server nhận), theo vị trí trong `itemIds`. */
export const setLocalOrder = async (db: SQLiteDatabase, itemIds: string[]) => {
  await db.withTransactionAsync(async () => {
    for (let i = 0; i < itemIds.length; i++) {
      await db.runAsync(`UPDATE collection_items SET display_order = ? WHERE id = ?`, [i, itemIds[i]]);
    }
  });
};
