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

export type RecognizerStatus = "idle" | "listening" | "denied" | "unavailable" | "error";

export interface Recognizer {
  status: RecognizerStatus;
  /** Câu đang nhận dạng (tạm thời) hoặc câu nghe được lần gần nhất. */
  heard: string;
  message: string | null;
  /** Bấm 1 lần để bắt đầu nói; đang nghe thì bấm lại để huỷ. */
  toggle: () => void;
}

const ERROR_TEXT: Record<string, string> = {
  "no-speech": "Không nghe thấy gì, thử nói lại nhé",
  "speech-timeout": "Không nghe thấy gì, thử nói lại nhé",
  network: "Cần mạng để nhận dạng giọng nói trên máy này",
  "audio-capture": "Không dùng được micro",
};

/**
 * Nhận dạng giọng nói trên máy (expo-speech-recognition): xin quyền micro khi bấm lần đầu, nhận kết quả tạm thời và các phương án cuối,
 * gọi `onFinal(phương án tốt nhất trước)`. Không phát giọng máy khi đang ghi âm.
 */
export const useSpeechRecognizer = (lang: string, onFinal: (transcripts: string[]) => void): Recognizer => {
  const [status, setStatus] = useState<RecognizerStatus>("idle");
  const [heard, setHeard] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const finals = useRef<string[]>([]);
  const failed = useRef(false);
  const cb = useRef(onFinal);
  cb.current = onFinal;

  useSpeechRecognitionEvent("result", (e) => {
    const alternatives = e.results.map((r) => r.transcript).filter(Boolean);
    if (alternatives[0]) setHeard(alternatives[0]);
    if (e.isFinal) finals.current = alternatives;
  });
  useSpeechRecognitionEvent("error", (e) => {
    if (e.error === "aborted") return;
    failed.current = true;
    if (e.error === "not-allowed") setStatus("denied");
    else if (e.error === "service-not-allowed" || e.error === "language-not-supported") setStatus("unavailable");
    else setStatus("error");
    setMessage(ERROR_TEXT[e.error] ?? "Không nhận dạng được, thử lại nhé");
  });
  useSpeechRecognitionEvent("end", () => {
    const result = finals.current;
    finals.current = [];
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

  const toggle = useCallback(async () => {
    if (status === "listening") {
      try {
        ExpoSpeechRecognitionModule.abort();
      } catch {}
      setStatus("idle");
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
      failed.current = false;
      setHeard("");
      setMessage(null);
      setStatus("listening");
      ExpoSpeechRecognitionModule.start({ lang: localeFor(lang), interimResults: true, maxAlternatives: 5, continuous: false });
    } catch {
      setStatus("unavailable");
      setMessage("Máy này chưa hỗ trợ nhận dạng giọng nói");
    }
  }, [status, lang]);

  return { status, heard, message, toggle };
};
