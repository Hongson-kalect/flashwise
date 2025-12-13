import AppIcon from "@/components/AppIcon";
import { scaleSize } from "@/components/PhatAm";
import { useTheme } from "@/providers/Theme";
import { pickAudio } from "@/utils/pickaudio";
import { DocumentPickerAsset } from "expo-document-picker";
import { TouchableOpacity } from "react-native";

type Props = {
  size: "tiny" | "small" | "medium" | "large";
  onAudioChange: (result: DocumentPickerAsset) => void;
};
const AudioPicker = ({ onAudioChange, size = "small" }: Props) => {
  const { theme } = useTheme();
  const { width, icon } = scaleSize[size];

  const handlePickAudio = async () => {
    const result = await pickAudio();
    if (result) {
      onAudioChange(result);
    }
  };

  return (
    <TouchableOpacity
      onPress={handlePickAudio}
      hitSlop={10}
      style={{ backgroundColor: theme.secondary, width: width, height: width }}
      className="rounded-lg items-center justify-center"
    >
      <AppIcon name={"folder1"} branch="antd" color="white" size={icon} />
    </TouchableOpacity>
  );
};

export default AudioPicker;
