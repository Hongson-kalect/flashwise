import AppButton from "@/components/AppButton";
import AppIcon from "@/components/AppIcon";
import AppReturnHeader from "@/components/AppReturnHeader";
import AppText from "@/components/AppText";
import { useAppNavigation } from "@/hooks/useNavigation";
import { useRouter } from "expo-router";
import { View } from "react-native";

const TranslateListHeader = () => {
  const router = useRouter();
  const { routerPush } = useAppNavigation();
  return (
    <View className="flex-row justify-between items-center">
      <AppReturnHeader
        title="Translate"
        rightElement={
          <AppButton
            onPress={() => {
              routerPush("/screens/Word/Create/Translate/Create/screen");
            }}
            type="primary"
          >
            <AppIcon name="plus" branch="antd" size={18} color="white" />
            <AppText color="white">Add</AppText>
          </AppButton>
        }
      />
    </View>
  );
};

export default TranslateListHeader;
