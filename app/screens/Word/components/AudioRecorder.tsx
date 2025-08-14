import AppIcon from "@/components/AppIcon";
import { useTheme } from "@/providers/Theme";
import { AudioType } from "@/stores/recordingStore";
import { startRecording } from "@/utils/audioRecord";
import { TouchableOpacity } from "react-native";

type Props = {
  onAudioChange: (audio: AudioType | null) => void;
};
const AudioRecoder = ({ onAudioChange }: Props) => {
  const { theme } = useTheme();

  const handleRecording = () => {
    startRecording(handleRecordAudio);
  };

  const handleRecordAudio = (audio: AudioType | null) => {
    if (!audio) return;
    if (audio?.duration && audio?.duration > 5000)
      return alert("Recording must be less than 5 seconds");
    else onAudioChange(audio);
  };

  return (
    <TouchableOpacity
      onPress={handleRecording}
      style={{
        backgroundColor: theme.white,
        elevation: 4,
        shadowColor: theme.secondary,
      }}
      className="h-16 w-16 rounded-lg items-center justify-center"
    >
      <AppIcon
        name={"microphone"}
        branch="fa6"
        color={theme.secondary}
        size={32}
      />
    </TouchableOpacity>
  );
};

export default AudioRecoder;
