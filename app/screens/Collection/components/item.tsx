import AppText from "@/components/AppText";
import { useTheme } from "@/providers/Theme";
import { router, useLocalSearchParams } from "expo-router";
import { Image, TouchableOpacity, View } from "react-native";

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
        // paddingBottom: 12,
        // borderTopColor: theme.primary + "44",
        // borderLeftColor: theme.primary + "44",
        // borderRightColor: theme.primary,
        // borderBottomColor: theme.primary,
      }}
      className="bg-white rounded-lg overflow-hidden p-3 flex-row gap-3"
    >
      {/* <View
        style={{ elevation: 4 }}
        className="h-6 w-6 absolute top-1 right-1 rounded-full bg-blue-500 z-[1]"
      ></View> */}
      <View>
        <View
          style={{ height: 63, width: 112 }}
          className="rounded overflow-hidden border border-gray-100 items-center justify-center"
        >
          <Image
            source={{ uri: "https://picsum.photos/600/400" }}
            className="w-full h-full"
            style={{ resizeMode: "cover" }}
          />
        </View>
        <View
          style={{
            position: "absolute",
            bottom: 4,
            left: 2,
            paddingHorizontal: 4,
            zIndex: 1,
            backgroundColor: theme.text + "aa",
          }}
          className="items-center gap-1 flex-row"
        >
          {/* <AppIcon color="subText2" name={"user"} branch="feather" size={12} /> */}
          <AppText
            numberOfLines={1}
            style={{ maxWidth: 100 }}
            font="MulishLightItalic"
            size={10}
            color={"white"}
          >
            Leo Hiểu
          </AppText>
        </View>
      </View>
      <View className=" flex-1 justify-between">
        <View>
          <AppText
            font="MulishSemiBold"
            size={"sm"}
            color="text"
            numberOfLines={2}
          >
            Giao tiếp cơ bản giao tiếp cơ bản giao tiếp cơ bản giao tiếp cơ bản
          </AppText>
        </View>
        <View>
          <View className="mt-2 flex-row items-center justify-between">
            <AppText size={11} color="subText2" font="MulishLight">
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
