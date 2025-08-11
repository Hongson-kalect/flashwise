import AppButton from "@/components/AppButton";
import AppIcon from "@/components/AppIcon";
import AppReturnHeader from "@/components/AppReturnHeader";
import AppText from "@/components/AppText";
import { View } from "react-native";

const CreateTranslateHeader = () => {
  return (
    <View className="flex-row justify-between items-center">
      <AppReturnHeader
        title="Create translate"
        rightElement={
          <AppButton onPress={() => {}} type="primary">
            <AppIcon name="plus" branch="fa6" size={18} color="white" />
            <AppText color="white">Add</AppText>
          </AppButton>
        }
      />
    </View>
  );
};

export default CreateTranslateHeader;
