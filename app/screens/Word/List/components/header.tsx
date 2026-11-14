import AppIcon from "@/components/AppIcon";
import AppText from "@/components/AppText";
import { useAppNavigation } from "@/hooks/useNavigation";
import { useTheme } from "@/providers/Theme";
import { Pressable, View } from "react-native";

const ListHeader = () => {
  const { routerPush } = useAppNavigation();
  const { theme } = useTheme();

  return (
    <View className="flex-row justify-between items-center h-14">
      <AppText size="2xl" weight="bold" color="title">
        Từ vựng
      </AppText>
      <Pressable
        onPress={() => routerPush("/screens/Word/Create/screen")}
        className="flex-row items-center gap-1.5 h-9 px-3.5 rounded-full"
        style={{ backgroundColor: theme.primary }}
      >
        <AppIcon name="plus" branch="feather" color="white" size={16} />
        <AppText weight="bold" color="white" size="sm">
          Tìm từ mới
        </AppText>
      </Pressable>
    </View>
  );
};

export default ListHeader;
