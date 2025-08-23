import AppButton from "@/components/AppButton";
import AppIcon from "@/components/AppIcon";
import AppLabel from "@/components/AppLabel";
import AppText from "@/components/AppText";
import { useAppNavigation } from "@/hooks/useNavigation";
import { View } from "react-native";

const ListHeader = () => {
  const { routerPush } = useAppNavigation();

  return (
    <View className="flex-row justify-between items-center h-14">
      <AppLabel titles={["Words"]} />
      <AppButton
        onPress={() => routerPush("/screens/Word/Create/screen")}
        // onPress={testFunction}
        type="primary"
      >
        <AppIcon name="plus" branch="fa6" color="white" size={18} />
        <AppText font="MulishMedium" color="white">
          Create
        </AppText>
      </AppButton>
    </View>
  );
};

export default ListHeader;
