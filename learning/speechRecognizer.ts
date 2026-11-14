import { ExpoSpeechRecognitionModule, useSpeechRecognitionEvent } from "expo-speech-recognition";
import * as Speech from "expo-speech";
import { Platform } from "react-native";
import { useCallback, useEffect, useRef, useState } from "react";
import { Capabilities } from "./steps";

/** Mã ngôn ngữ app -> locale của bộ nhận dạng. */
const LOCALES: Record<string, string> = { en: "en-US", ja: "ja-JP", vi: "vi-VN", zh: "zh-CN", ko: "ko-KR", es: "es-ES", fr: "fr-FR", de: "de-DE" };
export const localeFor = (lang: string) => LOCALES[lang] ?? lang;

/** Gói dịch vụ nhận dạng mặc định của máy Android (để chẩn đoán); iOS / lỗi / chưa chọn thì rỗng. */
const serviceName = () => {
  try {
    return ExpoSpeechRecognitionModule.getDefaultRecognitionService?.()?.packageName ?? "";
  } catch {
    return "";
  }
};

/**
 * Gói dịch vụ nhận dạng dùng được: "" = máy đã có dịch vụ mặc định (để máy tự dùng); chưa chọn mặc định (iQOO / vivo bản Trung Quốc:
 * "no selected voice recognition service") thì chỉ chấp nhận dịch vụ của Google nếu nó hiện trong danh sách; dịch vụ của app khác
 * (vd. trợ lý của hãng) không nhận dạng được gì, chọn nhầm thì màn hình treo ở "Đang nghe". null = máy không hỗ trợ.
 */
const GOOGLE_SERVICE = "com.google.android.googlequicksearchbox";
const usableService = (): string | null => {
  if (serviceName()) return "";
  try {
    // Gọi thẳng Google theo tên khi nó không hiện trong danh sách đã thử trên iQOO: hệ thống trả "too-many-requests" (không bind được), nên không dùng
    const all = ExpoSpeechRecognitionModule.getSpeechRecognitionServices?.() ?? [];
    return all.includes(GOOGLE_SERVICE) ? GOOGLE_SERVICE : null;
  } catch {
    return null;
  }
};

/** Máy có bộ nhận dạng giọng nói dùng được không (Android cần dịch vụ nhận dạng dùng được, iOS cần Speech). Lỗi thì coi là không. */
export const recognitionAvailable = () => {
  try {
    if (!ExpoSpeechRecognitionModule.isRecognitionAvailable()) return false;
    return Platform.OS !== "android" || usableService() !== null;
  } catch {
    return false;
  }
};

/** Thông tin chẩn đoán nhận dạng giọng nói của máy (màn "Thử giọng nói"). */
export const speechDiagnostics = () => {
  let listed: string[] = [];
  try {
    listed = ExpoSpeechRecognitionModule.getSpeechRecognitionServices?.() ?? [];
  } catch {}
  let nativeAvailable = false;
  try {
    nativeAvailable = ExpoSpeechRecognitionModule.isRecognitionAvailable();
  } catch {}
  return { defaultService: serviceName(), usable: usableService(), listed, nativeAvailable, available: recognitionAvailable() };
};

/** Khả năng nghe / nói của phiên: theo cài đặt `hearable` / `talkable` và thiết bị. Thiếu thì bước nghe / nói bị bỏ khỏi phiên. */
export const voiceCapabilities = (s: { hearable: boolean; talkable: boolean }): Capabilities => ({
  hear: s.hearable,
  talk: s.talkable && recognitionAvailable(),
});

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
  // Đồng hồ canh: dịch vụ nhận dạng không báo kết quả / lỗi / kết thúc (dịch vụ hỏng, bị hệ thống chặn) thì tự huỷ, không để nút kẹt ở "Đang nghe"
  const guard = useRef<ReturnType<typeof setTimeout> | null>(null);
  const clearGuard = () => {
    if (guard.current) clearTimeout(guard.current);
    guard.current = null;
  };
  const armGuard = (ms: number) => {
    clearGuard();
    guard.current = setTimeout(() => {
      guard.current = null;
      if (statusRef.current !== "listening") return;
      try {
        ExpoSpeechRecognitionModule.abort();
      } catch {}
      finals.current = [];
      interim.current = [];
      matched.current = false;
      failed.current = false;
      setStatus("error");
      setMessage("Dịch vụ nhận dạng giọng nói không phản hồi, thử lại hoặc chuyển sang gõ");
    }, ms);
  };

  useSpeechRecognitionEvent("result", (e) => {
    clearGuard();
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
    clearGuard();
    failed.current = true;
    if (e.error === "not-allowed") setStatus("denied");
    else if (e.error === "service-not-allowed" || e.error === "language-not-supported") setStatus("unavailable");
    else setStatus("error");
    console.warn("[speech] error", e.error, e.message, serviceName());
    // Kèm mã lỗi thật (và dịch vụ nhận dạng của máy) để biết máy nào, dịch vụ nào đang từ chối
    setMessage(`${ERROR_TEXT[e.error] ?? "Không nhận dạng được, thử lại nhé"} (${e.error}${serviceName() ? ` · ${serviceName()}` : ""})`);
  });
  useSpeechRecognitionEvent("end", () => {
    clearGuard();
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
    clearGuard();
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
      if (Platform.OS === "android" && usableService() === null) {
        setStatus("unavailable");
        setMessage("Máy này chưa có dịch vụ nhận dạng giọng nói dùng được, hãy chuyển sang gõ");
        return;
      }
      setStatus("listening");
      armGuard(12000);
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
        androidRecognitionServicePackage: usableService() || undefined,
      });
    } catch {
      setStatus("unavailable");
      setMessage("Máy này chưa hỗ trợ nhận dạng giọng nói");
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps -- armGuard chỉ dùng ref và setState
  }, [lang]);

  const stop = useCallback(() => {
    try {
      ExpoSpeechRecognitionModule.stop();
    } catch {}
    // Dừng mà không thấy "end" trong 2 giây thì huỷ hẳn
    armGuard(2000);
  // eslint-disable-next-line react-hooks/exhaustive-deps -- armGuard chỉ dùng ref và setState
  }, []);

  return { status, heard, message, start, stop };
};
