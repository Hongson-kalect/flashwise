import AppLabel from "@/components/AppLabel";
import { View } from "react-native";

const HomeHeader = () => {
  return (
    <View className="flex-row justify-between items-center h-14">
      <AppLabel titles={["Flash", "wise"]} />
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

export default HomeHeader;
