import { Pressable, StyleProp, View, ViewStyle } from "react-native";
import { useUITheme } from "../theme/ThemeProvider";

type Props = {
  children: React.ReactNode;
  onPress?: () => void;
  style?: StyleProp<ViewStyle>;
  /** Bỏ đệm mặc định (card chứa ảnh tràn viền, danh sách...). */
  flush?: boolean;
  /** tint: nền xanh nhạt cho card nhấn nhẹ. */
  tone?: "card" | "tint";
};

/** Khung nội dung: nền card + viền mảnh, bo 20, không bóng (tách lớp bằng màu + viền). */
const Card = ({ children, onPress, style, flush, tone = "card" }: Props) => {
  const { theme } = useUITheme();
  const box: ViewStyle = {
    backgroundColor: tone === "tint" ? theme.primary + "14" : theme.card,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: tone === "tint" ? theme.primary + "30" : theme.border,
    padding: flush ? 0 : 16,
    overflow: "hidden",
  };
  if (onPress) {
    return (
      <Pressable
        onPress={onPress}
        android_ripple={{ color: theme.primary + "14" }}
        style={({ pressed }) => [box, { opacity: pressed ? 0.92 : 1 }, style]}
      >
        {children}
      </Pressable>
    );
  }
  return <View style={[box, style]}>{children}</View>;
};

export default Card;
