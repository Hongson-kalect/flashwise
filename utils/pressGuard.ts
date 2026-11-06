/**
 * Khoá bấm: chặn gọi lại 1 hàm khi lần gọi trước chưa xong.
 * - Hàm trả Promise: khoá tới khi Promise xong (kể cả lỗi), báo `onBusyChange` để nút hiện vòng xoay.
 * - Hàm đồng bộ: khoá thêm `cooldownMs` (chống bấm đúp mở 2 modal / push 2 màn); 0 = không khoá.
 * Thuần (không React) để test; hook `useGuardedPress` bọc lại cho component.
 */
export const createPressGuard = (opts: { cooldownMs?: number; onBusyChange?: (busy: boolean) => void } = {}) => {
  const cooldownMs = opts.cooldownMs ?? 0;
  let locked = false;

  const release = () => {
    locked = false;
    opts.onBusyChange?.(false);
  };

  /** Chạy `fn` nếu đang rảnh; trả true nếu đã chạy, false nếu bị chặn. Lỗi đồng bộ vẫn ném ra (và mở khoá). */
  const run = (fn: () => unknown): boolean => {
    if (locked) return false;
    locked = true;
    let result: unknown;
    try {
      result = fn();
    } catch (e) {
      locked = false;
      throw e;
    }
    if (result && typeof (result as Promise<unknown>).then === "function") {
      opts.onBusyChange?.(true);
      (result as Promise<unknown>).then(release, (e) => {
        console.warn("[pressGuard] hàm bấm bị lỗi:", e);
        release();
      });
    } else if (cooldownMs > 0) {
      setTimeout(() => {
        locked = false;
      }, cooldownMs);
    } else {
      locked = false;
    }
    return true;
  };

  return { run, isLocked: () => locked };
};
