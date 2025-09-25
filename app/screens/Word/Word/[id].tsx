import AppText from "@/components/AppText";
import { useLocalSearchParams } from "expo-router";
import { View } from "react-native";

const Word = () => {
  const { id } = useLocalSearchParams();
  return (
    <View>
      <AppText>Word id: {id}</AppText>
    </View>
  );
};

export default Word;
