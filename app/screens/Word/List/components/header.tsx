import AppIcon from "@/components/AppIcon";
import AppText from "@/components/AppText";
import { useAppNavigation } from "@/hooks/useNavigation";
import { useTheme } from "@/providers/Theme";
import { Pressable, View } from "react-native";

const ListHeader = () => {
  const { routerPush } = useAppNavigation();
  const { theme } = useTheme();

  return (
    <View className="flex-row justify-between items-center h-16">
      <AppText size="3xl" weight="bold" color="title">
        Từ vựng
      </AppText>
      <Pressable
        onPress={() => routerPush("/screens/Word/Create/screen")}
        className="flex-row items-center gap-1.5 h-10 px-4 rounded-full"
        style={{ backgroundColor: theme.primary }}
      >
        <AppIcon name="plus" branch="feather" color="white" size={18} />
        <AppText weight="bold" color="white" size="sm">
          Tìm từ mới
        </AppText>
      </Pressable>
    </View>
  );
};

export default ListHeader;
