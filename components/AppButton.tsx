import { useTheme } from "@/providers/Theme";
import React, { useRef } from "react";
import { Animated, Pressable, ViewStyle } from "react-native";
import AppText from "./AppText";

type Props = {
  title: string;
  onPress: () => void;
  type: "primary" | "secondary" | "success" | "error" | "warning";
  style?: ViewStyle;
  children?: React.ReactNode;
  height?: number;
  width?: number;
};

const AnimatedButton = ({
  title,
  onPress,
  style,
  type,
  children,
  height,
  width,
}: Props) => {
  const { theme } = useTheme();
  const scale = useRef(new Animated.Value(1)).current;

  const onPressIn = () => {
    Animated.spring(scale, {
      toValue: 0.97,
      useNativeDriver: true,
      speed: 30,
      bounciness: 5,
    }).start();
  };

  const onPressOut = () => {
    Animated.spring(scale, {
      toValue: 1,
      useNativeDriver: true,
      speed: 30,
      bounciness: 5,
    }).start();
  };

  return (
    <Animated.View
      style={[
        {
          transform: [{ scale }],
          shadowColor: "#000",
          shadowOffset: { width: 1, height: 3 },
          shadowOpacity: 0.2,
          shadowRadius: 4,
          elevation: 6,

          backgroundColor: theme[type || "primary"],
        },
        style,
      ]}
    >
      <Pressable
        onPress={onPress}
        onPressIn={onPressIn}
        onPressOut={onPressOut}
        style={{
          paddingVertical: 12,
          paddingHorizontal: 20,
          borderRadius: 8,
          alignItems: "center",
          justifyContent: "center",
          minWidth: 64,
          height: height || 48,
          width: width || "100%",
          backgroundColor: theme[type || "primary"],
        }}
      >
        {children || <AppText color="constract">{title}</AppText>}
      </Pressable>
    </Animated.View>
  );
};

export default AnimatedButton;
