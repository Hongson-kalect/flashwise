import AppIcon from "@/components/AppIcon";
import { useTheme } from "@/providers/Theme";
import { pickAudio } from "@/utils/pickaudio";
import { DocumentPickerAsset } from "expo-document-picker";
import { TouchableOpacity } from "react-native";

type Props = {
  onAudioChange: (result: DocumentPickerAsset) => void;
};
const AudioPicker = ({ onAudioChange }: Props) => {
  const { theme } = useTheme();

  const handlePickAudio = async () => {
    const result = await pickAudio();
    if (result) {
      onAudioChange(result);
    }
  };

  return (
    <TouchableOpacity
      onPress={handlePickAudio}
      style={{ backgroundColor: theme.secondary }}
      className="h-16 w-16 rounded-lg items-center justify-center"
    >
      <AppIcon name={"folder1"} branch="antd" color="white" size={32} />
    </TouchableOpacity>
  );
};

export default AudioPicker;
