import { fontFamily } from "@/configs/fonts";
import { useTheme } from "@/providers/Theme";
import { useState } from "react";
import { View } from "react-native";
import Animated, { FadeIn, FadeOut } from "react-native-reanimated";
import AppIcon from "../AppIcon";
import AppInput from "../AppInput";

const AppSearch = () => {
  const { theme } = useTheme();
  const [focused, setFocused] = useState(false);
  const [value, setValue] = useState("");

  return (
    <View
      style={{ borderRadius: 12 }}
      className={"flex-row items-center px-5 py-1 bg-gray-100 h-14"}
    >
      <AppIcon name="search1" branch="antd" size={24} color="#888" />
      <View className="flex-1 justify-center">
        <AppInput
          style={{
            fontFamily: fontFamily.MulishBold,
            alignItems: "center",
            flex: 1,
            fontSize: 16,
            justifyContent: "center",
            borderColor: "transparent",
          }}
          inputStyle={{ fontFamily: fontFamily.MulishMedium }}
          containerStyle={{ borderColor: "transparent" }}
          value={value}
          onChangeText={(value) => setValue(value)}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          placeholder="Search......"
          // className="h-full w-full text-lg"
        />
      </View>
      <View className="flex-row gap-1 items-center">
        <View className="h-full items-center justify-center pr-2">
          {focused && value && (
            <Animated.View
              entering={FadeIn.duration(200)}
              exiting={FadeOut.duration(200)}
              className={"h-full items-center justify-center"}
            >
              <AppIcon
                name="closecircle"
                branch="antd"
                size={16}
                color="#888"
              />
            </Animated.View>
          )}
          {/* <AppIcon name="closecircle" branch="antd" size={16} color="#555" /> */}
        </View>
        <AppIcon name={"filter"} branch="antd" size={24} color="#888" />
      </View>
    </View>
  );
};

export default AppSearch;
