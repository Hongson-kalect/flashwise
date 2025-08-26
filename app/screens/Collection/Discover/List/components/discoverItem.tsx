import AppText from "@/components/AppText";
import { useTheme } from "@/providers/Theme";
import { router } from "expo-router";
import { useState } from "react";
import { LayoutChangeEvent, TouchableOpacity, View } from "react-native";

const DiscoverItem = () => {
  const { theme } = useTheme();
  const [imageHeight, setImageHeight] = useState(0);

  const onLayout = (e: LayoutChangeEvent) =>
    setImageHeight((e.nativeEvent.layout.width / 3) * 2);

  return (
    <View className={"p-1"}>
      <TouchableOpacity
        onPress={() => {
          router.push("/screens/Collection/Discover/Detail/1");
        }}
        style={{ elevation: 2, backgroundColor: theme.background }}
        className="rounded-lg overflow-hidden"
      >
        <View
          className="absolute top-1 right-1 h-6 w-6 rounded-full bg-white"
          style={{ elevation: 2, zIndex: 1 }}
        ></View>
        <View
          onLayout={onLayout}
          style={{ height: imageHeight || "auto" }}
          className="bg-red-400"
        ></View>

        <View className="p-2">
          <AppText font="MulishSemiBold" className="my-1">
            Tiếng Anh mẫu giáo
          </AppText>
          <View className="flex-row justify-between mt-2">
            <View className=" bg-gray-100 px-2 py-1 rounded items-center justify-center">
              <AppText size={"xs"}>111 từ</AppText>
            </View>
            {/* <View className="h-8 w-12 bg-gray-200"></View>
            <View className="h-8 w-12 bg-gray-200"></View> */}
          </View>
        </View>
      </TouchableOpacity>
    </View>
  );
};

export default DiscoverItem;
