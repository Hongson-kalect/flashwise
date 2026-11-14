import { ExpoSpeechRecognitionModule, useSpeechRecognitionEvent } from "expo-speech-recognition";
import * as Speech from "expo-speech";
import { Platform } from "react-native";
import { recognizeErrorText, recognizeSpeech } from "@/services/api/speech";
import { CLOUD_AUDIO_MIME, CloudSession, requestMicPermission, startCloudRecording } from "./cloudRecorder";
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
  return { defaultService: serviceName(), usable: usableService(), listed, nativeAvailable, available: recognitionAvailable(), engine: recognitionEngine() };
};

/**
 * Khả năng nghe / nói của phiên: theo cài đặt `hearable` / `talkable`. Máy không có bộ nhận dạng sẵn vẫn nói được qua đám mây
 * (ghi âm, gửi backend, Gemini; cần mạng): lỗi mạng thì báo ở bước nói và có nút "Không tiện nói, chuyển sang gõ".
 */
export const voiceCapabilities = (s: { hearable: boolean; talkable: boolean }): Capabilities => ({
  hear: s.hearable,
  talk: s.talkable,
});

/** Cách nhận dạng trên máy này: "native" (hệ điều hành) hoặc "cloud" (ghi âm + backend Gemini). */
export const recognitionEngine = (): "native" | "cloud" => (recognitionAvailable() ? "native" : "cloud");

export type RecognizerStatus = "idle" | "listening" | "processing" | "denied" | "unavailable" | "error";

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
  /** Nhận dạng ngay trên máy (Android 13+, không qua dịch vụ mặc định; cần gói ngôn ngữ). Dùng để thử ở màn "Thử giọng nói". */
  onDevice = false,
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
  // Nhận dạng qua đám mây: phiên ghi âm đang chạy, và hàm chốt (để tự dừng gọi được bản mới nhất)
  const cloudRef = useRef<CloudSession | null>(null);
  const finishRef = useRef<(() => Promise<void>) | null>(null);
  finishRef.current = async () => {
    const session = cloudRef.current;
    if (!session) return;
    cloudRef.current = null;
    const rec = await session.stop();
    // Không nghe thấy tiếng nói thì không gửi lên server (âm thanh trống làm mô hình bịa chữ)
    if (!rec.uri || !rec.heardSpeech) {
      setStatus("error");
      setMessage(ERROR_TEXT["no-speech"]);
      return;
    }
    setStatus("processing");
    try {
      const text = await recognizeSpeech(rec.uri, lang, CLOUD_AUDIO_MIME);
      if (!text) {
        setStatus("error");
        setMessage(ERROR_TEXT["no-speech"]);
        return;
      }
      setHeard(text);
      setStatus("idle");
      cb.current([text]);
    } catch (e) {
      console.warn("[speech] cloud error", e);
      setStatus("error");
      setMessage(recognizeErrorText(e));
    }
  };
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

  // Đang ghi âm / chờ server (đám mây) thì bỏ qua sự kiện của bộ nhận dạng gốc (sự kiện toàn cục, có thể là của bước trước đang huỷ)
  const inCloud = () => cloudRef.current !== null || statusRef.current === "processing";
  useSpeechRecognitionEvent("result", (e) => {
    if (inCloud()) return;
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
    if (e.error === "aborted" || inCloud()) return;
    clearGuard();
    failed.current = true;
    if (e.error === "not-allowed") setStatus("denied");
    else if (e.error === "service-not-allowed" || e.error === "language-not-supported") setStatus("unavailable");
    else setStatus("error");
    console.warn("[speech] error", e.error, e.message, serviceName());
    // Kèm mã lỗi thật (và dịch vụ nhận dạng của máy) để biết máy nào, dịch vụ nào đang từ chối
    if (onDevice && e.message?.includes("On-device recognition is not available")) {
      setMessage("Máy chưa có nhận dạng ngay trên máy (thiếu gói giọng nói / ngôn ngữ của Google)");
      return;
    }
    setMessage(`${ERROR_TEXT[e.error] ?? "Không nhận dạng được, thử lại nhé"} (${e.error}${serviceName() ? ` · ${serviceName()}` : ""})`);
  });
  useSpeechRecognitionEvent("end", () => {
    if (inCloud()) return;
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
    cloudRef.current?.stop().catch(() => {});
    cloudRef.current = null;
    try {
      ExpoSpeechRecognitionModule.abort();
    } catch {}
  }, []);

  const start = useCallback(async () => {
    if (statusRef.current === "listening" || statusRef.current === "processing") return;
    // Máy không có bộ nhận dạng sẵn (vd. iQOO / vivo bản Trung Quốc): ghi âm rồi gửi backend (Gemini)
    if (!onDevice && !recognitionAvailable()) {
      try {
        const perm = await requestMicPermission();
        if (!perm.granted) {
          setStatus("denied");
          setMessage(perm.canAskAgain ? "Cần cho phép dùng micro để luyện nói" : "Micro đang bị tắt, bật lại trong Cài đặt của máy");
          return;
        }
        Speech.stop();
        setHeard("");
        setMessage(null);
        setStatus("listening");
        cloudRef.current = await startCloudRecording(() => {
          finishRef.current?.();
        });
      } catch {
        setStatus("error");
        setMessage("Không dùng được micro");
      }
      return;
    }
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
      if (!onDevice && Platform.OS === "android" && usableService() === null) {
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
        requiresOnDeviceRecognition: onDevice,
        androidRecognitionServicePackage: onDevice ? undefined : usableService() || undefined,
      });
    } catch {
      setStatus("unavailable");
      setMessage("Máy này chưa hỗ trợ nhận dạng giọng nói");
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps -- armGuard chỉ dùng ref và setState
  }, [lang, onDevice]);

  const stop = useCallback(() => {
    if (cloudRef.current) {
      finishRef.current?.();
      return;
    }
    try {
      ExpoSpeechRecognitionModule.stop();
    } catch {}
    // Dừng mà không thấy "end" trong 2 giây thì huỷ hẳn
    armGuard(2000);
  // eslint-disable-next-line react-hooks/exhaustive-deps -- armGuard chỉ dùng ref và setState
  }, []);

  return { status, heard, message, start, stop };
};
