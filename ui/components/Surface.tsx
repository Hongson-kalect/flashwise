import { View, ViewProps } from "react-native";
import { useUITheme } from "../theme/ThemeProvider";
import { TokenKey } from "../tokens";

export type SurfaceProps = ViewProps & {
  /** Màu nền theo token (mặc định background). */
  tone?: TokenKey;
  className?: string;
};

/** View có nền theo token; thay cho <View style={{ backgroundColor: theme.xxx }}>. */
const Surface = ({ tone = "background", style, ...rest }: SurfaceProps) => {
  const { theme } = useUITheme();
  return <View {...rest} style={[{ backgroundColor: theme[tone] }, style]} />;
};

export default Surface;
