import AppIcon from "@/components/AppIcon";
import { scaleSize } from "@/components/PhatAm";
import { useTheme } from "@/providers/Theme";
import { AudioType } from "@/stores/recordingStore";
import { startRecording } from "@/utils/audioRecord";
import { TouchableOpacity } from "react-native";

type Props = {
  size: "tiny" | "small" | "medium" | "large";
  onAudioChange: (audio: AudioType | null) => void;
};
const AudioRecoder = ({ onAudioChange, size = "small" }: Props) => {
  const { theme } = useTheme();
  const { width, icon } = scaleSize[size];

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
        borderWidth: 0.5,
        borderColor: theme.secondary,
        width: width,
        height: width,
      }}
      className="rounded-lg items-center justify-center"
    >
      <AppIcon
        name={"microphone"}
        branch="fa6"
        color={theme.secondary}
        size={icon}
      />
    </TouchableOpacity>
  );
};

export default AudioRecoder;
