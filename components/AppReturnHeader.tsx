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
    <View className="flex-row items-center h-14 justify-between px-2 w-full">
      <TouchableOpacity onPress={routerBack} style={styles.leftElement}>
        <AppIcon branch="feather" name="chevron-left" size={24} />
        <AppText weight="700" size={"xl"}>
          {title || "Return"}
        </AppText>
      </TouchableOpacity>
      {rightElement && rightElement}
    </View>
  );
};

const styles = StyleSheet.create({
  leftElement: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    // justifyContent: "",
  },
});

export default AppReturnHeader;
