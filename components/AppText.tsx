import { textSizes } from "@/configs/size";
import { useTheme } from "@/providers/Theme";
import { StyleProp, Text, TextStyle } from "react-native";

type Props = {
  children: React.ReactNode;
  style?: StyleProp<TextStyle>;
  className?: string;
  size?: "xs" | "sm" | "md" | "lg" | "xl" | number;
  weight?: "100" | "200" | "300" | "400" | "500" | "600" | "700" | "bold";
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
    | "white";

  numberOfLines?: number;
  ellipsizeMode?: "head" | "middle" | "tail" | "clip";
  textAlign?: "left" | "center" | "right" | "justify";
};

const AppText = ({ children, style, color, ...props }: Props) => {
  const { theme } = useTheme();
  const fontSize =
    typeof props.size === "number" ? props.size : textSizes[props.size || "md"];

  return (
    <Text
      className={props.className}
      style={[
        {
          color: theme[color || "text"],
          fontFamily: "SpaceMono, System",
          fontSize: fontSize,
          fontWeight: props.weight || "400",
          lineHeight: fontSize * 1.4, // Adjust line height based on font size
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
