import { buttonSizes } from "@/configs/size";
import { useTheme } from "@/providers/Theme";
import React, { useMemo, useRef } from "react";
import { Animated, Pressable, View, ViewStyle } from "react-native";
import Reanimated, { FadeIn, FadeOut } from "react-native-reanimated";
import AppIcon from "./AppIcon";
import AppText from "./AppText";

type Props = {
  onPress: () => void;
  title?: string;
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  type?: "primary" | "secondary" | "success" | "error" | "warning";
  style?: ViewStyle;
  children?: React.ReactNode;
  height?: number;
  width?: number;
  disabled?: boolean;
  isLoading?: boolean;
};

const AppButton = ({
  title,
  onPress,
  style,
  size = "md",
  type = "primary",
  children,
  height,
  width,
  disabled,
  isLoading,
}: Props) => {
  const { theme } = useTheme();
  const scale = useRef(new Animated.Value(1)).current;
  const { fontSize, px, py } = useMemo(() => {
    return buttonSizes[size];
  }, [size]);

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
          elevation: 6,
          width,
          alignSelf: "flex-start",
        },
        style,
      ]}
    >
      <Pressable
        onPress={onPress}
        onPressIn={onPressIn}
        onPressOut={onPressOut}
        disabled={disabled || isLoading}
        style={{
          shadowColor: "#000",
          shadowOffset: { width: 1, height: 3 },
          shadowOpacity: 0.2,
          elevation: 6,
          paddingVertical: py,
          paddingHorizontal: px,
          borderRadius: 12,
          // flexDirection: "row",
          // gap: 8,
          alignItems: "center",
          justifyContent: "center",
          minWidth: 64,
          // height: height || 48,
          backgroundColor: disabled ? theme.disabled : theme[type || "primary"],
        }}
      >
        {isLoading && (
          <Reanimated.View
            entering={FadeIn}
            exiting={FadeOut}
            className="absolute top-1.5 left-1.5 animate-spin bg-white items-center justify-center rounded-full h-3 w-3"
          >
            <AppIcon branch="feather" name="loader" size={9} color="#888" />
          </Reanimated.View>
        )}
        {/* <Reanimated.View layout={LinearTransition.springify()}> */}

        {children ? (
          <View className="flex-row items-center gap-2">{children}</View>
        ) : (
          <AppText size={size} color="constract">
            {title}
          </AppText>
        )}
        {/* </Reanimated.View> */}
      </Pressable>
    </Animated.View>
  );
};

export default AppButton;
