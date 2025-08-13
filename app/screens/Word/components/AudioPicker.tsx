import AppIcon from "@/components/AppIcon";
import { useTheme } from "@/providers/Theme";
import { TouchableOpacity } from "react-native";

const AudioPicker = () => {
  const { theme } = useTheme();
  return (
    <TouchableOpacity
      onPress={() => alert("chọn nhạc nè")}
      style={{ backgroundColor: theme.secondary }}
      className="h-16 w-16 rounded-lg items-center justify-center"
    >
      <AppIcon name={"folder1"} branch="antd" color="white" size={32} />
    </TouchableOpacity>
  );
};

export default AudioPicker;
