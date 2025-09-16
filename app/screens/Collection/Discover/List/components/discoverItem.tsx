import AppIcon from "@/components/AppIcon";
import AppText from "@/components/AppText";
import { useTheme } from "@/providers/Theme";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useState } from "react";
import { Image, LayoutChangeEvent, TouchableOpacity, View } from "react-native";

const DiscoverItem = () => {
  const { theme } = useTheme();
  const [imageHeight, setImageHeight] = useState(0);

  const onLayout = (e: LayoutChangeEvent) =>
    setImageHeight(e.nativeEvent.layout.width);

  return (
    <View className={"p-1"}>
      <TouchableOpacity
        onPress={() => {
          router.push("/screens/Collection/Discover/Detail/1");
        }}
        style={{ elevation: 4, backgroundColor: theme.background }}
        className="rounded-lg overflow-hidden"
      >
        <View
          className="absolute top-1 right-1 h-6 w-6 rounded-full bg-white"
          style={{ elevation: 2, zIndex: 1 }}
        ></View>
        <Image
          source={{ uri: "https://picsum.photos/600/600" }}
          resizeMode="cover"
          onLayout={onLayout}
          style={{ height: imageHeight || "auto" }}
        ></Image>

        <View className="p-2">
          <AppText font="MulishBold" size={"sm"} className="my-1">
            Tiếng Anh mẫu giáo
          </AppText>
          <View className="flex-row justify-between mt-2">
            <View className="flex-row items-center justify-center">
              <AppText size={"sm"} font="MulishBold" color="primary">
                111
              </AppText>
              <MaterialCommunityIcons
                name="cards"
                size={18}
                color={theme.secondary}
              />
            </View>
            <View className="flex-row items-center">
              <View className="items-center flex-row">
                <AppIcon
                  branch="antd"
                  name="like1"
                  size={12}
                  color={theme.subText3}
                />
                <AppText size={12} color="subText3">
                  111
                </AppText>
              </View>
              {/* <View className="items-center flex-row">
                <AppIcon
                  branch="antd"
                  name="dislike1"
                  size={12}
                  color={theme.subText2}
                />
                <AppText size={"xs"} color="subText2">
                  111
                </AppText>
              </View> */}
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
