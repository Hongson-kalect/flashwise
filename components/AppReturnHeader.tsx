import { useAppNavigation } from "@/hooks/useNavigation";
import { StyleSheet, TouchableOpacity, View } from "react-native";
import AppIcon from "./AppIcon";
import AppText from "./AppText";

interface AppReturnHeaderProps {
  title: string;
  rightElement?: React.ReactElement;
}

const AppReturnHeader = ({ rightElement, title }: AppReturnHeaderProps) => {
  const { routerBack } = useAppNavigation();

  return (
    <View className="flex-row items-center h-14 justify-between px-2 w-full gap-4">
      <TouchableOpacity onPress={routerBack} style={styles.leftElement}>
        <AppIcon branch="feather" name="chevron-left" size={24} />
        <View className="flex-1">
          <AppText numberOfLines={1} weight="700" size={"xl"}>
            {title || "Return"}
          </AppText>
        </View>
      </TouchableOpacity>
      {rightElement && rightElement}
    </View>
  );
};

const styles = StyleSheet.create({
  leftElement: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    // justifyContent: "",
  },
});

export default AppReturnHeader;
