import AppButton from "@/components/AppButton";
import AppIcon from "@/components/AppIcon";
import AppLabel from "@/components/AppLabel";
import AppText from "@/components/AppText";
import { View } from "react-native";

const ListHeader = () => {
  return (
    <View className="flex-row justify-between items-center">
      <AppLabel titles={["Flash", "card"]} />
      <AppButton onPress={() => {}} type="primary">
        <AppIcon name="plus" branch="antd" color="white" size={18} />
        <AppText color="constract">Create</AppText>
      </AppButton>
    </View>
  );
};

export default ListHeader;
