import { useTheme } from "@/providers/Theme";
import { TouchableOpacity, View } from "react-native";
import AppIcon from "../AppIcon";

type Props = {
  isOptionSound: boolean;
};
const CardOption = (props: Props) => {
  const { theme } = useTheme();
  return (
    <View className="flex-row items-center justify-between px-4 h-12">
      {props.isOptionSound ? (
        <TouchableOpacity
          style={{ backgroundColor: theme.primary }}
          onPress={() => alert("hello")}
          className="h-12 w-12 rounded-lg items-center justify-center"
        >
          <AppIcon branch="feather" color="white" size={16} name={"volume-2"} />
        </TouchableOpacity>
      ) : (
        <View></View>
      )}

      <View className="flex-row gap-2 justify-end">
        <View className="bg-gray-200 h-8 w-8 rounded-lg items-center justify-center">
          <AppIcon
            color="subText3"
            branch="feather"
            size={16}
            name={"arrow-left"}
          />
        </View>
        <View className="bg-gray-200 h-8 w-8 rounded-lg items-center justify-center">
          <AppIcon
            color="subText3"
            branch="feather"
            size={16}
            name={"arrow-right"}
          />
        </View>
        <View className="bg-gray-200 h-8 w-8 rounded-lg items-center justify-center">
          <AppIcon color="subText3" branch="feather" size={16} name={"save"} />
        </View>
      </View>
    </View>
  );
};

export default CardOption;
