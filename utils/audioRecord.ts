import recordingStore, { AudioType } from "@/stores/recordingStore";
import { Audio } from "expo-av";

let recording: Audio.Recording | null = null;

//Nhận 1 callback để xử lý kết quả ghi âm.
//Khi bắt đầu ghi âm sẽ đặt callback vào store
//Khi có callback thì sẽ hiển thị hình minh họa thể hiện đang ghi âm
//Khi kết thúc ghi ăm sẽ từ store để lấy callback vừa set đẻ truyền kết quả ghi âm vào callback đó
export const startRecording = async (
  callback: (result: AudioType | null) => void,
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
    await recording.prepareToRecordAsync({
      android: {
        extension: ".m4a",
        outputFormat: Audio.RECORDING_OPTION_ANDROID_OUTPUT_FORMAT_MPEG_4,
        audioEncoder: Audio.RECORDING_OPTION_ANDROID_AUDIO_ENCODER_AAC,
        sampleRate: 44100,
        numberOfChannels: 2,
        bitRate: 128000,
      },
      ios: {
        extension: ".m4a",
        audioQuality: Audio.RECORDING_OPTION_IOS_AUDIO_QUALITY_HIGH,
        sampleRate: 44100,
        numberOfChannels: 2,
        bitRate: 128000,
        linearPCMBitDepth: 16,
        linearPCMIsBigEndian: false,
        linearPCMIsFloat: false,
      },
      web: {}, // Thêm cái này nếu bạn chạy trên web, hoặc để trống.,
      isMeteringEnabled: true, // BẮT BUỘC phải bật cái này
    });

    let silent = new Date().getTime();

    recording.setOnRecordingStatusUpdate((status) => {
      if (status.canRecord && status.isRecording) {
        const volume = status.metering ?? -160; // Giá trị từ -160 (im lặng) đến 0 (rất lớn)

        const SILENCE_THRESHOLD = -40; // Ngưỡng im lặng (bạn có thể điều chỉnh)

        const time = new Date().getTime();

        if (volume < SILENCE_THRESHOLD && time - silent > 2000) {
          alert("Ngắt để lấy kết quả ghi âm để whsiper " + volume);
        } else if (volume > SILENCE_THRESHOLD) {
          silent = time;
        }
      }
    });

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
