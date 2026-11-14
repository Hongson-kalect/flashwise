import { serverInstance } from "../axios";

/**
 * Nhận dạng giọng nói qua backend (Gemini) cho máy không có bộ nhận dạng sẵn: `POST speech/recognize/` (multipart: `file`, `lang`).
 * Trả chữ nghe được ('' nếu không có tiếng nói). Backend chép đúng điều nghe được, không sửa phát âm sai; âm thanh không được lưu ở server.
 * Lỗi: 400 file / lang, 413 quá lớn, 429 gửi quá nhiều (`speech`), 503 `speech_unavailable`; mất mạng thì không có `response`.
 */
export const recognizeSpeech = async (uri: string, lang: string, mime = "audio/aac"): Promise<string> => {
  const form = new FormData();
  form.append("file", { uri, name: mime === "audio/wav" ? "speech.wav" : "speech.aac", type: mime } as any);
  form.append("lang", lang);
  const res = await serverInstance.post("speech/recognize/", form, {
    headers: { "Content-Type": "multipart/form-data" },
    timeout: 20_000,
    transformRequest: (data) => data, // giữ nguyên FormData, không để axios chuyển thành JSON
  });
  return String(res.data?.text ?? "");
};

/** Câu báo lỗi cho người học theo lỗi gọi `recognizeSpeech`. */
export const recognizeErrorText = (e: any): string => {
  if (!e?.response) return "Cần mạng để nhận dạng giọng nói trên máy này";
  switch (e.response.status) {
    case 429:
      return "Bạn đã nói quá nhiều lần, thử lại sau ít phút hoặc chuyển sang gõ";
    case 503:
      return "Dịch vụ nhận dạng đang bận, thử lại nhé";
    default:
      return "Không nhận dạng được, thử lại nhé";
  }
};
