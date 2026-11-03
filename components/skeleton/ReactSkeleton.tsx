import { Skeleton } from "@/ui";
import { DimensionValue, StyleProp, ViewStyle } from "react-native";

type Props = {
  width: DimensionValue;
  height: DimensionValue;
  style?: StyleProp<ViewStyle>;
  active?: boolean;
};

/** Giữ tên cũ; thực chất là Skeleton của UI kit (màu theo theme). */
export const SkeletonReact = ({ width = "100%", height = 24, style, active = true }: Props) => (
  <Skeleton width={width} height={height} radius={4} style={style} active={active} />
);
