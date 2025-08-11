import AppButton from "@/components/AppButton";
import AppIcon from "@/components/AppIcon";
import AppReturnHeader from "@/components/AppReturnHeader";
import AppText from "@/components/AppText";
import { useRouter } from "expo-router";
import { View } from "react-native";

type Props = {
  id: string;
  title: string;
};
const TranslateDetailHeader = (props: Props) => {
  const router = useRouter();
  return (
    <View className="flex-row justify-between items-center">
      <AppReturnHeader
        title={props.title}
        rightElement={
          <AppButton
            onPress={() => {
              router.push(`/screens/Word/Create/Translate/Edit/${props.id}`);
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

export default TranslateDetailHeader;
