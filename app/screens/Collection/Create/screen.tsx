import AppText from "@/components/AppText";
import { useTheme } from "@/providers/Theme";
import { View } from "react-native";
import CreateCollectionHeader from "./components/header";

const CreateCollection = () => {
  const { theme } = useTheme();
  return (
    <View className="flex-1" style={{ backgroundColor: theme.background }}>
      <View className="px-2">
        <CreateCollectionHeader />
      </View>
      <AppText>Collection create</AppText>
      <AppText>
        Có 3 cách để tạo 1 collection: Tải từ discover, thêm từ id, tự tạo
        manual
      </AppText>
      <AppText>Trang này là tự tạo manual</AppText>
      <AppText>Tải sẽ có trang riêng để tải</AppText>
      <AppText>
        Thêm bằng id thì sẽ hiển thị ở ngay phần list, để tránh nhập linh tinh
        thì sẽ id sẽ có dạng userId-collectionId
      </AppText>
      {/* <AppText></AppText> */}
      <AppText>
        Các thông tin cơ bản của collection: Tên, description, tags, ngôn ngữ
        (tự động) Ngôn ngữ đích (tự động)
      </AppText>
      <AppText>
        Ý tưởng: 2 panel 1 cái là tìm kiếm và chọn từ, 1 cái hiển thị các từ
        được chọn
      </AppText>
      <AppText>
        Có ô filter và search cho panel chọn từ, có nút mở rộng để hiển thị danh
        sách các từ được chọn bằng bottomsheet, có thể có search và filter ở đây
        luôn (Có thể cần dùng khi người ta edit)
      </AppText>
      <AppText>
        Hiển thị danh sách từ của mình. sau đó check, sau khi check thì nó bay
        vào 1 list có thể xem, hiển thị giới hạn, và luôn hiển thị những từ gần
        nhất
      </AppText>
      <AppText>
        Nếu người dùng muốn thêm từ ngoài danh sách các từ có sẵn đã lưu thì...
        Nếu db đủ to thì sẽ hiển thị ngoài những cái ngoài của user trong danh
        sách tìm kiếm. Nhưng nếu db bé và chưa có từ đó thì... Cần tạo từ trước?
        Hay là thêm trước rồi tạo từ sau?
      </AppText>
    </View>
  );
};

export default CreateCollection;
