import { AppDivider } from "@/components/AppDivider";
import AppText from "@/components/AppText";
import { useTheme } from "@/providers/Theme";
import { useState } from "react";
import { LayoutChangeEvent, View } from "react-native";
import TranslateListHeader from "./components/translateListHeader";

type Props = {};

export default function TranslateList({}: Props) {
  const { theme } = useTheme();

  return (
    <View style={{ backgroundColor: theme.background }} className="flex-1">
      <TranslateListHeader />
      <View className="px-4 mt-4">
        {/* <AppText color="subText2" size={"sm"}>
          Translate list of
        </AppText> */}
        <View
          style={{
            backgroundColor: theme.primary,
            elevation: 4,
            shadowColor: theme.primary,
          }}
          className="p-4 rounded-xl"
        >
          <AppText
            className="mt-4 text-center"
            size={32}
            weight="bold"
            color="white"
          >
            Run
          </AppText>
        </View>

        <View className="gap-3 mt-6">
          <TranslateItem />
          <AppDivider />
          <TranslateItem />
          <AppDivider />
          <TranslateItem />
          {/* <AppDivider /> */}
        </View>
      </View>
    </View>
  );
}

const TranslateItem = () => {
  const [labelWidth, setLabelWidth] = useState(0);
  const { theme } = useTheme();

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
            <AppText size={"xs"} key={index} weight="bold">
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
      <View
        style={
          {
            // backgroundColor: theme.secondary + "66",
          }
        }
        className=" rounded-lg p-3"
      >
        <View className="flex-row items-center justify-between">
          <View>
            <AppText color="primary" weight="bold" size={"2xl"}>
              Chạy
            </AppText>
          </View>
          {/* <AppText size={"xs"} color="subText2">
            vi-VN
          </AppText> */}
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
            weight="100"
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
      </View>
    </View>
  );
};
