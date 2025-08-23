import AppLabel from "@/components/AppLabel";
import { View } from "react-native";

const CollectionListHeader = () => {
  return (
    <View className="flex-row justify-between items-center h-14">
      <AppLabel titles={["Collection"]} />
      {/* <AppButton
        onPress={() => router.push("/screens/Collection/Discover/List/screen")}
        type="primary"
      >
        <AppIcon name="link" branch="antd" color="white" size={18} />
        <AppText color="white">Discover</AppText>
      </AppButton> */}
    </View>
  );
};

export default CollectionListHeader;
