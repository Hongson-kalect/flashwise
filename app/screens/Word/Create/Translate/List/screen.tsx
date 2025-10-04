import { AppDivider } from "@/components/AppDivider";
import AppText from "@/components/AppText";
import { useTheme } from "@/providers/Theme";
import { View } from "react-native";
import TranslateItem from "./components/translateItem";
import TranslateListHeader from "./components/translateListHeader";

export default function TranslateList() {
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
          className="py-4 px-2 rounded"
        >
          <AppText
            className="text-center"
            size={32}
            font="MulishSemiBold"
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
