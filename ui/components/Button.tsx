import React, { useRef } from "react";
import {
  ActivityIndicator,
  Animated,
  Pressable,
  View,
  ViewStyle,
} from "react-native";
import { haptic } from "../feedback";
import { useUITheme } from "../theme/ThemeProvider";
import { TokenKey } from "../tokens";
import Text from "./Text";

type Size = "xs" | "sm" | "md" | "lg" | "xl";
const SIZES: Record<Size, { px: number; py: number; font: number }> = {
  xs: { px: 12, py: 4, font: 12 },
  sm: { px: 14, py: 7, font: 14 },
  md: { px: 16, py: 10, font: 16 },
  lg: { px: 18, py: 12, font: 18 },
  xl: { px: 24, py: 14, font: 20 },
};

export type ButtonType =
  | "primary"
  | "secondary"
  | "success"
  | "error"
  | "warning"
  | "white"
  | "disabled";

type Props = {
  onPress: () => void;
  title?: string;
  size?: Size;
  type?: ButtonType;
  /** solid: nền đặc. soft: nền nhạt, chữ màu. outline: chỉ viền. ghost: không nền. */
  variant?: "solid" | "soft" | "outline" | "ghost";
  /** Cũ: outline={true} = variant "outline". */
  outline?: boolean;
  style?: ViewStyle;
  containerStyle?: ViewStyle;
  /** Thay cho title: icon + chữ tự bày. Chữ bên trong tự lấy màu qua prop `color` của Text. */
  children?: React.ReactNode;
  width?: number;
  disabled?: boolean;
  isLoading?: boolean;
};

const TYPE_TOKEN: Record<Exclude<ButtonType, "white">, TokenKey> = {
  primary: "primary",
  secondary: "secondary",
  success: "success",
  error: "error",
  warning: "warning",
  disabled: "disabled",
};

/** Nút chuẩn: bo 14, co nhẹ khi nhấn, rung nhẹ; solid / soft / outline / ghost theo màu `type`. */
const Button = ({
  title,
  onPress,
  style,
  containerStyle,
  size = "md",
  type = "primary",
  variant,
  children,
  outline,
  width,
  disabled,
  isLoading,
}: Props) => {
  const { theme } = useUITheme();
  const scale = useRef(new Animated.Value(1)).current;
  const { px, py, font } = SIZES[size];
  const v = variant ?? (outline ? "outline" : "solid");

  const spring = (to: number) =>
    Animated.spring(scale, {
      toValue: to,
      useNativeDriver: true,
      speed: 40,
      bounciness: 4,
    }).start();

  const base = type === "white" ? theme.card : theme[TYPE_TOKEN[type]];
  const isDisabledType = type === "disabled";
  const solidText = type === "white" ? theme.primary : theme.constract;
  const palette = {
    solid: { bg: base, fg: solidText, border: "transparent" },
    soft: { bg: base + "22", fg: base, border: "transparent" },
    outline: { bg: "transparent", fg: base, border: base },
    ghost: { bg: "transparent", fg: base, border: "transparent" },
  }[v];
  const fg = isDisabledType ? theme.subText2 : palette.fg;

  return (
    <Animated.View
      style={[
        { transform: [{ scale }], width, opacity: disabled ? 0.55 : 1 },
        containerStyle,
      ]}
    >
      <Pressable
        onPress={() => {
          haptic("light");
          onPress();
        }}
        onPressIn={() => spring(0.97)}
        onPressOut={() => spring(1)}
        disabled={disabled || isLoading}
        android_ripple={{ color: "#ffffff22" }}
        hitSlop={8}
        style={[
          {
            paddingVertical: py,
            paddingHorizontal: px,
            borderRadius: 14,
            alignItems: "center",
            justifyContent: "center",
            minWidth: 64,
            backgroundColor: palette.bg,
            borderWidth: v === "outline" ? 1.5 : 0,
            borderColor: palette.border,
          },
          v === "solid" && !isDisabledType && type !== "white"
            ? {
                shadowColor: base,
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.25,
                shadowRadius: 8,
                elevation: 3,
              }
            : null,
          style,
        ]}
      >
        {isLoading && (
          <View className="absolute inset-0 items-center justify-center">
            <ActivityIndicator size="small" color={fg} />
          </View>
        )}
        <View style={{ opacity: isLoading ? 0 : 1 }}>
          {children ? (
            <View className="flex-row items-center gap-2">{children}</View>
          ) : (
            <Text size={font} weight="bold" style={{ color: fg }}>
              {title}
            </Text>
          )}
        </View>
      </Pressable>
    </Animated.View>
  );
};

export default Button;
