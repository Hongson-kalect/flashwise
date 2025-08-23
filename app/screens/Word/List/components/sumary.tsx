import AppText from "@/components/AppText";
import { BarChart } from "@/components/chart/bar";
import { useWindowDimensions, View } from "react-native";

const ListSumary = () => {
  const { height } = useWindowDimensions();
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
          <View className="h-24 w-24 bg-red-400 rounded-full p-4">
            <View className="h-16 w-18 bg-white rounded-full p-4 items-center justify-center">
              <AppText color="subText1">0%</AppText>
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
