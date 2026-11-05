import { mediaUrl } from "@/stores/appStore";
import { Audio } from "expo-av";
import * as Speech from "expo-speech";

let current: Audio.Sound | null = null;

/** Đọc 1 từ: file âm thanh của nghĩa / từ nếu có, không thì giọng máy theo ngôn ngữ của từ. Lỗi thì im lặng (không chặn việc học). */
export const speakWord = async (card: { word: string; lang: string; audio: string | null }) => {
  try {
    Speech.stop();
    await current?.unloadAsync();
    current = null;
    const uri = mediaUrl(card.audio);
    if (uri) {
      const { sound } = await Audio.Sound.createAsync({ uri }, { shouldPlay: true });
      current = sound;
      return;
    }
  } catch {
    // rơi xuống giọng máy
  }
  try {
    Speech.speak(card.word, { language: card.lang });
  } catch {}
};
