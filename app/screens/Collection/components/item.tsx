import AppText from "@/components/AppText";
import { useTheme } from "@/providers/Theme";
import { router, useLocalSearchParams } from "expo-router";
import { TouchableOpacity, View } from "react-native";

const CollectionItem = () => {
  const { theme } = useTheme();
  const { id } = useLocalSearchParams();
  return (
    <TouchableOpacity
      onPress={() => router.push(`/screens/Collection/Detail/${id}`)}
      style={{
        elevation: 6,
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
      className="bg-white rounded-lg overflow-hidden px-3 py-2 flex-row gap-4"
    >
      {/* <View
        style={{ elevation: 4 }}
        className="h-6 w-6 absolute top-1 right-1 rounded-full bg-blue-500 z-[1]"
      ></View> */}
      <View className="w-24 h-24 rounded-lg items-center justify-center bg-gray-100">
        {/* <AppText>Colllecion Image / icon</AppText> */}
      </View>
      <View className="py-1 flex-1 px-2 justify-between">
        <View>
          <AppText font="MulishSemiBold" size={"xs"} color={"secondary"}>
            English
          </AppText>
          <AppText font="MulishBold" numberOfLines={2}>
            Giao tiếp cơ bản giao tiếp cơ bản giao tiếp cơ bản giao tiếp cơ bản
          </AppText>
        </View>
        <View>
          <View className="mt-2 flex-row items-center justify-between">
            <AppText size={12} color="subText2" font="MulishLight">
              Đã học
            </AppText>
            <View className="flex-row items-center">
              <AppText size={10} color="primary" font="MulishBold">
                151
              </AppText>
              <AppText size={10}>/</AppText>
              <AppText size={10} color="subText3">
                300
              </AppText>
            </View>
          </View>
          <View className="h-2 bg-gray-200  rounded-full">
            <View
              style={{
                backgroundColor: theme.primary,
                width: "50%",
                borderRadius: 999,
              }}
              className="h-full"
            ></View>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
};

export default CollectionItem;
