import AppText from "@/components/AppText";
import { View } from "react-native";

const HomeHeader = () => {
  return (
    <View className="">
      {/* <AppLabel titles={["Flash", "wise"]} /> */}
      {/* <AppButton
        onPress={() => router.push("/screens/Collection/Discover/List/screen")}
        type="primary"
      >
        <AppIcon name="link" branch="antd" color="white" size={18} />
        <AppText color="white">Discover</AppText>
      </AppButton> */}

      <AppText font="MulishSemiBold" size={36}>
        Hi, JOIN
      </AppText>

      <View className="">
        <AppText size={"sm"} font="MulishLight" color="subText1">
          What would you like to learn today?
        </AppText>
      </View>
    </View>
  );
};

export default HomeHeader;
