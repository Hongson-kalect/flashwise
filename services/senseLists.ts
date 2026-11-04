import { GetAPI } from "./axios";
import { updateSense } from "./api/senses";

/**
 * Các danh sách từ của nghĩa nằm trong metadata: `advanced.<kind>` (riêng tags ở `metadata.tags`).
 * Liên quan / đồng nghĩa / trái nghĩa thêm qua `ai-senses/add-items` (2 AI kiểm tra, chỉ thêm); các danh sách khác lưu bản riêng bằng `saveItems`.
 */
export type ItemKind = "collocations" | "relateds" | "synonyms" | "antonyms" | "forms" | "tags";
export const VERIFIED_KINDS: ItemKind[] = ["relateds", "synonyms", "antonyms"];

export const itemsOfMetadata = (metadata: any, kind: ItemKind): string[] =>
  (kind === "tags" ? metadata?.tags : metadata?.advanced?.[kind]) ?? [];

/** Metadata gửi lên: `advanced` / `tags` được server thay nguyên khối nên luôn gửi danh sách đầy đủ và giữ các danh sách khác. */
const metadataWith = (metadata: any, kind: ItemKind, list: string[]) =>
  kind === "tags" ? { tags: list } : { advanced: { ...(metadata?.advanced ?? {}), [kind]: list } };

/** Lưu danh sách mới của 1 mục; trả nghĩa sau khi lưu (nghĩa chính thức bị tách thành bản riêng nên id có thể đổi). */
export const saveItems = (p: { sense: any; userLang: string; kind: ItemKind; items: string[] }) =>
  updateSense({
    senseId: p.sense.id,
    userLang: p.userLang,
    delta: {},
    metadata: metadataWith(p.sense.metadata, p.kind, [...itemsOfMetadata(p.sense.metadata, p.kind), ...p.items]),
  });

// ---- Báo trang từ tải lại khi danh sách của 1 nghĩa đổi (trang từ nghe sự kiện này)
type Listener = (senseId: string) => void;
const listeners = new Set<Listener>();
export const onSenseChanged = (cb: Listener) => {
  listeners.add(cb);
  return () => {
    listeners.delete(cb);
  };
};
export const emitSenseChanged = (senseId: string) => listeners.forEach((cb) => cb(senseId));

// Các lượt gỡ từ chạy lần lượt theo nghĩa, mỗi lượt đọc lại danh sách mới nhất từ server (tránh ghi đè lẫn nhau)
const chains = new Map<string, Promise<unknown>>();

/**
 * Gỡ các từ khỏi 1 danh sách của nghĩa (từ cũ bị từ chối khi người dùng chạm vào chip). Trả id nghĩa sau khi lưu, hoặc null nếu không có gì để gỡ / lỗi.
 * Lỗi bị nuốt: nếu không gỡ được (mất mạng...) thì thôi.
 */
export const removeItems = (p: { senseId: string; kind: ItemKind; words: string[]; userLang: string }) => {
  const run = async (): Promise<string | null> => {
    try {
      const res = await GetAPI(`ai-senses/${p.senseId}/`, { user_lang: p.userLang });
      const current = itemsOfMetadata(res.data?.metadata, p.kind);
      const drop = new Set(p.words.map((w) => w.toLowerCase()));
      const next = current.filter((w) => !drop.has(w.toLowerCase()));
      if (next.length === current.length) return null;
      const saved = await updateSense({
        senseId: p.senseId,
        userLang: p.userLang,
        delta: {},
        metadata: metadataWith(res.data?.metadata, p.kind, next),
      });
      emitSenseChanged(saved.id);
      return saved.id as string;
    } catch {
      return null;
    }
  };
  const prev = chains.get(p.senseId) ?? Promise.resolve();
  const task = prev.then(run, run);
  chains.set(p.senseId, task);
  return task as Promise<string | null>;
};
