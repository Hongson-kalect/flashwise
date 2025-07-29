import { AppDivider } from "@/components/AppDivider";
import AppText from "@/components/AppText";
import AppTitle from "@/components/AppTitle";
import { useTheme } from "@/providers/Theme";
import { ScrollView, View } from "react-native";
import CreateHeader from "./components/header";
import Information from "./components/information";
import WordInput from "./components/wordInput";
import WordLink from "./components/wordLink";

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

          <View className="mt-4">
            <Information editable label="Phiên âm" value="Phiên âm" />
            <Information
              editable
              label="Phát âm"
              value="Chọn file âm thanh (Giới hạn dung lượng và thời gian)"
            />
          </View>

          <View className="mt-6 items-center justify-center">
            <View className="h-40 w-40 border border-dashed border-gray-400 rounded-lg p-4">
              <AppText color="subText2" size={"xs"}>
                Chọn hình minh hoạ
              </AppText>
            </View>
          </View>
          <View className="gap-2 mt-6">
            <Information
              editable
              label="Example"
              value="Em là búp măng non, em lớn lên trong mùa cách mạng"
            />

            <Information editable label="Loại từ" value="" />
            <Information editable label="Độ khó" value="A1" />
            <Information editable label="Độ phổ biến" value="Rất phổ biến" />
            <Information editable label="Chủ đề" value="..." />
            <Information editable label="Phong cách" value="Rất trang trọng" />

            <View>
              <AppText>Tag:</AppText>
              <View className="flex-row gap-2 flex-wrap">
                <View className="bg-gray-200 rounded-lg px-2 py-1">
                  <AppText size={"xs"} color="subText2">
                    1
                  </AppText>
                </View>
                <View className="bg-gray-200 rounded-lg px-2 py-1">
                  <AppText size={"xs"} color="subText2">
                    1
                  </AppText>
                </View>
                <View className="bg-gray-200 rounded-lg px-2 py-1">
                  <AppText size={"xs"} color="subText2">
                    1
                  </AppText>
                </View>
              </View>
            </View>
          </View>

          {/* Form định nghĩa */}

          <View className="mt-8">
            <AppTitle title="Từ liên quan " />

            <View className="mt-4">
              <WordLink
                editable
                label="Biến thể"
                value={[
                  { value: "ceck" },
                  { value: "ceck", link_to: "bruh" },
                  { value: "ceck", link_to: "broh" },
                ]}
              />
            </View>
          </View>

          {/* Form link */}

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
