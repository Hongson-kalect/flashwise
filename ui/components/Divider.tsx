import { DimensionValue, StyleProp, View, ViewStyle } from "react-native";
import { useUITheme } from "../theme/ThemeProvider";
import { TokenKey } from "../tokens";

type Props = {
  height?: number;
  width?: DimensionValue;
  /** Màu theo token; mặc định border. */
  tone?: TokenKey;
  style?: StyleProp<ViewStyle>;
};

const Divider = ({ height = 1, width = "100%", tone = "border", style }: Props) => {
  const { theme } = useUITheme();
  return <View style={[{ height, width, backgroundColor: theme[tone] }, style]} />;
};

export default Divider;
