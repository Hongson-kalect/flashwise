import { FontFamily } from "@/configs/fonts";
import { textSizes } from "@/configs/size";
import { useTheme } from "@/providers/Theme";
import { LayoutChangeEvent, StyleProp, Text, TextStyle } from "react-native";

type Props = {
  children: React.ReactNode;
  font?: FontFamily;
  style?: StyleProp<TextStyle>;
  className?: string;
  size?: "xs" | "sm" | "md" | "lg" | "xl" | "2xl" | "3xl" | number;
  color?:
    | "title"
    | "constract"
    | "primary"
    | "secondary"
    | "tertiary"
    | "text"
    | "success"
    | "error"
    | "warning"
    | "link"
    | "subText1"
    | "subText2"
    | "subText3"
    | "white"
    | "disabled";

  numberOfLines?: number;
  onLayout?: (event: LayoutChangeEvent) => void;
  ellipsizeMode?: "head" | "middle" | "tail" | "clip";
  textAlign?: "left" | "center" | "right" | "justify";
};

const AppText = ({
  children,
  style,
  color,
  font = "MulishRegular",
  ...props
}: Props) => {
  const { theme } = useTheme();
  const fontSize =
    typeof props.size === "number" ? props.size : textSizes[props.size || "md"];

  return (
    <Text
      className={props.className}
      style={[
        {
          color: theme[color || "text"],
          fontFamily: font,
          fontSize: fontSize,
          // fontWeight: "bold",
          lineHeight: fontSize * 1.3, // Adjust line height based on font size
        },
        style,
      ]}
      {...props}
    >
      {children}
    </Text>
  );
};

export default AppText;
