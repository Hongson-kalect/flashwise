import { LinearGradient } from "expo-linear-gradient";
import { useEffect } from "react";
import {
  DimensionValue,
  StyleProp,
  StyleSheet,
  View,
  ViewStyle,
} from "react-native";
import Animated, {
  cancelAnimation,
  Easing,
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from "react-native-reanimated";
import { useUITheme } from "../theme/ThemeProvider";

type Props = {
  width?: DimensionValue;
  height?: DimensionValue;
  /** Bo góc (mặc định 8). Dùng height/2 cho hình tròn / viên thuốc. */
  radius?: number;
  style?: StyleProp<ViewStyle>;
  /** false: đứng yên (không shimmer). */
  active?: boolean;
};

/**
 * Khối chờ tải. Màu lấy từ chữ ở độ mờ thấp nên đúng trên mọi nền (card, background) cả sáng lẫn tối;
 * vệt sáng quét ngang chỉ chạy khi active.
 */
export const Skeleton = ({
  width = "100%",
  height = 16,
  radius = 8,
  style,
  active = true,
}: Props) => {
  const { theme, isDark } = useUITheme();
  const t = useSharedValue(-1);

  useEffect(() => {
    if (active) {
      t.value = -1;
      t.value = withRepeat(
        withTiming(1, { duration: 1400, easing: Easing.inOut(Easing.ease) }),
        -1,
        false,
      );
    } else {
      cancelAnimation(t);
    }
    return () => cancelAnimation(t);
  }, [active, t]);

  const sweep = useAnimatedStyle(() => ({
    transform: [{ translateX: interpolate(t.value, [-1, 1], [-220, 220]) }],
  }));

  return (
    <View
      style={[
        {
          width,
          height,
          borderRadius: radius,
          backgroundColor: theme.text + "14",
          overflow: "hidden",
        },
        style,
      ]}
    >
      {active && (
        <Animated.View style={[StyleSheet.absoluteFill, sweep]}>
          <LinearGradient
            colors={[
              "transparent",
              isDark ? "#FFFFFF1A" : "#FFFFFFB3",
              "transparent",
            ]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={StyleSheet.absoluteFill}
          />
        </Animated.View>
      )}
    </View>
  );
};

/** Nhiều dòng chữ chờ: dòng cuối ngắn hơn cho giống đoạn văn. */
export const SkeletonText = ({
  lines = 3,
  lineHeight = 14,
  gap = 8,
}: {
  lines?: number;
  lineHeight?: number;
  gap?: number;
}) => (
  <View style={{ gap }}>
    {Array.from({ length: lines }).map((_, i) => (
      <Skeleton
        key={i}
        height={lineHeight}
        width={i === lines - 1 && lines > 1 ? "62%" : "100%"}
      />
    ))}
  </View>
);

export const SkeletonCircle = ({ size = 40 }: { size?: number }) => (
  <Skeleton width={size} height={size} radius={size / 2} />
);

export default Skeleton;
