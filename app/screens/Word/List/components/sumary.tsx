import AppText from "@/components/AppText";
import { View } from "react-native";

const ListSumary = () => (
  <View
    style={{ height: 240, elevation: 2 }}
    className="bg-white items-center rounded-lg p-4"
  >
    <AppText>Biểu đồ các từ đã học, tương tự như 4English</AppText>
    {/* <AppText size={32} weight="bold">
      8000 Thẻ
    </AppText>
    <AppText size={"lg"}>Hiển thị thông tin cơ bản của lô thẻ này.</AppText> */}
  </View>
);

export default ListSumary;
