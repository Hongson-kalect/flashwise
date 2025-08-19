import AppText from "@/components/AppText";
import { useTheme } from "@/providers/Theme";
import { View } from "react-native";
import CreateUploadHeader from "./components/header";

const CreateUploadCollection = () => {
  const { theme } = useTheme();
  return (
    <View className="flex-1" style={{ backgroundColor: "white" }}>
      <View className="px-2">
        <CreateUploadHeader />
      </View>
      <AppText>CreateUploadCollection</AppText>
    </View>
  );
};

export default CreateUploadCollection;
