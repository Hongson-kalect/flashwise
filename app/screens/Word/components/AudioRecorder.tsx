import AppIcon from "@/components/AppIcon";
import { useTheme } from "@/providers/Theme";
import { TouchableOpacity } from "react-native";

const AudioRecoder = () => {
  const { theme } = useTheme();
  return (
    <TouchableOpacity
      onPress={() => alert("record nè")}
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
