import AppText from "@/components/AppText";
import { BarChart } from "@/components/chart/bar";
import { useTheme } from "@/providers/Theme";
import { useWindowDimensions, View } from "react-native";

const ListSumary = () => {
  const { height } = useWindowDimensions();
  const { theme } = useTheme();
  return (
    <View
      style={{ height: (height / 5) * 3, elevation: 6 }}
      className="bg-white items-center p-4 rounded-lg"
    >
      <View className="flex-row w-full items-center justify-between">
        <View>
          <AppText color="subText1">Đã học</AppText>
          <View className="flex-row gap-1 items-end">
            <AppText color="primary" font="MulishBold" size={48}>
              0
            </AppText>
            <AppText
              className="mb-3"
              font="MulishMedium"
              color="subText2"
              size={24}
            >
              /123
            </AppText>
          </View>
        </View>
        <View>
          <View
            style={{ backgroundColor: theme.success + "44" }}
            className="h-24 w-24 rounded-full p-4"
          >
            <View className="h-16 w-16 bg-white rounded-full items-center justify-center">
              <AppText color="subText1">0</AppText>
              <AppText color="subText2" font="MulishLight" size={"xs"}>
                %
              </AppText>
            </View>
          </View>
        </View>
      </View>

      <View className="mt-4 flex-1 w-full">
        <AppText color="subText1" className="mb-4">
          Tiến trình học
        </AppText>
        <BarChart />
      </View>
    </View>
  );
};

export default ListSumary;
