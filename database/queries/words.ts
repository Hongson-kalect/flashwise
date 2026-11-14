import { pronunciationOf } from "@/utils/pronunciation";
import { SQLiteDatabase } from "expo-sqlite";

const j = (v: unknown, fallback: unknown) => JSON.stringify(v ?? fallback);

/**
 * Lưu từ vừa tra (đã đủ dữ liệu: HTTP 200 hoặc FULL_SENSE) vào SQLite để tab Từ vựng hiện được
 * và xem lại khi offline. Ghi đè theo id nên gọi lặp lại an toàn.
 */
export const saveWord = async (
  db: SQLiteDatabase,
  word: {
    id: string;
    value: string;
    languageCode?: string;
    ipas?: unknown;
    audio?: string | null;
    senses: Record<string, any>;
    /**
     * Danh sách `senses` là bản đủ từ server (get-word): nghĩa của từ này không còn trong đó (bị ẩn, bị xoá, admin từ chối)
     * thì đánh dấu xoá ở máy, trừ nghĩa đang nằm trong một bộ từ của mình (học offline vẫn cần).
     */
    prune?: boolean;
  },
) => {
  const lang = word.languageCode ?? "en";
  await db.withTransactionAsync(async () => {
    await db.runAsync(
      `INSERT OR REPLACE INTO ai_word (id, value, language_code, status, ipas, audio, updated_at)
       VALUES (?, ?, ?, 'COMPLETED', ?, ?, DATETIME('now'))`,
      [word.id, word.value, lang, j(word.ipas, []), word.audio ?? null],
    );
    for (const s of Object.values(word.senses)) {
      if (!s?.id) continue;
      // Metadata (cụm từ, từ khoá ảnh, tag...) nằm bảng riêng, ai_sense trỏ tới bằng metadata_id
      const m = s.metadata;
      if (m?.id) {
        await db.runAsync(
          `INSERT OR REPLACE INTO sense_metadata (id, image_link, advanced, tags, image_keywords, image_metadata, updated_at)
           VALUES (?, ?, ?, ?, ?, ?, DATETIME('now'))`,
          [
            m.id,
            m.image_link ?? null,
            j(m.advanced, {}),
            j(m.tags, []),
            j(m.image_keywords, []),
            j(m.image_metadata, {}),
          ],
        );
      }
      await db.runAsync(
        `INSERT OR REPLACE INTO ai_sense
           (id, word_id, word_value, original_id, delta, metadata_id, language_code, image_preview, concept, contents, ipas,
            audio, pos, level, register, is_official, quality_status, ai_pass, like_count, global_difficulty,
            learner_count, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, DATETIME('now'))`,
        [
          s.id,
          word.id,
          word.value,
          s.original_id ?? null,
          j(s.delta, {}),
          m?.id ?? null,
          lang,
          s.image_preview ?? null,
          s.concept ? JSON.stringify(s.concept) : null,
          j(s.contents, {}),
          j(s.ipas, []),
          s.audio ?? null,
          s.pos ?? null,
          s.level ?? null,
          j(s.register, []),
          s.is_official === false ? 0 : 1,
          s.quality_status ?? "draft",
          s.ai_pass ?? 1,
          s.like_count ?? 0,
          s.global_difficulty ?? 0,
          s.learner_count ?? 0,
        ],
      );
    }
    if (word.prune) {
      const ids = Object.values(word.senses)
        .map((s) => s?.id)
        .filter(Boolean);
      if (ids.length) {
        await db.runAsync(
          `UPDATE ai_sense SET is_deleted = 1
           WHERE word_id = ? AND is_deleted = 0 AND id NOT IN (${ids.map(() => "?").join(",")})
             AND id NOT IN (SELECT sense_id FROM collection_items WHERE is_deleted = 0 AND sense_id IS NOT NULL)`,
          [word.id, ...ids],
        );
      }
    }
  });
};

/**
 * Nghĩa bị xoá trên server (của riêng mình) cũng phải biến khỏi bản lưu: saveWord chỉ thêm / thay các nghĩa server trả về,
 * không bỏ nghĩa đã vắng mặt (nghĩa tải từ bộ từ không có trong get-word nên không thể tự dọn theo kiểu "không còn trong kết quả").
 */
export const markSenseRemoved = async (db: SQLiteDatabase, senseId: string, removed: boolean) => {
  await db.runAsync(`UPDATE ai_sense SET is_deleted = ? WHERE id = ?`, [removed ? 1 : 0, senseId]);
};

export type WordRow = {
  wordId: string;
  value: string;
  languageCode: string;
  ipa: string;
  imageUri: string | null;
  senseCount: number;
  posList: string[];
  level: string | null;
  /** Nghĩa ngắn (bản dịch hoặc định nghĩa) của nghĩa đầu tiên, theo ngôn ngữ người học. */
  gloss: string;
  learned: boolean;
};

export type WordSort = "alpha" | "recent" | "learned";

const parse = (s: string | null, fb: any) => {
  try {
    return s ? JSON.parse(s) : fb;
  } catch {
    return fb;
  }
};

/** Danh sách từ đã lưu, gộp các nghĩa theo từ. `userLang` để lấy bản dịch ngắn. */
export const listWords = async (
  db: SQLiteDatabase,
  opts: { q?: string; sort?: WordSort; userLang?: string } = {},
): Promise<WordRow[]> => {
  const q = opts.q?.trim();
  const rows = await db.getAllAsync<any>(
    `SELECT s.id, s.word_id, s.word_value, s.language_code, s.pos, s.level, s.ipas, s.image_preview,
            s.contents, s.created_at, s.updated_at,
            COALESCE(p.repetitions, 0) AS reps, COALESCE(p.state, 0) AS state
     FROM ai_sense s
     LEFT JOIN user_sense_progress p ON p.original_sense_id = COALESCE(s.original_id, s.id)
     WHERE s.is_deleted = 0 ${q ? "AND s.word_value LIKE ?" : ""}
     ORDER BY s.word_value COLLATE NOCASE`,
    q ? [`%${q}%`] : [],
  );

  const byWord = new Map<string, WordRow & { updated: string }>();
  for (const r of rows) {
    let w = byWord.get(r.word_id);
    const contents = parse(r.contents, {});
    const trans: string[] = contents?.translations?.[opts.userLang ?? ""] ?? [];
    const def: string =
      contents?.definition?.[opts.userLang ?? ""]?.value ??
      contents?.definition?.[r.language_code]?.value ??
      "";
    if (!w) {
      w = {
        wordId: r.word_id,
        value: r.word_value,
        languageCode: r.language_code,
        ipa: pronunciationOf(parse(r.ipas, []), r.language_code),
        imageUri: r.image_preview || null,
        senseCount: 0,
        posList: [],
        level: r.level ?? null,
        gloss: trans.length ? trans.join(", ") : def,
        learned: false,
        updated: r.updated_at ?? "",
      };
      byWord.set(r.word_id, w);
    }
    w.senseCount += 1;
    if (r.pos && !w.posList.includes(String(r.pos).toLowerCase()))
      w.posList.push(String(r.pos).toLowerCase());
    if (!w.imageUri && r.image_preview) w.imageUri = r.image_preview;
    if (!w.gloss) w.gloss = trans.length ? trans.join(", ") : def;
    if (r.state > 0 || r.reps > 0) w.learned = true;
    if ((r.updated_at ?? "") > w.updated) w.updated = r.updated_at;
  }

  let list = [...byWord.values()];
  if (opts.sort === "recent") list.sort((a, b) => b.updated.localeCompare(a.updated));
  if (opts.sort === "learned")
    list.sort((a, b) => Number(b.learned) - Number(a.learned) || a.value.localeCompare(b.value));
  return list;
};

export type WordStats = { words: number; senses: number; learned: number };

export const getWordStats = async (db: SQLiteDatabase): Promise<WordStats> => {
  const r = await db.getFirstAsync<{ words: number; senses: number }>(
    `SELECT COUNT(DISTINCT word_id) AS words, COUNT(*) AS senses FROM ai_sense WHERE is_deleted = 0`,
  );
  const l = await db.getFirstAsync<{ n: number }>(
    `SELECT COUNT(DISTINCT p.original_sense_id) AS n FROM user_sense_progress p
     JOIN ai_sense s ON COALESCE(s.original_id, s.id) = p.original_sense_id AND s.is_deleted = 0
     WHERE p.is_deleted = 0 AND (p.state > 0 OR p.repetitions > 0)`,
  );
  return { words: r?.words ?? 0, senses: r?.senses ?? 0, learned: l?.n ?? 0 };
};

export type LocalWord = {
  id: string;
  value: string;
  language_code: string;
  senses: Record<string, any>;
  /** Lần cuối bản lưu được ghi từ server (UTC, `YYYY-MM-DD HH:MM:SS`); để làm mới nền khi đã cũ. */
  updated_at?: string;
};

/** Đọc 1 từ đã lưu, dựng lại đúng dạng server trả (get-word 200) để màn chi tiết dùng chung. */
export const loadLocalWord = async (
  db: SQLiteDatabase,
  value: string,
  lang: string,
): Promise<LocalWord | null> => {
  const w = await db.getFirstAsync<any>(
    `SELECT id, value, language_code, updated_at FROM ai_word
     WHERE language_code = ? AND value = ? COLLATE NOCASE AND status = 'COMPLETED' LIMIT 1`,
    [lang, value.trim()],
  );
  if (!w) return null;
  const rows = await db.getAllAsync<any>(
    `SELECT s.*, m.id AS m_id, m.image_link, m.advanced, m.tags, m.image_keywords, m.image_metadata
     FROM ai_sense s LEFT JOIN sense_metadata m ON m.id = s.metadata_id
     WHERE s.word_id = ? AND s.is_deleted = 0 ORDER BY s.created_at, s.id`,
    [w.id],
  );
  if (!rows.length) return null;

  const senses: Record<string, any> = {};
  for (const r of rows) {
    senses[r.id] = {
      id: r.id,
      word_id: r.word_id,
      word_value: r.word_value,
      original_id: r.original_id,
      pos: r.pos,
      level: r.level,
      register: parse(r.register, []),
      ipas: parse(r.ipas, []),
      audio: r.audio,
      image_preview: r.image_preview,
      concept: parse(r.concept, null),
      contents: parse(r.contents, {}),
      delta: parse(r.delta, {}),
      is_official: !!r.is_official,
      quality_status: r.quality_status,
      ai_pass: r.ai_pass,
      like_count: r.like_count,
      global_difficulty: r.global_difficulty,
      learner_count: r.learner_count,
      metadata: r.m_id
        ? {
            id: r.m_id,
            image_link: r.image_link,
            advanced: parse(r.advanced, {}),
            tags: parse(r.tags, []),
            image_keywords: parse(r.image_keywords, []),
            image_metadata: parse(r.image_metadata, {}),
          }
        : null,
    };
  }
  return { id: w.id, value: w.value, language_code: w.language_code, senses, updated_at: w.updated_at };
};

// Mỗi từ chỉ làm mới nền tối đa 1 lần / 10 phút (từ còn draft hoặc thiếu dịch sẽ không bị gọi mỗi lần mở)
const REFRESH_COOLDOWN_MS = 10 * 60 * 1000;
// Bản lưu cũ hơn mức này thì hỏi lại server ở nền khi có mạng (hiện bản lưu ngay, rồi thay bằng bản mới)
const REVALIDATE_AFTER_MS = 10 * 60 * 1000;
const lastRefresh = new Map<string, number>();

/**
 * Bản lưu có cần hỏi lại server không: còn là draft (server có thể đã refine / xác minh)
 * hoặc thiếu bản dịch sang ngôn ngữ người dùng hiện tại (đổi tiếng mẹ đẻ sau khi lưu).
 */
// Thêm: nghĩa chưa có ảnh cũng đáng hỏi lại. Ảnh AI do server gắn SAU khi từ lưu xong (vài chục giây tới vài phút) mà app
// chỉ lưu bản cuối nên bản lưu lúc đó chưa có ảnh. Nghĩa server chủ ý không vẽ cũng vào đây, bị chặn bởi REFRESH_COOLDOWN_MS.
/**
 * Mốc lưu của từ, UTC. Có 2 dạng trong SQLite: `YYYY-MM-DD HH:MM:SS` (mặc định của cột) và ISO có `Z` / múi giờ (ghi thẳng từ server,
 * vd `2026-11-12T09:05:54.143620Z`). Trước đây luôn nối thêm "Z" nên dạng ISO thành `...ZZ` → NaN → kiểm tra "bản lưu cũ" không bao giờ chạy.
 */
export const parseSavedAt = (value?: string | null) => {
  if (!value) return NaN;
  const iso = value.includes("T") ? value : value.replace(" ", "T");
  return Date.parse(/(Z|[+-]\d\d:?\d\d)$/.test(iso) ? iso : iso + "Z");
};

export const needsRefresh = (
  word: LocalWord,
  userLang: string | undefined,
  now = Date.now(),
) => {
  const senses = Object.values(word.senses);
  const savedAt = parseSavedAt(word.updated_at);
  const stale =
    (!Number.isNaN(savedAt) && now - savedAt > REVALIDATE_AFTER_MS) ||
    senses.some((s) => s.quality_status === "draft") ||
    senses.some((s) => !s.image_preview) ||
    (!!userLang &&
      userLang !== word.language_code &&
      senses.some((s) => !s.contents?.definition?.[userLang]));
  if (!stale) return false;
  const key = `${word.language_code}:${word.value.toLowerCase()}:${userLang}`;
  if (now - (lastRefresh.get(key) ?? 0) < REFRESH_COOLDOWN_MS) return false;
  lastRefresh.set(key, now);
  return true;
};
