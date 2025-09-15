import AppTitle from "@/components/AppTitle";
import { useTheme } from "@/providers/Theme";
import { View } from "react-native";
import { ScrollView } from "react-native-gesture-handler";
import UploadListHeader from "./components/header";
import MyUploadList from "./components/list";
import UploadPanel from "./components/panel";

const CollectionUploadList = () => {
  const { theme } = useTheme();

  return (
    <View className="flex-1" style={{ backgroundColor: theme.background }}>
      <ScrollView>
        <View>
          <UploadListHeader />
        </View>
        <View className="px-3">
          <View className="mt-8 px-3">
            <UploadPanel />
          </View>
          <View className="mt-8 gap-4">
            <AppTitle title="Uploaded list" />
            <MyUploadList />
          </View>
        </View>
        <View className="h-10"></View>
      </ScrollView>
    </View>
  );
};

export default CollectionUploadList;
