import React from "react";
import { Pressable, StyleSheet } from "react-native";

interface AppPressableProps {
  children: React.ReactNode;
  onPress?: () => void;
  style?: any;
}

export const AppPressable = ({
  children,
  onPress,
  style,
}: AppPressableProps) => {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.default,
        style,
        pressed && styles.pressed,
      ]}
      android_ripple={{ color: "#ddd" }}
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
