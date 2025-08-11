import { Audio } from "expo-av";
import { Dispatch, SetStateAction } from "react";

// Tham số: Đường link nhạc
//Biến nhạc - Để xác định có nhạc đang phát hay không
export const playAudio = async (
  uri: string,
  sound: [Audio.Sound | null, Dispatch<SetStateAction<Audio.Sound | null>>]
) => {
  try {
    if (!uri) return;
    if (sound[0]) {
      await sound[0].unloadAsync(); // Xóa âm thanh cũ nếu có
    }

    const { sound: newSound } = await Audio.Sound.createAsync(
      { uri: uri },
      { shouldPlay: true }
    );

    sound[1](newSound);
    console.log("🔊 Đang phát audio...");
  } catch (err) {
    console.error("❌ Lỗi khi phát audio:", err);
  }
};
