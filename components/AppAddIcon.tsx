import { useTheme } from "@/providers/Theme";
import { Pressable, View } from "react-native";
import AppIcon from "./AppIcon";

type Props = {
  size?: "sm" | "md" | "lg" | "xl" | "2xl";
  onPress?: () => void;
};

const size = {
  sm: 14,
  md: 17,
  lg: 20,
  xl: 23,
  "2xl": 26,
};

const heights = {
  sm: 21,
  md: 28,
  lg: 35,
  xl: 42,
  "2xl": 49,
};
const AppAddIcon = (props: Props) => {
  const { theme } = useTheme();
  const height = heights[props.size || "md"];
  return (
    <Pressable
      hitSlop={{
        top: 8,
        bottom: 8,
        left: 30,
        right: 20,
      }}
      onPress={props.onPress}
      disabled={!props.onPress}
    >
      <View
        className="items-center justify-center rounded-full"
        style={{
          backgroundColor: theme.success,
          height: height,
          width: height,
        }}
      >
        <AppIcon
          name={"plus"}
          branch="antd"
          size={size[props.size || "md"]}
          color="white"
        />
      </View>
    </Pressable>
  );
};

export default AppAddIcon;
