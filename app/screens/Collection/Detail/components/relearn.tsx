import AppButton from "@/components/AppButton";
import AppIcon from "@/components/AppIcon";
import AppText from "@/components/AppText";
import { useTheme } from "@/providers/Theme";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { View } from "react-native";

const Relearn = () => {
  const { theme } = useTheme();

  return (
    <View
      style={{
        elevation: 6,
        // shadowColor: theme.,
        backgroundColor: theme.background,
      }}
      className="p-4 rounded-lg"
    >
      <View>
        <View className="flex-row items-center gap-2">
          <AppIcon
            branch="antd"
            name={"infocirlce"}
            color="subText3"
            size={18}
          />
          <AppText font="MulishBold" size={"lg"}>
            Ôn tập các từ đã học
          </AppText>
        </View>
        <View className="">
          <View className="items-center flex-row gap-2 mt-2">
            <MaterialCommunityIcons name="cards" size={24} color="#aaa" />

            <AppText font="MulishBold" size={24} color="error">
              25 từ
            </AppText>
          </View>

          <View className="mt-2 w-40">
            <AppButton onPress={() => {}}>
              <AppText font="MulishSemiBold" color="white">
                Ôn tập ngay
              </AppText>
            </AppButton>
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
    </View>
  );
};

export default Relearn;
