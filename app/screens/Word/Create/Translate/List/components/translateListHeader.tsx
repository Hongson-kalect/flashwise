import AppButton from "@/components/AppButton";
import AppIcon from "@/components/AppIcon";
import AppReturnHeader from "@/components/AppReturnHeader";
import AppText from "@/components/AppText";
import { View } from "react-native";

const TranslateListHeader = () => {
  return (
    <View className="flex-row justify-between items-center">
      <AppReturnHeader
        title="Translate"
        rightElement={
          <AppButton onPress={() => {}} type="primary">
            <AppIcon name="plus" branch="antd" size={18} color="white" />
            <AppText color="white">Create</AppText>
          </AppButton>
        }
      />
    </View>
  );
};

export default TranslateListHeader;
