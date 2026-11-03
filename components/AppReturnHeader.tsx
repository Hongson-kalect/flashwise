import { useAppNavigation } from "@/hooks/useNavigation";
import { useTheme } from "@/providers/Theme";
import { Pressable, View } from "react-native";
import AppIcon from "./AppIcon";
import AppText from "./AppText";

interface AppReturnHeaderProps {
  title?: string | React.ReactElement;
  rightElement?: React.ReactElement;
}

/** Thanh đầu màn: nút quay lại tròn + tiêu đề + vùng nút bên phải. */
const AppReturnHeader = ({ rightElement, title }: AppReturnHeaderProps) => {
  const { routerBack } = useAppNavigation();
  const { theme } = useTheme();

  return (
    <View className="flex-row items-center h-14 justify-between px-3 w-full gap-3">
      <View className="flex-1 flex-row items-center gap-3">
        <Pressable
          onPress={routerBack}
          hitSlop={8}
          className="h-10 w-10 rounded-full items-center justify-center"
          style={{
            backgroundColor: theme.card,
            borderWidth: 1,
            borderColor: theme.border,
          }}
        >
          <AppIcon branch="feather" name="chevron-left" size={22} color={theme.text} />
        </Pressable>
        <View className="flex-1">
          {title && typeof title !== "string" ? (
            title
          ) : (
            <AppText numberOfLines={1} font="MulishBold" size="xl" color="title">
              {title || "Quay lại"}
            </AppText>
          )}
        </View>
      </View>
      {rightElement}
    </View>
  );
};

export default AppReturnHeader;
