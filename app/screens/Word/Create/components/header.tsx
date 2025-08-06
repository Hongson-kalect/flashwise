import AppButton from "@/components/AppButton";
import AppIcon from "@/components/AppIcon";
import AppReturnHeader from "@/components/AppReturnHeader";
import AppText from "@/components/AppText";
import { View } from "react-native";

const CreateHeader = () => {
  return (
    <View className="flex-row justify-between items-center">
      <AppReturnHeader
        title="Create Word"
        rightElement={
          <AppButton onPress={() => {}} type="primary">
            <AppIcon name="save" branch="fa6" size={18} color="white" />
            <AppText color="white">Save</AppText>
          </AppButton>
        }
      />
    </View>
  );
};

export default CreateHeader;
