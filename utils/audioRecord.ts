import { Audio } from "expo-av";

let recording: Audio.Recording | null = null;

export const startRecording = async () => {
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
    await recording.startAsync();
    console.log("🔴 Recording started");
  } catch (err) {
    console.error("Failed to start recording", err);
  }
};

export const stopRecording = async () => {
  try {
    if (!recording) return;

    await recording.stopAndUnloadAsync();
    const uri = recording.getURI();
    console.log("✅ Recording stopped. File saved at:", uri);

    return {
      uri,
      duration: (await recording.getStatusAsync()).durationMillis,
    };
  } catch (err) {
    console.error("Failed to stop recording", err);
  }
};
