import AppText from "@/components/AppText";
import { useTheme } from "@/providers/Theme";
import { useLocalSearchParams } from "expo-router";
import { View } from "react-native";
import UpdateWordHeader from "./components/header";

const UpdateWord = () => {
  const { theme } = useTheme();
  const { id } = useLocalSearchParams();

  return (
    <View style={{ backgroundColor: theme.background }} className="flex-1">
      <UpdateWordHeader />
      <AppText>UpdateWord {id}</AppText>
    </View>
  );
};

export default UpdateWord;
