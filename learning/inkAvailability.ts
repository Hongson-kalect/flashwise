import { inkDownloadModel, inkModelReady, inkSupported } from "@/modules/expo-ink-recognition";
import { baseLang, isHandwritingLang } from "./handwriting";

/** ML Kit khởi tạo lần đầu có thể mất hàng chục giây: không để chặn việc bắt đầu phiên học. */
const WAIT_MS = 2500;

const check = async (langs: string[]): Promise<string[]> => {
  const ready: string[] = [];
  for (const lang of new Set(langs.map(baseLang).filter(isHandwritingLang))) {
    if (!(await inkSupported(lang))) continue;
    if (await inkModelReady(lang)) ready.push(lang);
    else inkDownloadModel(lang).catch(() => {});
  }
  return ready;
};

/**
 * Trong các ngôn ngữ của cụm thẻ, ngôn ngữ nào viết tay được ngay (bản app có module + model đã tải).
 * Model chưa tải thì tải nền (cần mạng, 1 lần) cho phiên sau; quá WAIT_MS chưa biết thì phiên này bỏ bước viết.
 */
export const readyWriteLangs = (langs: string[]): Promise<string[]> =>
  Promise.race([check(langs), new Promise<string[]>((resolve) => setTimeout(() => resolve([]), WAIT_MS))]);
