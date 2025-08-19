import AppButton from "@/components/AppButton";
import AppIcon from "@/components/AppIcon";
import AppText from "@/components/AppText";
import { useTheme } from "@/providers/Theme";
import { router } from "expo-router";
import { View } from "react-native";

const CollectionSumary = () => {
  const { theme } = useTheme();
  return (
    <View
      style={{ elevation: 2, backgroundColor: theme.background, height: 380 }}
      className="p-4"
    >
      <View className="flex-row justify-between items-center">
        <AppText color="subText3">
          <AppText size={28} weight="bold" color="primary">
            14
          </AppText>
          {" Collection(s)"}
        </AppText>

        <AppButton
          onPress={() => {
            router.push("/screens/Collection/Create/screen");
          }}
          type="success"
        >
          <AppIcon name="plus" branch="fa6" size={16} color="white" />
          <AppText color="white">Create</AppText>
        </AppButton>
      </View>
      {/* Hiển thị thêm 1 vài thông tin thống kê như: Liệt kê theo ngôn ngữ, tỉ lệ từ đã học.  */}
      <AppText className="mt-2" size={"xs"} color="subText3">
        Learning Progress
      </AppText>

      <View className="rounded-xl bg-white flex-1">
        <AppText className="p-3 mt-4" size={"xs"} color="subText3">
          Sơ đồ cột số lượng từ đã học từ các collection. Giới hạn 5 cái
        </AppText>
      </View>

      {/* Hoặc vẽ biểu đồ theo vài collection đã học. Tỉ lệ từ đã học trên từng collection. Cột hoặc phần trăm*/}
    </View>
  );
};

export default CollectionSumary;
