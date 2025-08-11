import AppButton from "@/components/AppButton";
import AppIcon from "@/components/AppIcon";
import AppReturnHeader from "@/components/AppReturnHeader";
import AppText from "@/components/AppText";
import { useAppNavigation } from "@/hooks/useNavigation";
import { View } from "react-native";

const WordDetailHeader = () => {
  const { routerPush } = useAppNavigation();

  return (
    <View className="flex-row justify-between items-center">
      <AppReturnHeader
        title="Từ được chọn"
        rightElement={
          <AppButton onPress={() => {}} type="secondary">
            <AppIcon name="edit" branch="fa6" size={18} color="white" />
            <AppText color="white">Edit</AppText>
          </AppButton>
        }
      />
    </View>
  );
};

export default WordDetailHeader;
