import { AppContainer } from "@/components/AppContainer";
import AppInput from "@/components/AppInput";
import AppText from "@/components/AppText";
import TagItem from "@/components/TagItem";
import { useTheme } from "@/providers/Theme";
import { useState } from "react";
import { View } from "react-native";
import { ScrollView } from "react-native-gesture-handler";
import { Divider } from "react-native-paper";
import CollectionDetailHeader from "./components/header";

const CollectionDetail = () => {
  const { theme } = useTheme();
  const [mode, setMode] = useState<"view" | "update">("view");
  // Dùng selectWordModal để thêm từ mới
  return (
    <View className="flex-1" style={{ backgroundColor: theme.background }}>
      <View>
        <CollectionDetailHeader mode={mode} setMode={(mode) => setMode(mode)} />
      </View>

      <Divider />

      <View className="flex-1">
        <ScrollView>
          <AppContainer>
            <View className="gap-4 mt-8"></View>

            <View
              className=""
              style={{
                elevation: 4,
                backgroundColor: theme.background,
                height: 300,
                borderRadius: 8,
              }}
            ></View>

            <View className="mt-8 gap-4">
              <AppInput label="Name" size={"lg"} />
              <AppInput label="Description" size={"lg"} />
              <View>
                <AppText>Tags</AppText>
                <View className="flex-row gap-2 flex-wrap">
                  {["Tag 1", "Tag 2", "Tag 3"].map((tag) => (
                    <TagItem key={tag}>{tag}</TagItem>
                  ))}
                </View>
              </View>
            </View>

            <AppText>CollectionDetail</AppText>
            <AppText>ý tưởng:</AppText>
            <AppText>
              Hiển thị dashboard các từ đã học và level của các từ đó bằng biểu
              đồ tròn và biểu đồ cột
            </AppText>
            <AppText>
              Hiển thị danh sách các từ trong collection cùng với ô search,
              filter, tạo component cho ô search với nhập chữ, onSearchChange,
              clearable, filter, onFilterChange
            </AppText>
            <AppText>
              Edit mode? Những thứ cần trong edit mode: Thêm từ, xóa từ, hiển
              thị ô checkbox cho từng từ, sửa tên, tiêu đề, tag cho collection
            </AppText>
            <AppText>
              Hiển thị list từ hiện tại với filter, search, order và add, và nút
              add, Khi bấm vào mở bottomshet full tương tự phần select word,
              Nhưng dữ liệu khác (Từ trong danh sách có sẵn)
            </AppText>
            <AppText>
              Khi longpress: Select từ đang chọn, bật select mode: Hiển thị
              check box cho toàn bộ từ và nút add thành nút delete
            </AppText>
          </AppContainer>
          <View className="h-10"></View>
        </ScrollView>
      </View>
    </View>
  );
};

export default CollectionDetail;
