import AppButton from "@/components/AppButton";
import AppIcon from "@/components/AppIcon";
import AppText from "@/components/AppText";
import { View } from "react-native";

const CollectionSumary = () => {
  return (
    <View style={{ elevation: 4 }} className="p-4 bg-gray-200 rounded-lg">
      <View className="flex-row justify-between items-center">
        <AppText size={"lg"} color="subText2">
          <AppText size={28} weight="bold" color="primary">
            14
          </AppText>
          {" Collection(s)"}
        </AppText>

        <AppButton onPress={() => {}} type="success">
          <AppIcon name="plus" branch="fa6" size={16} color="white" />
          <AppText color="white">Create</AppText>
        </AppButton>
      </View>
      {/* Hiển thị thêm 1 vài thông tin thống kê như: Liệt kê theo ngôn ngữ, tỉ lệ từ đã học.  */}
      <AppText className="mt-2" size={"xs"} color="subText3">
        Learning Progress
      </AppText>

      <View className="h-32 rounded-xl bg-gray-600 mt-4"></View>

      {/* Hoặc vẽ biểu đồ theo vài collection đã học. Tỉ lệ từ đã học trên từng collection. Cột hoặc phần trăm*/}
    </View>
  );
};

export default CollectionSumary;
