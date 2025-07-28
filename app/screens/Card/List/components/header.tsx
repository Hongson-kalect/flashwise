import AppButton from "@/components/AppButton";
import AppIcon from "@/components/AppIcon";
import AppLabel from "@/components/AppLabel";
import AppText from "@/components/AppText";
import { useAppNavigation } from "@/hooks/useNavigation";
import { useRouter } from "expo-router";
import { View } from "react-native";

const ListHeader = () => {
  const { routerPush } = useAppNavigation();
  const router = useRouter();

  return (
    <View className="flex-row justify-between items-center h-14">
      <AppLabel titles={["Flash", "card"]} />
      <AppButton
        onPress={() => router.push("/screens/Card/Create/screen")}
        type="primary"
      >
        <AppIcon name="plus" branch="antd" color="white" size={18} />
        <AppText color="white">Create</AppText>
      </AppButton>
    </View>
  );
};

export default ListHeader;
