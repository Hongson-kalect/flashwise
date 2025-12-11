import { useTheme } from "@/providers/Theme";
import React, { useState } from "react";
import { Pressable, View } from "react-native";
import { Divider } from "react-native-paper";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import AppIcon from "./AppIcon";
import AppText from "./AppText";

export default function CollapseSection({
  title,
  children,
  defaultExpanded = false,
}: {
  title: string | React.ReactNode;
  children: React.ReactNode;
  defaultExpanded?: boolean;
}) {
  const { theme } = useTheme();

  const [contentHeight, setContentHeight] = useState(0);
  const expanded = useSharedValue(defaultExpanded ? 1 : 0);

  const toggle = () => {
    expanded.value = withTiming(expanded.value === 1 ? 0 : 1, {
      duration: 250,
    });
  };

  // Height animation
  const animatedStyle = useAnimatedStyle(() => ({
    height: contentHeight * expanded.value,
    overflow: "hidden",
  }));

  // Arrow rotation
  const arrowStyle = useAnimatedStyle(() => ({
    transform: [
      {
        rotateZ: `${expanded.value * 90}deg`,
      },
    ],
  }));

  return (
    <View>
      {/* Header */}
      <Pressable
        onPress={toggle}
        style={{
          paddingHorizontal: 4,
          paddingVertical: 12,
        }}
        className="flex-row items-center justify-between"
      >
        <View className="flex-1">
          <AppText size="lg" font="MulishSemiBold" color="title">
            {title}
          </AppText>
        </View>

        <Animated.View style={arrowStyle}>
          <AppIcon
            name="chevron-right"
            branch="feather"
            size={24}
            color={theme.title}
          />
        </Animated.View>
      </Pressable>

      {/* Content wrapper */}
      <Animated.View style={[animatedStyle, { paddingHorizontal: 4 }]}>
        <View
          style={{ position: "absolute", width: "100%" }}
          onLayout={(e) => setContentHeight(e.nativeEvent.layout.height)}
        >
          <Divider />
          {children}
        </View>
      </Animated.View>
    </View>
  );
}
