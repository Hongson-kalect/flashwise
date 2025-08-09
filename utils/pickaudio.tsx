import { Audio } from "expo-av";
import * as DocumentPicker from "expo-document-picker";

export const pickAudio = async () => {
  const result = await DocumentPicker.getDocumentAsync({
    type: "audio/*",
  });

  const audio = result.assets?.[0];

  if (audio) {
    const isValid = await checkAudioDuration(audio.uri);
    if (isValid) {
      return audio;
    }
  }
};

/**
 * Kiểm tra độ dài của file âm thanh
 * @param {string} uri - đường dẫn đến file âm thanh
 */
const checkAudioDuration = async (uri: string) => {
  // Tạo một đối tượng âm thanh từ file âm thanh
  // và không phát âm thanh
  const { sound, status } = await Audio.Sound.createAsync(
    { uri },
    { shouldPlay: false }
  );

  // Lấy độ dài của file âm thanh (tính bằng mili giây)
  const durationMillis = status.durationMillis;

  // Kiểm tra độ dài của file âm thanh
  // Nếu độ dài quá 30 giây, in ra thông báo lỗi
  if (durationMillis > 30000) {
    console.log("❌ File quá dài! Chỉ chấp nhận nhạc d dưới 30 giây.");
  } else {
    // Ngược lại, in ra thông báo thành công
    console.log("✅ File h p lệ:", durationMillis / 1000, "giây");
    return true;
  }

  // Sau khi kiểm tra xong, hủy bỏ đối tượng âm thanh
  // await sound.unloadAsync();
};
