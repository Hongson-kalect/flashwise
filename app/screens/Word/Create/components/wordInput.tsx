import { AppDivider } from "@/components/AppDivider";
import AppText from "@/components/AppText";
import { useTheme } from "@/providers/Theme";
import { useState } from "react";
import { TextInput, View } from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";

const WordInput = () => {
  const { theme } = useTheme();
  const [focusing, setFocusing] = useState(false);
  return (
    <View className="flex-row gap-4 items-center">
      {/* <View className="flex-1">
        <AppInput placeholder="Word" />
      </View> */}

      <View
        className="flex-1 h-14 px-2 justify-end relative"
        style={{
          borderBottomWidth: 3,
          borderBottomColor: focusing ? theme.primary : theme.disabled,
        }}
      >
        <View>
          <TextInput
            onFocus={() => setFocusing(true)}
            onBlur={() => setFocusing(false)}
            className="py-2"
            style={{
              fontSize: 24,
              lineHeight: 34,
              fontWeight: 600,
              color: theme.primary,
            }}
            placeholder="Word..."
            placeholderTextColor={theme.disabled}
          />
        </View>

        {focusing && (
          <Animated.View
            entering={FadeInDown}
            className="absolute"
            style={{
              backgroundColor: theme.background,
              elevation: 4,
              shadowColor: theme.text,
              top: 47,
              left: 0,
              right: 0,
              zIndex: 1,
            }}
          >
            {Array.from({ length: 2 }).map((_, index) => {
              const isLast = index === 4;
              return (
                <View key={index}>
                  <View className="px-2 h-14 flex-row items-center">
                    <AppText className="">GỢi ý 1</AppText>
                  </View>
                  {!isLast && <AppDivider />}
                </View>
              );
            })}
          </Animated.View>
        )}
      </View>

      <View className="w-24 h-14 items-center justify-center">
        <View
          //   style={{ backgroundColor: "red" }}
          className="h-12 w-20 bg-red-500"
        ></View>
      </View>
    </View>
  );
};

export default WordInput;
