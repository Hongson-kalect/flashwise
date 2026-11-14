import React from "react";
import { StyleProp, Text as RNText, TextProps, TextStyle } from "react-native";
import { FontWeightKey } from "../config";
import { useUITheme } from "../theme/ThemeProvider";
import { TokenKey } from "../tokens";
import {
  fontStyleFor,
  lineHeightFor,
  Opacity,
  OpacityKey,
  TextSize,
  TextSizeKey,
} from "../typography";

export type UITextProps = TextProps & {
  /** Cỡ theo thang (md, xl, 2xl...) hoặc số px. */
  size?: TextSizeKey | number;
  weight?: FontWeightKey;
  /** Tên font cụ thể (ghi đè weight): giữ cho code cũ dùng font="MulishBold". */
  font?: string;
  /** Token màu; "white" = trắng tinh cho chữ trên nền màu (gradient, ảnh). */
  color?: TokenKey | "white";
  opacity?: OpacityKey;
  textAlign?: TextStyle["textAlign"];
  className?: string;
  style?: StyleProp<TextStyle>;
};

/**
 * Chữ chuẩn của app: màu lấy từ token (đổi theo sáng/tối), cỡ + độ đậm theo thang chung.
 *   <Text size="xl" weight="bold" color="title">Xin chào</Text>
 */
const Text = ({
  size = "md",
  weight = "regular",
  font,
  color = "text",
  opacity,
  textAlign,
  style,
  ...rest
}: UITextProps) => {
  const { theme } = useUITheme();
  const metrics =
    typeof size === "number"
      ? { fontSize: size, lineHeight: lineHeightFor(size) }
      : TextSize[size];

  return (
    <RNText
      // Chặn cỡ chữ hệ thống phóng quá 1,15 lần: lineHeight cố định nên chữ phóng to dễ bị cắt, giao diện thấy to và ngợp
      maxFontSizeMultiplier={1.15}
      {...rest}
      style={[
        font ? { fontFamily: font } : fontStyleFor(weight),
        metrics,
        { color: color === "white" ? "#FFFFFF" : theme[color] },
        opacity ? { opacity: Opacity[opacity] } : null,
        textAlign ? { textAlign } : null,
        style,
      ]}
    />
  );
};

export default React.memo(Text);
