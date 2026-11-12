import { useTheme } from "@/providers/Theme";
import React from "react";
import { Pressable, StyleProp, TextStyle, ViewStyle } from "react-native";

// Icon libraries
import AntDesign from "@expo/vector-icons/AntDesign";
import Feather from "@expo/vector-icons/Feather";
import FontAwesome6 from "@expo/vector-icons/FontAwesome6";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";

const iconBranchMap = {
  antd: AntDesign,
  feather: Feather,
  mui: MaterialIcons,
  fa6: FontAwesome6,
};

type IconBranch = keyof typeof iconBranchMap;

type IconNameMap = {
  antd: keyof typeof AntDesign.glyphMap;
  feather: keyof typeof Feather.glyphMap;
  mui: keyof typeof MaterialIcons.glyphMap;
  fa6: keyof typeof FontAwesome6.glyphMap;
};

type AppIconProps<B extends IconBranch = "antd"> = {
  branch: B;
  name: IconNameMap[B];
  size?: number;
  color?: keyof ReturnType<typeof useTheme>["theme"] | string;
  onPress?: () => void;
  style?: StyleProp<ViewStyle | TextStyle>;
};

const AppIcon = <B extends IconBranch>({
  branch,
  name,
  size = 24,
  color = "text",
  onPress,
  style,
}: AppIconProps<B>) => {
  const { theme } = useTheme();
  const IconComponent = iconBranchMap[branch] as React.ComponentType<any>;

  const icon = (
    <IconComponent
      name={name}
      size={size}
      color={theme[color as keyof typeof theme] || color}
      style={style}
      // FontAwesome6 mặc định vẽ kiểu regular, bản miễn phí thiếu hầu hết glyph (book, pen, quote-left...) nên hiện ô vuông
      {...(branch === "fa6" ? { solid: true } : null)}
    />
  );

  // Icon tĩnh không cần Pressable bọc ngoài (đỡ 1 view native + touch handler mỗi icon).
  if (!onPress) return icon;

  return (
    <Pressable hitSlop={10} onPress={onPress}>
      {icon}
    </Pressable>
  );
};

export default React.memo(AppIcon) as typeof AppIcon;
