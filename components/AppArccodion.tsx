import { useTheme } from "@/providers/Theme";
import React, { useEffect, useState } from "react";
import { StyleSheet, TouchableOpacity, View } from "react-native";
import Animated, {
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import AppIcon from "./AppIcon";
import AppTitle from "./AppTitle";

type Size = "lg" | "md" | "sm";

interface ArccodionProps {
  title: string;
  children: React.ReactNode;
  size?: Size;
  titleColor?: string;
}

const fontSizeMap: Record<Size, number> = {
  lg: 28,
  md: 24,
  sm: 16,
};

export const Arccodion: React.FC<ArccodionProps> = ({
  title,
  children,
  size = "md",
  titleColor,
}) => {
  const { theme } = useTheme();
  const [open, setOpen] = useState(false);

  const progress = useSharedValue(0);

  useEffect(() => {
    progress.value = withTiming(open ? 1 : 0, {
      duration: open ? 300 : 400,
    });
  }, [open]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scaleY: progress.value }],
    opacity: interpolate(progress.value, [0, 0.2, 1], [0, 0.3, 1]),
  }));

  return (
    <View style={styles.container}>
      <TouchableOpacity
        onPress={() => setOpen(!open)}
        style={[
          styles.header,
          {
            borderBottomWidth: 3,
            borderColor: theme.title + (open ? "ff" : "66"),
            backgroundColor: theme.background,
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
          },
        ]}
      >
        <AppTitle
          title={title}
          style={{
            fontSize: fontSizeMap[size],
            color: titleColor ?? theme.title,
          }}
        />
        <AppIcon
          name={open ? "chevron-down" : "chevron-right"}
          branch="feather"
          size={24}
          color={theme.title}
        />
      </TouchableOpacity>

      <Animated.View style={[styles.contentContainer, animatedStyle]}>
        <View style={styles.innerContent}>{children}</View>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    overflow: "hidden",
  },
  header: {
    paddingTop: 6,
    paddingBottom: 2,
  },
  contentContainer: {
    overflow: "hidden",
    transformOrigin: "top", // quan trọng với scaleY
  },
  innerContent: {
    paddingTop: 8,
  },
});
