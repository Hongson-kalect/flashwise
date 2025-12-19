import React from "react";
import { Pressable, StyleSheet, ViewStyle } from "react-native";

interface AppPressableProps {
  children: React.ReactNode;
  className?: string;
  onPress?: () => void;
  onLongPress?: () => void;
  isVibration?: boolean;
  touchColor?: string | null;
  isDisabled?: boolean;
  style?: ViewStyle;
  hitSlop?:
    | number
    | { top?: number; bottom?: number; left?: number; right?: number };
}

export const AppPressable = ({
  children,
  onPress,
  onLongPress,
  isVibration,
  style,
  className,
  hitSlop,
  ...props
}: AppPressableProps) => {
  const handleLongPress = () => {
    // TODO: Vibration
    // isVibration && Vibration.vibrate([100, 50, 100]);

    onLongPress && onLongPress();
  };
  return (
    <Pressable
      className={className}
      onPress={onPress}
      onLongPress={handleLongPress}
      style={style}
      hitSlop={hitSlop || 5}
      android_ripple={{
        color: "#00000010",
      }}
    >
      {children}
    </Pressable>
  );
};

const styles = StyleSheet.create({
  default: {
    padding: 8,
    borderRadius: 8,
  },
  pressed: {
    opacity: 0.6,
  },
});
