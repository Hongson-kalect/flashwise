import AppText from "@/components/AppText";
import { useLocalSearchParams } from "expo-router/build/hooks";
import { View } from "react-native";

const Card = () => {
  const { id } = useLocalSearchParams();
  return (
    <View>
      <AppText>Card id: {id}</AppText>
    </View>
  );
};

export default Card;
