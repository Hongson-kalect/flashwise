import React from "react";
import { Pressable, View } from "react-native";
import { useUITheme } from "../theme/ThemeProvider";
import { TokenKey } from "../tokens";
import Text from "./Text";

type Props = {
  label: string;
  onPress?: () => void;
  /** Màu theo token; mặc định primary. */
  color?: TokenKey;
  /** true: nền đặc (đang chọn). */
  selected?: boolean;
  /** Icon tuỳ ý đặt trước chữ (kit không ràng buộc bộ icon nào). */
  icon?: React.ReactNode;
  size?: "sm" | "md";
};

/** Viên thuốc nhỏ: tag, bộ lọc, bản dịch ngắn. */
const Chip = ({ label, onPress, color = "primary", selected, icon, size = "md" }: Props) => {
  const { theme } = useUITheme();
  const base = theme[color];
  const body = (
    <View
      className="flex-row items-center gap-1.5 rounded-full"
      style={{
        paddingHorizontal: size === "sm" ? 10 : 14,
        paddingVertical: size === "sm" ? 3 : 6,
        backgroundColor: selected ? base : base + "18",
      }}
    >
      {icon}
      <Text
        size={size === "sm" ? "xs" : "sm"}
        weight="semibold"
        style={{ color: selected ? theme.constract : base }}
      >
        {label}
      </Text>
    </View>
  );
  return onPress ? (
    <Pressable onPress={onPress} hitSlop={6}>
      {body}
    </Pressable>
  ) : (
    body
  );
};

export default Chip;
