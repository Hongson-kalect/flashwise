import AppText from "@/components/AppText";
import { useTheme } from "@/providers/Theme";
import { useRouter } from "expo-router";
import { useState } from "react";
import { LayoutChangeEvent, TouchableOpacity, View } from "react-native";

const TranslateItem = () => {
  const [labelWidth, setLabelWidth] = useState(0);
  const { theme } = useTheme();
  const router = useRouter();

  const checkLabelWidth = (event: LayoutChangeEvent) => {
    const width = event.nativeEvent.layout.width;

    setLabelWidth((prev) => (width > prev ? width : prev));
  };

  const renderExample = (text: string, word: string) => {
    const parts = text.split(new RegExp(`(${word})`, "gi"));
    return (
      <AppText size={"xs"}>
        {parts.map((part, index) =>
          part.toLowerCase() === word.toLowerCase() ? (
            <AppText size={"xs"} key={index} font="MulishBold">
              {part}
            </AppText>
          ) : (
            <AppText size={"xs"} key={index} color="subText2">
              {part}
            </AppText>
          )
        )}
      </AppText>
    );
  };
  return (
    <View className="">
      <TouchableOpacity
        style={{ backgroundColor: theme.background }}
        className=" rounded-lg p-2"
        onPress={() => {
          router.push("/screens/Word/Create/Translate/Detail/1");
        }}
      >
        <View className="flex-row items-center justify-between">
          <View>
            <AppText color="primary" font="MulishBold" size={"2xl"}>
              Chạy
            </AppText>
          </View>
          <View className="rounded h-8 w-12 bg-red-400"></View>
        </View>
        <View className="flex-row">
          <View
            // style={{ backgroundColor: theme.secondary }}
            className="flex-row items-center px-1 rounded"
          >
            <AppText size={"xs"} color={"subText3"}>
              /caːj˧˦/
            </AppText>
          </View>
        </View>

        <View className="flex-row gap-1 mt-2">
          <AppText
            style={{ width: labelWidth || "auto" }}
            onLayout={checkLabelWidth}
            size={"xs"}
            font="MulishLight"
            color="subText1"
          >
            📚 Khác
          </AppText>
          <AppText size={"xs"} color="subText1">
            :
          </AppText>
          <View className="flex-1">
            <AppText size={"sm"} color="subText1">
              Phóng, phi, khởi động, thực thi
            </AppText>
          </View>
        </View>

        <View className="flex-row gap-1 mt-1">
          <AppText
            onLayout={checkLabelWidth}
            style={{ width: labelWidth || "auto" }}
            size={"xs"}
            color="subText1"
          >
            🧩 Ví dụ
          </AppText>
          <AppText size={"xs"} color="subText1">
            :
          </AppText>
          <View className="flex-1">
            {renderExample(
              "Chạy ngay đi trước khi,... chạy đi chạy đi",
              "chạy"
            )}
          </View>
        </View>
      </TouchableOpacity>
    </View>
  );
};

export default TranslateItem;
