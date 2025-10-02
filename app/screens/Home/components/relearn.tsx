import AppButton from "@/components/AppButton";
import AppIcon from "@/components/AppIcon";
import AppText from "@/components/AppText";
import { useTheme } from "@/providers/Theme";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { View } from "react-native";

const Relearn = () => {
  const { theme } = useTheme();

  return (
    <LinearGradient
      colors={[theme.primary, "#000"]}
      locations={[0.5, 0.9]}
      start={[0, 0]}
      end={[1, 1]}
      style={{
        backgroundColor: theme.primary + "ee",
        borderRadius: 8,
      }}
      className="p-4 rounded-xl"
    >
      <View>
        <View className="flex-row items-center gap-2">
          <AppIcon
            branch="antd"
            name={"infocirlce"}
            color="#f5f5f5"
            size={16}
          />
          <AppText font="MulishMedium" color="white">
            Ôn lại các từ đã học
          </AppText>
        </View>
        <View className="">
          <View className="items-center flex-row gap-2 mt-6">
            <MaterialCommunityIcons
              name="cards"
              size={28}
              color={theme.secondary}
            />

            <AppText font="MulishBold" size={28} color="white">
              25 từ
            </AppText>
          </View>

          <View className="mt-2 mb-1 w-full flex-row items-center gap-4">
            <AppButton
              onPress={() => {
                router.push("/screens/Practice/screen");
              }}
              // type="success"
              type="disabled"
              size="lg"
              disabled
            >
              {/* <AppText font={"MulishSemiBold"} color="white" size={"lg"}> */}
              <AppText font={"MulishRegularItalic"} color="white" size={"lg"}>
                {/* 1 Ngày 8 Giờ */}
                Ôn tập sau
              </AppText>
            </AppButton>
            <AppText
              style={{
                textShadowColor: "#f2f2f2",
                textShadowOffset: { width: 0, height: 0 },
                textShadowRadius: 1,
              }}
              font="MulishMediumItalic"
              color="error"
              size={"lg"}
            >
              1 Ngày 8:40:32
            </AppText>
          </View>

          {/* <View className="mt-2">
            <AppText font="MulishRegularItalic" size={"xs"} color="subText3">
              Cần được ôn tập sau{" "}
              <AppText font="MulishRegularItalic" size={"xs"} color="warning">
                19
              </AppText>{" "}
              giờ{" "}
              <AppText font="MulishRegularItalic" size={"xs"} color="warning">
                12
              </AppText>{" "}
              phút nữa
            </AppText>
          </View> */}
        </View>
      </View>
    </LinearGradient>
  );
};

export default Relearn;
