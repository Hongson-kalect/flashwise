import { Divider, TokenKey } from "@/ui";
import { DimensionValue, StyleProp, ViewStyle } from "react-native";

type Props = {
  height?: number;
  width?: DimensionValue;
  /** Cũ: màu theo loại (primary, secondary...). Mặc định màu viền theo theme. */
  type?: "primary" | "secondary" | "success" | "error" | "warning";
  style?: StyleProp<ViewStyle>;
};

export const AppDivider = ({ height, width, type, style }: Props) => (
  <Divider
    height={height ?? 1}
    width={width}
    tone={(type as TokenKey) ?? "border"}
    style={style}
  />
);
