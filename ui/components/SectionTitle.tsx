import React from "react";
import { View } from "react-native";
import Text from "./Text";

/** Tiêu đề nhóm nội dung: chữ hoa nhỏ, giãn chữ, có chỗ cho nút "Xem tất cả" bên phải. */
const SectionTitle = ({
  title,
  right,
}: {
  title: string;
  right?: React.ReactNode;
}) => (
  <View className="mb-3 flex-row items-center justify-between px-1">
    <Text
      size="xs"
      weight="extrabold"
      opacity="medium"
      style={{ letterSpacing: 1.2, textTransform: "uppercase" }}
    >
      {title}
    </Text>
    {right}
  </View>
);

export default SectionTitle;
