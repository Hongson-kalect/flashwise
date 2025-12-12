import { useTheme } from "@/providers/Theme";
import React, { useState } from "react";
import { Pressable, View } from "react-native";
import { Divider } from "react-native-paper";
import Animated, {
  LinearTransition,
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
    <View className="">
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
      <Animated.View style={[animatedStyle]}>
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

export const SubCollapseSection = ({
  title,
  children,
  defaultExpanded = false,
}: {
  title: string | React.ReactNode;
  children: React.ReactNode;
  defaultExpanded?: boolean;
}) => {
  const { theme } = useTheme();

  // React state điều khiển mount/unmount
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);

  // Reanimated cho animation
  const progress = useSharedValue(defaultExpanded ? 1 : 0);

  const toggle = () => {
    const next = !isExpanded;
    setIsExpanded(next);

    progress.value = withTiming(next ? 1 : 0, { duration: 250 });
  };

  const arrowStyle = useAnimatedStyle(() => ({
    transform: [{ rotateZ: `${progress.value * 90}deg` }],
  }));

  return (
    <View>
      {/* Header */}
      <Pressable
        onPress={toggle}
        style={{
          paddingHorizontal: 4,
          paddingVertical: 10,
        }}
        className="flex-row items-center justify-between"
      >
        <View className="flex-1">
          <AppText
            numberOfLines={1}
            size={"sm"}
            color="subText1"
            font="MulishRegularItalic"
          >
            {title}
          </AppText>
        </View>

        <Animated.View style={arrowStyle}>
          <AppIcon name="chevron-right" branch="feather" size={18} />
        </Animated.View>
      </Pressable>

      {/* Content */}
      {isExpanded && (
        <Animated.View
          layout={LinearTransition.duration(250)}
          // entering={FadeIn.duration(180)}
          // exiting={FadeOut.duration(180)}
          style={{ paddingLeft: 4 }}
        >
          <Divider />
          {children}
        </Animated.View>
      )}
    </View>
  );
};
