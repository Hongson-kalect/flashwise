import AppText from "@/components/AppText";
import { useTheme } from "@/providers/Theme";
import { View } from "react-native";

const WordItem = () => {
  const { theme } = useTheme();
  return (
    <View
      style={{ elevation: 6, backgroundColor: theme.background }}
      className="flex-row items-center justify-between rounded-lg overflow-hidden gap-4"
    >
      <View className="h-20 w-20 bg-red-400"></View>
      <View className="flex-1">
        <AppText weight="bold" size={"md"}>
          Từ mới nè
        </AppText>
        <AppText size={"xs"} color="subText3">
          /Phát âm nè/
        </AppText>
        <AppText size={"sm"} color="subText2">
          Loại: Động từ
        </AppText>
      </View>
    </View>
  );
};

export default WordItem;
