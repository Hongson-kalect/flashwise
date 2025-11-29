import AppIcon from "@/components/AppIcon";
import AppText from "@/components/AppText";
import { useTheme } from "@/providers/Theme";
import { LinearGradient } from "expo-linear-gradient";
import { View } from "react-native";

const HomeTarget = () => {
  const { theme } = useTheme();
  return (
    <LinearGradient
      colors={[theme.success + "66", "transparent"]}
      locations={[0.7, 0.9]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 0 }}
      style={{
        backgroundColor: theme.background,
        borderRadius: 10,
        elevation: 5,
        borderColor: theme.success,
        shadowColor: theme.success,
      }}
      className="flex-row items-center gap-2 p-2 justify-between"
    >
      <View className="flex-row gap-4 items-center ml-2">
        <View>
          <AppIcon
            branch="feather"
            name="book-open"
            size={28}
            color="secondary"
          />
        </View>
        <View>
          <AppText size={"xs"} color="subText2">
            Mục tiêu 🎯
          </AppText>

          <View className="">
            <AppText font="MulishMedium" color="primary">
              10 từ vựng mới
            </AppText>
          </View>
        </View>
      </View>
      <View className="pr-4 p-2 items-center justify-center">
        <AppIcon branch="feather" size={20} name="refresh-ccw" />
      </View>
    </LinearGradient>
  );
};

export default HomeTarget;
