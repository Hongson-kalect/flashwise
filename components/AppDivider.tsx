import { useTheme } from "@/providers/Theme";
import { DimensionValue, StyleProp, ViewStyle } from "react-native";
import { Divider } from "react-native-paper";

type Props = {
  height?: number;
  width?: DimensionValue;
  type?: "primary" | "secondary" | "success" | "error" | "warning";
  style?: StyleProp<ViewStyle>;
};
export const AppDivider = ({ height, width, type, style }: Props) => {
  const { theme } = useTheme();
  const backgroundColor = type ? theme[type] : "#E0E0E0"; // Default color, can be customized
  return (
    <Divider
      style={[
        {
          height: height || 0.5,
          backgroundColor: backgroundColor,
          width: width || "100%",
          // marginVertical: 10,
        },
        style,
      ]}
    />
  );
};
