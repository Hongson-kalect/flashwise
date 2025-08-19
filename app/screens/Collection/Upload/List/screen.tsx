import AppText from "@/components/AppText";
import { useTheme } from "@/providers/Theme";
import { View } from "react-native";
import UploadListHeader from "./components/header";

const CollectionUploadList = () => {
  const { theme } = useTheme();

  return (
    <View className="flex-1" style={{ backgroundColor: theme.background }}>
      <View>
        <UploadListHeader />
      </View>
      <AppText>CollectionUploadList</AppText>
    </View>
  );
};

export default CollectionUploadList;
