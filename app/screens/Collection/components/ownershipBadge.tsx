import AppIcon from "@/components/AppIcon";
import AppText from "@/components/AppText";
import { useTheme } from "@/providers/Theme";
import type { OwnedCollection } from "@/database/queries/collections";
import { View } from "react-native";

/** Màu nhấn theo quan hệ với bộ: của mình (màu chính) hoặc đã tải (màu thành công); chưa có: không có màu. Dùng cho khung viền và thẻ. */
export const ownershipColor = (owned: OwnedCollection | undefined, theme: { primary: string; success: string }) =>
  !owned ? null : owned.isAuthor ? theme.primary : theme.success;

/** Thẻ nhỏ "Của bạn" / "Đã tải" ở Khám phá và xem trước, để phân biệt bộ đã có trong thư viện với bộ chưa tải. */
const OwnershipBadge = ({ owned }: { owned: OwnedCollection | undefined }) => {
  const { theme } = useTheme();
  const color = ownershipColor(owned, theme);
  if (!owned || !color) return null;
  return (
    <View className="flex-row items-center gap-1 px-2 h-6 rounded-full" style={{ backgroundColor: color + "1F", borderWidth: 1, borderColor: color }}>
      <AppIcon branch="feather" name={owned.isAuthor ? "user" : "check-circle"} size={11} color={color} />
      <AppText size="xs" weight="bold" style={{ color }}>
        {owned.isAuthor ? "Của bạn" : "Đã tải"}
      </AppText>
    </View>
  );
};

export default OwnershipBadge;
