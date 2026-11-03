import React, { useEffect } from "react";
import { View } from "react-native";
import Animated, {
  Easing,
  useAnimatedProps,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import Svg, { Circle } from "react-native-svg";
import { useUITheme } from "../theme/ThemeProvider";
import { TokenKey } from "../tokens";

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

type Props = {
  /** 0–100 */
  value: number;
  size?: number;
  strokeWidth?: number;
  /** Màu vòng đã đạt (token); mặc định primary. */
  color?: TokenKey;
  /** Nội dung đặt giữa vòng (số, nhãn...). */
  children?: React.ReactNode;
  duration?: number;
};

/** Vòng tiến độ: cung chạy mượt tới `value`, nền vòng theo token border. */
const ProgressRing = ({
  value,
  size = 96,
  strokeWidth = 10,
  color = "primary",
  children,
  duration = 700,
}: Props) => {
  const { theme } = useUITheme();
  const r = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * r;
  const progress = useSharedValue(0);

  useEffect(() => {
    progress.value = withTiming(Math.max(0, Math.min(100, value)) / 100, {
      duration,
      easing: Easing.out(Easing.cubic),
    });
  }, [value, duration, progress]);

  const arc = useAnimatedProps(() => ({
    strokeDashoffset: circumference * (1 - progress.value),
  }));

  return (
    <View style={{ width: size, height: size }}>
      <Svg width={size} height={size} style={{ transform: [{ rotate: "-90deg" }] }}>
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          stroke={theme.border}
          strokeWidth={strokeWidth}
          fill="none"
        />
        <AnimatedCircle
          cx={size / 2}
          cy={size / 2}
          r={r}
          stroke={theme[color]}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={`${circumference} ${circumference}`}
          animatedProps={arc}
          fill="none"
        />
      </Svg>
      <View
        style={{
          position: "absolute",
          inset: 0,
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {children}
      </View>
    </View>
  );
};

export default ProgressRing;
