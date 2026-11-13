import React from "react";
import { Pressable, Vibration, ViewStyle } from "react-native";

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
    if (isVibration) Vibration.vibrate([0, 40]); // rung ngắn khi nhấn giữ

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


