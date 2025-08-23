import AppText from "@/components/AppText";
import { useTheme } from "@/providers/Theme";
import { useWindowDimensions, View } from "react-native";

const CollectionSumary = () => {
  const { theme } = useTheme();
  const { height } = useWindowDimensions();
  return (
    <View
      style={{
        elevation: 6,
        backgroundColor: theme.background,
        height: (height / 5) * 3,
      }}
      className="p-4 rounded-lg"
    >
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
