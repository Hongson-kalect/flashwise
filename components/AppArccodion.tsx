import { useTheme } from "@/providers/Theme";
import React, { useEffect, useRef, useState } from "react";
import {
  Animated,
  Easing,
  Pressable,
  StyleSheet,
  TouchableOpacity,
  View,
  ViewStyle,
} from "react-native";
import { Divider } from "react-native-paper";
import AppIcon from "./AppIcon";
import AppText from "./AppText";
import AppTitle from "./AppTitle";

type AccordionSize = "sm" | "md" | "lg";

interface IAccordion {
  title: string | React.ReactNode;
  // style?: ViewStyle;
  children: React.ReactNode;
  style?: ViewStyle;
  size?: AccordionSize;
  onToggle?: (state: boolean) => void;
}

const fontSizeMap: Record<AccordionSize, number> = {
  sm: 16,
  md: 20,
  lg: 24,
};

const Accordion = ({
  title,
  children,
  style,
  size = "md",
  onToggle,
}: IAccordion) => {
  const { theme } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const animationController = useRef(new Animated.Value(0)).current;

  // Lấy maxHeight từ props hoặc giá trị mặc định lớn
  const maxHeight = useRef(new Animated.Value(0)).current;

  // Xử lý transform icon
  const arrowTransform = animationController.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "90deg"],
  });

  // maxHeightAnim
  const maxHeightAnim = animationController.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 500], // Đặt một giá trị lớn, ví dụ 500
  });

  const toggle = () => {
    const toValue = isOpen ? 0 : 1;
    setIsOpen(!isOpen);

    Animated.timing(animationController, {
      toValue,
      duration: 300,
      easing: Easing.out(Easing.ease),
      useNativeDriver: false,
    }).start();
  };

  useEffect(() => {
    onToggle?.(isOpen);
  }, [isOpen]);

  return (
    <View
      style={[
        styles.accordion,
        {
          borderWidth: 0.5,
          // elevation: 1,
          // paddingBottom: 8,
          backgroundColor: theme.background,
          borderRadius: 8,
          overflow: "hidden",
          borderColor: isOpen ? theme.primary : theme.background,
        },
        style,
      ]}
    >
      {/* Header */}
      {typeof title === "string" ? (
        <Pressable
          onPress={toggle}
          style={{
            paddingHorizontal: 12,
            paddingVertical: 12,
            // backgroundColor: theme.primary,
            // elevation: 2,
          }}
          className="flex-row items-center justify-between"
        >
          <View className="flex-1">
            <AppText size={"lg"} font="MulishSemiBold" color={"title"}>
              {title}
            </AppText>
          </View>
          <Animated.View style={{ transform: [{ rotateZ: arrowTransform }] }}>
            <AppIcon
              name="chevron-right"
              branch="feather"
              size={fontSizeMap[size] + 4}
              color={theme.title}
            />
          </Animated.View>
        </Pressable>
      ) : (
        <TouchableOpacity
          onPress={toggle}
          activeOpacity={0.8}
          style={[
            styles.header,
            {
              borderColor: theme.title + (isOpen ? "ff" : "66"),
              backgroundColor: theme.background,
              borderBottomWidth: fontSizeMap[size] / 8,
            },
          ]}
        >
          <AppTitle
            title={title}
            style={{
              fontSize: fontSizeMap[size],
              color: theme.title,
            }}
          />
          <Animated.View style={{ transform: [{ rotateZ: arrowTransform }] }}>
            <AppIcon
              name="chevron-right"
              branch="feather"
              size={fontSizeMap[size] + 4}
              color={theme.title}
            />
          </Animated.View>
        </TouchableOpacity>
      )}

      {/* Content */}
      <Animated.View style={{ maxHeight: maxHeightAnim, overflow: "hidden" }}>
        {isOpen && <Divider style={{ marginBottom: 12 }} />}
        <View style={styles.contentContainer}>{children}</View>
      </Animated.View>
    </View>
  );
};

export default Accordion;

const styles = StyleSheet.create({
  accordion: {
    // borderRadius: 8,
    overflow: "hidden",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  contentContainer: {
    // position: "absolute", // Nội dung không chiếm chỗ làm layout rung
    width: "100%",
    left: 0,
    right: 0,
    top: 0,
  },
});
