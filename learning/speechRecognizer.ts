import { ExpoSpeechRecognitionModule, useSpeechRecognitionEvent } from "expo-speech-recognition";
import * as Speech from "expo-speech";
import { useCallback, useEffect, useRef, useState } from "react";
import { Capabilities } from "./steps";

/** Mã ngôn ngữ app -> locale của bộ nhận dạng. */
const LOCALES: Record<string, string> = { en: "en-US", ja: "ja-JP", vi: "vi-VN", zh: "zh-CN", ko: "ko-KR", es: "es-ES", fr: "fr-FR", de: "de-DE" };
export const localeFor = (lang: string) => LOCALES[lang] ?? lang;

/** Máy có bộ nhận dạng giọng nói không (Android cần dịch vụ nhận dạng, iOS cần Speech). Lỗi thì coi là không. */
export const recognitionAvailable = () => {
  try {
    return ExpoSpeechRecognitionModule.isRecognitionAvailable();
  } catch {
    return false;
  }
};

/** Khả năng nghe / nói của phiên: theo cài đặt `hearable` / `talkable` và thiết bị. Thiếu thì bước nghe / nói bị bỏ khỏi phiên. */
export const voiceCapabilities = (s: { hearable: boolean; talkable: boolean }): Capabilities => ({
  hear: s.hearable,
  talk: s.talkable && recognitionAvailable(),
});

/** Gói dịch vụ nhận dạng mặc định của máy Android (để chẩn đoán máy không dùng dịch vụ của Google); iOS / lỗi thì rỗng. */
const serviceName = () => {
  try {
    return ExpoSpeechRecognitionModule.getDefaultRecognitionService?.()?.packageName ?? "";
  } catch {
    return "";
  }
};

/**
 * Gói dịch vụ nhận dạng để chỉ định khi bắt đầu nghe. Máy chưa chọn dịch vụ mặc định (vd. iQOO / vivo bản Trung Quốc: Android báo
 * "no selected voice recognition service", lỗi client) thì tự chọn một dịch vụ có sẵn, ưu tiên của Google. Có mặc định rồi thì để máy tự dùng.
 */
const GOOGLE_SERVICE = "com.google.android.googlequicksearchbox";
const fallbackService = (): string | undefined => {
  if (serviceName()) return undefined;
  try {
    const all = ExpoSpeechRecognitionModule.getSpeechRecognitionServices?.() ?? [];
    return all.includes(GOOGLE_SERVICE) ? GOOGLE_SERVICE : all[0];
  } catch {
    return undefined;
  }
};

export type RecognizerStatus = "idle" | "listening" | "denied" | "unavailable" | "error";

export interface Recognizer {
  status: RecognizerStatus;
  /** Câu đang nhận dạng (tạm thời) hoặc câu nghe được lần gần nhất. */
  heard: string;
  message: string | null;
  /** Bắt đầu nghe (xin quyền micro lần đầu). Đang nghe rồi thì không làm gì. */
  start: () => Promise<void>;
  /** Dừng nghe và chốt kết quả đã nhận (khác huỷ: câu đã nói vẫn được chấm). */
  stop: () => void;
}

const ERROR_TEXT: Record<string, string> = {
  "no-speech": "Không nghe thấy gì, thử nói lại nhé",
  "speech-timeout": "Không nghe thấy gì, thử nói lại nhé",
  network: "Cần mạng để nhận dạng giọng nói trên máy này",
  "audio-capture": "Không dùng được micro",
  client: "Máy chưa có dịch vụ nhận dạng giọng nói dùng được",
};

/**
 * Nhận dạng giọng nói trên máy (expo-speech-recognition): xin quyền micro khi bấm lần đầu, nhận kết quả tạm thời và các phương án cuối,
 * gọi `onFinal(phương án tốt nhất trước)`. Không phát giọng máy khi đang ghi âm.
 */
export const useSpeechRecognizer = (
  lang: string,
  onFinal: (transcripts: string[]) => void,
  /** Câu đang nói (tạm thời) đã khớp đáp án thì tự dừng, không cần bấm tắt. */
  isMatch?: (transcripts: string[]) => boolean,
): Recognizer => {
  const [status, setStatus] = useState<RecognizerStatus>("idle");
  const [heard, setHeard] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const finals = useRef<string[]>([]);
  const failed = useRef(false);
  const cb = useRef(onFinal);
  cb.current = onFinal;
  const match = useRef(isMatch);
  match.current = isMatch;
  const interim = useRef<string[]>([]);
  const matched = useRef(false);
  const statusRef = useRef<RecognizerStatus>("idle");
  statusRef.current = status;

  useSpeechRecognitionEvent("result", (e) => {
    const alternatives = e.results.map((r) => r.transcript).filter(Boolean);
    if (alternatives[0]) setHeard(alternatives[0]);
    if (e.isFinal) finals.current = alternatives;
    else if (alternatives.length) {
      interim.current = alternatives;
      // Khớp đáp án ngay khi đang nói: dừng luôn (bộ nhận dạng chốt kết quả rồi báo "end")
      if (!matched.current && match.current?.(alternatives)) {
        matched.current = true;
        try {
          ExpoSpeechRecognitionModule.stop();
        } catch {}
      }
    }
  });
  useSpeechRecognitionEvent("error", (e) => {
    if (e.error === "aborted") return;
    failed.current = true;
    if (e.error === "not-allowed") setStatus("denied");
    else if (e.error === "service-not-allowed" || e.error === "language-not-supported") setStatus("unavailable");
    else setStatus("error");
    console.warn("[speech] error", e.error, e.message, serviceName());
    // Kèm mã lỗi thật (và dịch vụ nhận dạng của máy) để biết máy nào, dịch vụ nào đang từ chối
    setMessage(`${ERROR_TEXT[e.error] ?? "Không nhận dạng được, thử lại nhé"} (${e.error}${serviceName() ? ` · ${serviceName()}` : ""})`);
  });
  useSpeechRecognitionEvent("end", () => {
    // Sự kiện toàn cục: "end" do abort() của bước nói trước (đang huỷ khi chuyển bước) có thể tới bản mới còn rảnh, bỏ qua
    if (statusRef.current === "idle" && !failed.current) return;
    // Không có kết quả chốt mà đã khớp lúc đang nói thì dùng chính câu khớp đó
    const result = finals.current.length ? finals.current : matched.current ? interim.current : [];
    finals.current = [];
    interim.current = [];
    matched.current = false;
    if (failed.current) {
      failed.current = false;
      return;
    }
    if (result.length) {
      setStatus("idle");
      cb.current(result);
    } else {
      setStatus("error");
      setMessage(ERROR_TEXT["no-speech"]);
    }
  });

  useEffect(() => () => {
    try {
      ExpoSpeechRecognitionModule.abort();
    } catch {}
  }, []);

  const start = useCallback(async () => {
    if (statusRef.current === "listening") return;
    try {
      const perm = await ExpoSpeechRecognitionModule.requestPermissionsAsync();
      if (!perm.granted) {
        setStatus("denied");
        setMessage(perm.canAskAgain ? "Cần cho phép dùng micro để luyện nói" : "Micro đang bị tắt, bật lại trong Cài đặt của máy");
        return;
      }
      Speech.stop();
      finals.current = [];
      interim.current = [];
      matched.current = false;
      failed.current = false;
      setHeard("");
      setMessage(null);
      setStatus("listening");
      ExpoSpeechRecognitionModule.start({
        lang: localeFor(lang),
        interimResults: true,
        maxAlternatives: 5,
        continuous: false,
        // Từ đơn: mô hình mặc định của Android (free_form) thường kết thúc ngay không trả kết quả (no-speech); web_search khuyên dùng cho từ ngắn
        androidIntentOptions: {
          EXTRA_LANGUAGE_MODEL: "web_search",
          // Chờ im lặng lâu hơn một chút để người học kịp mở miệng và không bị ngắt giữa chừng
          EXTRA_SPEECH_INPUT_COMPLETE_SILENCE_LENGTH_MILLIS: 2000,
          EXTRA_SPEECH_INPUT_POSSIBLY_COMPLETE_SILENCE_LENGTH_MILLIS: 1500,
        },
        iosTaskHint: "confirmation",
        androidRecognitionServicePackage: fallbackService(),
      });
    } catch {
      setStatus("unavailable");
      setMessage("Máy này chưa hỗ trợ nhận dạng giọng nói");
    }
  }, [lang]);

  const stop = useCallback(() => {
    try {
      ExpoSpeechRecognitionModule.stop();
    } catch {}
  }, []);

  return { status, heard, message, start, stop };
};
