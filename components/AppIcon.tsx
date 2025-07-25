import React from "react";
import { StyleProp, TextStyle, ViewStyle } from "react-native";
import { useTheme } from "@/providers/Theme";

// Icon libraries
import AntDesign from "@expo/vector-icons/AntDesign";
import Feather from "@expo/vector-icons/Feather";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import FontAwesome6 from "@expo/vector-icons/FontAwesome6";

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
  style?: StyleProp<ViewStyle | TextStyle>;
};

const AppIcon = <B extends IconBranch>({
  branch,
  name,
  size = 24,
  color = "text",
  style,
}: AppIconProps<B>) => {
  const { theme } = useTheme();
  const IconComponent = iconBranchMap[branch];

  return (
    <IconComponent
      name={name}
      size={size}
      color={theme[color as keyof typeof theme] || color}
      style={style}
    />
  );
};

export default AppIcon;
