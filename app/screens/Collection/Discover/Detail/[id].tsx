import AppText from "@/components/AppText";
import { useLocalSearchParams } from "expo-router";
import { View } from "react-native";

const DiscoverDetail = () => {
  const { id } = useLocalSearchParams();
  return (
    <View>
      <AppText>DiscoverList detail</AppText>
    </View>
  );
};

export default DiscoverDetail;
