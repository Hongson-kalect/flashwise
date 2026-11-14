import { Audio } from "expo-av";
import { Platform } from "react-native";

/**
 * Ghi âm ngắn cho nhận dạng qua đám mây (máy không có bộ nhận dạng sẵn). Tự phát hiện lúc người học nói và lúc ngừng nói từ mức âm (metering):
 * - chưa nói gì sau NO_SPEECH_MS thì dừng (không gửi lên server: âm thanh trống làm Gemini bịa chữ);
 * - nói xong, im TAIL_SILENCE_MS (650ms: chờ lâu hơn thì người học thấy chậm, ngắn hơn thì cắt ngang chỗ ngắt giữa từ) thì dừng; trần MAX_MS.
 * Mức nhận là tiếng nói: cao hơn mức nền 10 dB, kẹp trong [-45, -30] dB (mức nền lấy ở 400ms đầu, giả định không quá -40 dB để người nói ngay vẫn nhận ra).
 */
const MAX_MS = 8000;
const NO_SPEECH_MS = 5000;
const TAIL_SILENCE_MS = 650;
const FLOOR_SAMPLE_MS = 400;
const RISE_DB = 10;
const MIN_THRESHOLD_DB = -45;
const MAX_THRESHOLD_DB = -30;

/** AAC (ADTS) 16 kHz mono trên Android: nhỏ (vài chục KB) và Gemini nhận được; iOS dùng WAV PCM. */
const OPTIONS: Audio.RecordingOptions = {
  isMeteringEnabled: true,
  android: {
    extension: ".aac",
    outputFormat: Audio.AndroidOutputFormat.AAC_ADTS,
    audioEncoder: Audio.AndroidAudioEncoder.AAC,
    sampleRate: 16000,
    numberOfChannels: 1,
    bitRate: 32000,
  },
  ios: {
    extension: ".wav",
    outputFormat: Audio.IOSOutputFormat.LINEARPCM,
    audioQuality: Audio.IOSAudioQuality.MEDIUM,
    sampleRate: 16000,
    numberOfChannels: 1,
    bitRate: 128000,
    linearPCMBitDepth: 16,
    linearPCMIsBigEndian: false,
    linearPCMIsFloat: false,
  },
  web: {},
};

export const CLOUD_AUDIO_MIME = Platform.OS === "ios" ? "audio/wav" : "audio/aac";

export type CloudRecording = { uri: string | null; heardSpeech: boolean };

export interface CloudSession {
  /** Dừng ghi (gọi nhiều lần vẫn an toàn) và trả file + đã nghe thấy tiếng nói chưa. */
  stop: () => Promise<CloudRecording>;
}

export type MicPermission = { granted: boolean; canAskAgain: boolean };

export const requestMicPermission = async (): Promise<MicPermission> => {
  const p = await Audio.requestPermissionsAsync();
  return { granted: p.granted, canAskAgain: p.canAskAgain };
};

/** Bắt đầu ghi; `onAutoStop` được gọi một lần khi đủ điều kiện tự dừng (người dùng vẫn phải gọi `stop()` để lấy file). */
export const startCloudRecording = async (onAutoStop: () => void): Promise<CloudSession> => {
  await Audio.setAudioModeAsync({ allowsRecordingIOS: true, playsInSilentModeIOS: true });
  const startedAt = Date.now();
  let heard = false;
  let lastLoud = 0;
  let floor: number | null = null;
  let autoStopped = false;

  const autoStop = () => {
    if (autoStopped) return;
    autoStopped = true;
    onAutoStop();
  };

  const { recording } = await Audio.Recording.createAsync(
    OPTIONS,
    (st) => {
      if (autoStopped || !st.isRecording || st.metering == null) return;
      const now = Date.now();
      const elapsed = now - startedAt;
      if (elapsed < FLOOR_SAMPLE_MS) {
        floor = floor == null ? st.metering : Math.min(floor, st.metering);
        return;
      }
      const threshold = Math.min(MAX_THRESHOLD_DB, Math.max(MIN_THRESHOLD_DB, (floor ?? -60) + RISE_DB));
      if (st.metering > threshold) {
        heard = true;
        lastLoud = now;
      }
      if (elapsed > MAX_MS || (heard && now - lastLoud > TAIL_SILENCE_MS) || (!heard && elapsed > NO_SPEECH_MS)) autoStop();
    },
    80,
  );

  let result: CloudRecording | null = null;
  return {
    stop: async () => {
      if (result) return result;
      try {
        await recording.stopAndUnloadAsync();
      } catch {}
      const uri = recording.getURI();
      try {
        await Audio.setAudioModeAsync({ allowsRecordingIOS: false });
      } catch {}
      result = { uri, heardSpeech: heard };
      return result;
    },
  };
};
