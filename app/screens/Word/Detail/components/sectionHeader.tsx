import AppText from "@/components/AppText";
import AppTitle from "@/components/AppTitle";
import { ReactNode } from "react";
import { Pressable, View } from "react-native";
import { Divider } from "react-native-paper";

type Props = {
  icon: ReactNode;
  title: string;
  /** Có thì hiện "+ Thêm" bên phải (cùng một kiểu cho mọi mục). */
  onAdd?: () => void;
  /** "section": mục chính, có đường kẻ dưới. "sub": mục con trong một mục chính, nhỏ hơn và không đường kẻ. */
  level?: "section" | "sub";
};

/** Tiêu đề mục của trang từ: icon + tên + "+ Thêm". Dùng chung để mọi mục cùng chiều cao, cỡ chữ và kiểu nút. */
const SectionHeader = ({ icon, title, onAdd, level = "section" }: Props) => {
  const sub = level === "sub";
  return (
    <View>
      <View className="flex-row items-center justify-between h-8">
        <View className="flex-row items-center gap-2">
          <View style={{ width: 14, alignItems: "center" }}>{icon}</View>
          {sub ? (
            <AppText size="sm" font="MulishBold" color="subText1">
              {title}
            </AppText>
          ) : (
            <AppTitle title={title} />
          )}
        </View>
        {onAdd && (
          <Pressable onPress={onAdd} hitSlop={10}>
            <AppText size="sm" color="primary" weight="semibold">
              + Thêm
            </AppText>
          </Pressable>
        )}
      </View>
      {!sub && <Divider />}
    </View>
  );
};

export default SectionHeader;
