import AppText from "@/components/AppText";
import { useTheme } from "@/providers/Theme";
import { View } from "react-native";
import CollectionDetailHeader from "./components/header";
import { useState } from "react";

const CollectionDetail = () => {
  const { theme } = useTheme();
  const [mode, setMode] = useState<"view" | "update">("view");
  // Dùng selectWordModal để thêm từ mới
  return (
    <View className="flex-1" style={{ backgroundColor: theme.background }}>
      <View>
        <CollectionDetailHeader mode={mode} setMode={(mode) => setMode(mode)} />
      </View>
      <AppText>CollectionDetail</AppText>
      <AppText>ý tưởng:</AppText>
      <AppText>
        Hiển thị dashboard các từ đã học và level của các từ đó bằng biểu đồ
        tròn và biểu đồ cột
      </AppText>
      <AppText>
        Hiển thị danh sách các từ trong collection cùng với ô search, filter,
        tạo component cho ô search với nhập chữ, onSearchChange, clearable,
        filter, onFilterChange
      </AppText>
      <AppText>
        Edit mode? Những thứ cần trong edit mode: Thêm từ, xóa từ, hiển thị ô
        checkbox cho từng từ, sửa tên, tiêu đề, tag cho collection
      </AppText>
      <AppText>
        Hiển thị list từ hiện tại với filter, search, order và add, và nút add,
        Khi bấm vào mở bottomshet full tương tự phần select word, Nhưng dữ liệu
        khác (Từ trong danh sách có sẵn)
      </AppText>
      <AppText>
        Khi longpress: Select từ đang chọn, bật select mode: Hiển thị check box
        cho toàn bộ từ và nút add thành nút delete
      </AppText>
    </View>
  );
};

export default CollectionDetail;
