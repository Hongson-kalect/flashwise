import { AppDivider } from "@/components/AppDivider";
import AppText from "@/components/AppText";
import AppTitle from "@/components/AppTitle";
import { useTheme } from "@/providers/Theme";
import { ScrollView, View } from "react-native";
import CreateHeader from "./components/header";
import Information from "./components/information";
import WordInput from "./components/wordInput";

const CreateCardScreen = () => {
  const { theme } = useTheme();
  return (
    <View style={{ backgroundColor: theme.background }} className="flex-1">
      <View>
        <CreateHeader />
      </View>
      <AppDivider />

      <ScrollView>
        <View className="px-2">
          <View className="mt-8">
            <WordInput />
          </View>

          <View className="mt-8">
            <AppTitle underline title="Định nghĩa " />
            <View className="flex-row gap-1">
              <AppText className="mt-2">
                Cái này là mô phỏng của chức năng định nghĩa
              </AppText>
            </View>
          </View>

          <View className="gap-2 mt-6">
            <Information
              editable
              label="Ví dụ"
              value="Em là búp măng non, em lớn lên trong mùa cách mạng"
            />

            <Information editable label="Loại từ" value="" />
            <Information editable label="Độ khó" value="A1" />
            <Information editable label="Độ phổ biến" value="Rất phổ biến" />
            <Information editable label="Chủ đề" value="..." />
            <Information
              editable
              label="Độ trang trọng"
              value="Rất trang trọng"
            />
            <Information editable label="Phiên âm" value="Rất trang trọng" />

            <AppText>Mức độ thông dụng</AppText>
            <AppText>Độ khó (A1, B1,...)</AppText>
            <AppText>Chủ đề</AppText>
            <AppText>Tags</AppText>
            <AppText>Phong cách</AppText>
          </View>

          {/* Form định nghĩa */}

          <View className="h-20"></View>

          <AppText>Hình minh hoạ (giới hạn dung lượng)</AppText>
          <AppText>Nhập định nghĩa</AppText>
          <AppText>Nhập Ví dụ</AppText>
          <AppText>
            Chọn kiểu từ (Động từ, tính từ, danh từ, trạng từ, đại từ, giới từ,
            liên từ, thán từ, số từ, từ hạn định)
          </AppText>
          <AppText>Cách phát âm (chị google có thể đọc được)</AppText>
          <AppText>
            File phát âm (giới hạn dung lượng và thời gian) có thể nhiều phong
            cách
          </AppText>
          <AppText>
            Từ loại chuyển đổi: Biến thể của từ: happy → happiness → happily →
            unhappiness...
          </AppText>

          <AppText>Mức độ thông dụng</AppText>
          <AppText>Độ khó (A1, B1,...)</AppText>
          <AppText>Chủ đề</AppText>
          <AppText>Tags</AppText>
          <AppText>Phong cách</AppText>

          {/* Form link */}
          <Information editable label="Biến thể" value="Rất trang trọng" />

          <AppText>Từ liên quan (search- chọn)</AppText>
          <AppText>Từ đồng nghĩa (search- chọn)</AppText>
          <AppText>Từ trái nghĩa (search- chọn)</AppText>
          <AppText>Từ đồng âm (search- chọn)</AppText>
          <AppText>Collocation (cụm thường đi kèm)</AppText>
          <AppText>Lưu ý</AppText>
          <AppText>Ví dụ nâng cao</AppText>
          <AppText>Note cá nhân</AppText>

          {/* Form bản dịch */}
          <AppText>Tạo bản dịch [nhiều]</AppText>

          <AppText>Nhập quốc gia</AppText>
          <AppText>Nhập chữ</AppText>
          <AppText>Chú thích</AppText>
          <AppText>Đồng nghĩa</AppText>
          <AppText>Trái nghĩa</AppText>
          {/* <AppText>Nhập Nghĩa</AppText> */}
          <AppText>Nhập Ví dụ</AppText>
          {/* <AppText>
        Chọn kiểu từ (Động từ, tính từ, danh từ, trạng từ, đại từ, giới từ, liên
        từ, thán từ, số từ, từ hạn định)
      </AppText> */}
          <AppText>Cách phát âm (chị google có thể đọc được)</AppText>
          <AppText>File phát âm (giới hạn dung lượng và thời gian)</AppText>
        </View>

        <View className="h-10"></View>
      </ScrollView>

      {/* <AppText>Từ liên quan (search- chọn)</AppText> */}
    </View>
  );
};

export default CreateCardScreen;
