import recordingStore, { AudioType } from "@/stores/recordingStore";
import { Audio } from "expo-av";

let recording: Audio.Recording | null = null;

//Nhận 1 callback để xử lý kết quả ghi âm.
//Khi bắt đầu ghi âm sẽ đặt callback vào store
//Khi có callback thì sẽ hiển thị hình minh họa thể hiện đang ghi âm
//Khi kết thúc ghi ăm sẽ từ store để lấy callback vừa set đẻ truyền kết quả ghi âm vào callback đó
export const startRecording = async (
  callback: (result: AudioType | null) => void
) => {
  try {
    const permission = await Audio.requestPermissionsAsync();
    if (!permission.granted) {
      throw new Error("Permission to access microphone is required");
    }

    await Audio.setAudioModeAsync({
      allowsRecordingIOS: true,
      playsInSilentModeIOS: true,
    });

    recording = new Audio.Recording();
    await recording.prepareToRecordAsync(
      Audio.RECORDING_OPTIONS_PRESET_HIGH_QUALITY
    );

    //Cài callback khi dừng ghi âm
    const setCallBack = recordingStore.getState().setOnRecording;
    setCallBack(callback);

    await recording.startAsync();
    console.log("🔴 Recording started");
  } catch (err) {
    console.error("Failed to start recording", err);
  }
};

export const stopRecording = async (getResult: boolean = true) => {
  try {
    if (!recording) return;

    await recording.stopAndUnloadAsync();
    const uri = recording.getURI();
    console.log("✅ Recording stopped. File saved at:", uri);

    // Trả đoạn ghi âm về vào tham số của callback khi start ghi âm
    const { onRecording, setOnRecording } = recordingStore.getState();
    getResult &&
      onRecording &&
      onRecording?.({
        uri,
        duration: (await recording.getStatusAsync()).durationMillis,
      });
    setOnRecording(null);

    // return {
    //   uri,
    //   duration: (await recording.getStatusAsync()).durationMillis,
    // };
  } catch (err) {
    console.error("Failed to stop recording", err);
  }
};
