import AppButton from "@/components/AppButton";
import AppIcon from "@/components/AppIcon";
import AppReturnHeader from "@/components/AppReturnHeader";
import AppText from "@/components/AppText";
import { router } from "expo-router";
import { View } from "react-native";

const WordDetailHeader = () => {
  return (
    <View className="flex-row justify-between items-center">
      <AppReturnHeader
        // title="Detail"
        rightElement={
          <AppButton
            onPress={() => {
              router.push(`/screens/Word/Update/${1}`);
            }}
            type="secondary"
          >
            <AppIcon name="edit" branch="fa6" size={18} color="white" />
            <AppText color="white">Edit</AppText>
          </AppButton>
        }
      />
    </View>
  );
};

export default WordDetailHeader;
