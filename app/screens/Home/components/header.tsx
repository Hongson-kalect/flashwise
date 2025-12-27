import AppText from "@/components/AppText";
import { useDatabase } from "@/hooks/useDatabase";
import { useSQLiteContext } from "expo-sqlite";
import { useEffect } from "react";
// import { database, tableNames } from "@/watermelon/database";
import { View } from "react-native";

const HomeHeader = () => {
  const db = useSQLiteContext();
  const search = "";

  const database = useDatabase();

  const getTodos = async () => {};

  useEffect(() => {
    getTodos();
  }, []);
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

      <AppText font="MulishSemiBold" size={32}>
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
