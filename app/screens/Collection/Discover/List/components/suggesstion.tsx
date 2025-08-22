import AppText from "@/components/AppText";
import { View } from "react-native";

const DiscoverSuggesstion = () => {
  return (
    <View style={{ height: 200 }} className="bg-gray-300 rounded-lg p-4">
      <AppText>Discover Suggesstion</AppText>
      <AppText>react-native-reanimated-carousel</AppText>
      <AppText>1.3 * 5 collections hiển thị, infinite</AppText>

      {/* Thêm gradient đen phía dưới hình để ghi thông tin, copy mọe từ app routine sang cũng oke */}
    </View>
  );
};

export default DiscoverSuggesstion;
