import { AppDivider } from "@/components/AppDivider";
import AppText from "@/components/AppText";
import { useTheme } from "@/providers/Theme";
import { View } from "react-native";

const CollectionItem = () => {
  const { theme } = useTheme();
  return (
    <View
      style={{
        elevation: 4,
        // shadowOffset: {
        //   width: 3,
        //   height: 3,
        // },
        // shadowColor,
        // borderTopWidth: 0.5,
        // borderLeftWidth: 0.5,
        // borderRightWidth: 0.5,
        // borderBottomWidth: 0.5,
        // borderColor: "#ddd",
        paddingBottom: 12,
        // borderTopColor: theme.primary + "44",
        // borderLeftColor: theme.primary + "44",
        // borderRightColor: theme.primary,
        // borderBottomColor: theme.primary,
      }}
      className="bg-white rounded-lg overflow-hidden"
    >
      <View
        style={{ elevation: 4 }}
        className="h-6 w-6 absolute top-1 right-1 rounded-full bg-blue-500 z-[1]"
      ></View>
      <View className="h-32 bg-gray-100">
        {/* <AppText>Colllecion Image / icon</AppText> */}
      </View>
      <AppDivider />
      <AppText className="mt-2 px-2" weight="700" size={"sm"}>
        Giao tiếp cơ bả
      </AppText>

      {/* <View className="flex-row items-center justify-between">
        <View className="flex">
          <AppText>Số từ</AppText>
          <AppText>320</AppText>
        </View>

      </View> */}
      <View className="px-2">
        <View className="mt-2 flex-row items-center justify-between">
          <AppText size={10} color="subText2" weight="100">
            Tiến độ
          </AppText>
          <View className="flex-row items-center">
            <AppText size={10} color="primary" weight="bold">
              151
            </AppText>
            <AppText size={10}>/</AppText>
            <AppText size={10} color="subText3">
              300
            </AppText>
          </View>
        </View>
        <View className="h-2 bg-gray-300  rounded-full">
          <View
            style={{
              backgroundColor: theme.success,
              width: "50%",
              borderTopLeftRadius: 999,
              borderBottomLeftRadius: 999,
            }}
            className="h-full"
          ></View>
        </View>
        {/* <View
          style={{
            left: "50%",
            marginLeft: -5,
          }}
        >
          <AppText color="primary" size={10}>
            50%
          </AppText>
        </View> */}
      </View>
    </View>
  );
};

export default CollectionItem;
