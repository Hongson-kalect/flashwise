import { requireOptionalNativeModule } from "expo-modules-core";

/** Một điểm của nét: [x, y, thời gian ms]. */
export type InkPoint = [number, number, number];
export type InkStroke = InkPoint[];

interface Native {
  isSupported(lang: string): Promise<boolean>;
  isModelDownloaded(lang: string): Promise<boolean>;
  downloadModel(lang: string): Promise<boolean>;
  recognize(lang: string, strokes: InkStroke[], width: number, height: number, preContext: string | null): Promise<string[]>;
}

// Null khi bản app chưa build kèm module (dev APK cũ): các hàm dưới trả "không dùng được", không văng lỗi
const native = requireOptionalNativeModule<Native>("ExpoInkRecognition");

/** Bản app có module nhận dạng viết tay và ngôn ngữ này có model. */
export const inkSupported = async (lang: string) => {
  try {
    return !!native && (await native.isSupported(lang));
  } catch {
    return false;
  }
};

export const inkModelReady = async (lang: string) => {
  try {
    return !!native && (await native.isModelDownloaded(lang));
  } catch {
    return false;
  }
};

/** Tải model của ngôn ngữ (cần mạng, 1 lần); true nếu xong. */
export const inkDownloadModel = async (lang: string) => {
  try {
    return !!native && (await native.downloadModel(lang));
  } catch {
    return false;
  }
};

/** Nhận dạng 1 ô viết (các nét vẽ trong khung width x height). Trả ký tự đoán được, tốt nhất trước; lỗi thì []. */
export const inkRecognize = async (lang: string, strokes: InkStroke[], width: number, height: number, preContext = ""): Promise<string[]> => {
  if (!native || !strokes.length) return [];
  try {
    return await native.recognize(lang, strokes, width, height, preContext);
  } catch {
    return [];
  }
};
