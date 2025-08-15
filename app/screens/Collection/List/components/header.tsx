import AppButton from "@/components/AppButton";
import AppIcon from "@/components/AppIcon";
import AppLabel from "@/components/AppLabel";
import AppText from "@/components/AppText";
import { router } from "expo-router";
import { View } from "react-native";

const CollectionListHeader = () => {
  return (
    <View className="flex-row justify-between items-center h-14">
      <AppLabel titles={["Collec", "tion"]} />
      <AppButton
        onPress={() => router.push("/screens/Word/Create/screen")}
        // onPress={testFunction}
        type="primary"
      >
        <AppIcon name="link" branch="antd" color="white" size={18} />
        <AppText color="white">Discover</AppText>
      </AppButton>
    </View>
  );
};

export default CollectionListHeader;
