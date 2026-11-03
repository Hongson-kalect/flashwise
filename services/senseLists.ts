import { GetAPI } from "./axios";
import { updateSense } from "./api/senses";
import { bulkCreateWords, checkWords } from "./api/words";
import { normalizeWord } from "@/utils/normalizeText";
import { wordSocket } from "@/utils/socket";
import { Platform, ToastAndroid } from "react-native";

/**
 * Các danh sách từ của nghĩa nằm trong metadata: `advanced.<kind>` (riêng tags ở `metadata.tags`).
 * Danh sách chứa từ trong từ điển (liên quan / đồng nghĩa / trái nghĩa) được kiểm tra ngầm sau khi lưu.
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

// ---- Báo trang từ tải lại sau khi danh sách đổi ở nền (trang từ nghe sự kiện này)
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
 * Gỡ các từ khỏi 1 danh sách của nghĩa (từ bị từ chối ở bước tạo từ). Trả id nghĩa sau khi lưu, hoặc null nếu không có gì để gỡ / lỗi.
 * Lỗi bị nuốt: nếu không gỡ được (mất mạng...) thì người dùng tự xoá sau.
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

const toast = (msg: string) => Platform.OS === "android" && ToastAndroid.show(msg, ToastAndroid.LONG);

const WATCH_MS = 3 * 60 * 1000; // quá hạn thì thôi: lần sau người dùng chạm vào từ sẽ tự xử lý
const POLL_AT = [20_000, 60_000, 120_000]; // dự phòng khi lỡ tin socket

/**
 * Sau khi đã lưu: tạo ngầm các từ mới và theo dõi kết quả. Từ bị từ chối (tin socket REJECTED, hoặc server báo invalid / rejected)
 * được gỡ khỏi danh sách và báo nhanh. Người dùng rời trang thì socket vẫn chạy trong app; tắt app thì bỏ qua.
 */
export const createAndWatchWords = (p: {
  senseId: string;
  kind: ItemKind;
  words: string[];
  lang: string;
  userLang: string;
}) => {
  const pending = new Set(p.words);
  if (!pending.size) return;
  const stops: (() => void)[] = [];
  const timers: ReturnType<typeof setTimeout>[] = [];
  let senseId = p.senseId;

  const stopAll = () => {
    stops.splice(0).forEach((s) => s());
    timers.splice(0).forEach(clearTimeout);
  };
  const settle = (word: string) => {
    pending.delete(word);
    if (!pending.size) stopAll();
  };
  const reject = async (word: string) => {
    if (!pending.has(word)) return;
    settle(word);
    const id = await removeItems({ senseId, kind: p.kind, words: [word], userLang: p.userLang });
    if (id) {
      senseId = id;
      toast(`Đã gỡ "${word}": không phải từ hợp lệ`);
    }
  };

  // Nghe socket trước khi gửi yêu cầu tạo để khỏi lỡ tin từ chối đến sớm
  for (const word of p.words) {
    const unsub = wordSocket.subscribe(normalizeWord(word, p.lang), (msg: any) => {
      if (msg?.type === "REJECTED") reject(word);
      else if (msg?.type === "FULL_SENSE" || msg?.type === "COMPLETED") settle(word);
    });
    stops.push(unsub);
  }
  timers.push(setTimeout(stopAll, WATCH_MS));

  const applyStatuses = (res: Record<string, { status: string }>) => {
    for (const word of [...pending]) {
      const st = res[word.toLowerCase().replace(/\s+/g, " ")]?.status;
      if (st === "invalid" || st === "rejected") reject(word);
      else if (st === "exists") settle(word);
    }
  };

  (async () => {
    try {
      applyStatuses(await bulkCreateWords({ lang: p.lang, userLang: p.userLang, words: p.words }));
    } catch {
      return stopAll(); // hết hạn mức / mất mạng: không tạo được, từ vẫn nằm trong danh sách, người dùng chạm vào sẽ biết
    }
    for (const at of POLL_AT) {
      timers.push(
        setTimeout(async () => {
          if (!pending.size) return;
          try {
            applyStatuses(await checkWords({ lang: p.lang, words: [...pending] }));
          } catch {
            /* thử lại ở mốc sau */
          }
        }, at),
      );
    }
  })();
};
