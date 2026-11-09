import type { FsrsFitResult } from "./api/learn";
import type { Db } from "./sync/engine";

/**
 * Khi nào nhờ server tối ưu tham số FSRS riêng cho user. Tham số về lại máy qua sync như cài đặt `fsrs_params`
 * (database/queries/learning.ts#loadLearnSettings → makeScheduler). Server tự giữ tham số mặc định nếu bản mới không tốt hơn.
 */
export const MIN_REVIEWS = 300; // lượt chấm FSRS tối thiểu trên máy mới thử
export const MIN_NEW_REVIEWS = 100; // phải tăng thêm chừng này so với lần thử trước
export const MIN_GAP_MS = 24 * 3600_000; // không thử quá 1 lần / ngày

const KEY = "fsrs_fit";

export const shouldOptimize = (s: { count: number; lastCount: number; lastAt: number; now: number }) =>
  s.count >= MIN_REVIEWS && s.count - s.lastCount >= MIN_NEW_REVIEWS && s.now - s.lastAt >= MIN_GAP_MS;

/** Thử tối ưu nếu đủ điều kiện. Trả true khi server vừa cập nhật tham số (cần kéo về). Lỗi mạng thì ném, lần sau thử lại. */
export const maybeOptimizeFsrs = async (db: Db, call: () => Promise<FsrsFitResult>, now = Date.now()): Promise<boolean> => {
  const count = (await db.getFirstAsync<{ n: number }>(`SELECT COUNT(*) AS n FROM review_log WHERE is_fsrs = 1`))?.n ?? 0;
  let last = { at: 0, count: 0 };
  try {
    const row = await db.getFirstAsync<{ value: string }>(`SELECT value FROM system_configs WHERE key = ?`, [KEY]);
    if (row) last = { ...last, ...JSON.parse(row.value) };
  } catch {}
  if (!shouldOptimize({ count, lastCount: last.count, lastAt: last.at, now })) return false;
  const result = await call();
  await db.runAsync(`INSERT OR REPLACE INTO system_configs (key, value) VALUES (?, ?)`, [KEY, JSON.stringify({ at: now, count })]);
  return result.status === "updated";
};
