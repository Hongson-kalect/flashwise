import AppIcon from "@/components/AppIcon";
import AppText from "@/components/AppText";
import { useTheme } from "@/providers/Theme";
import {
  StatusBar,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from "react-native";

type Props = {
  cardHeight: [number, React.Dispatch<React.SetStateAction<number>>];
};
const CardBackSide = ({ cardHeight }: Props) => {
  const { theme } = useTheme();
  const { width, height } = useWindowDimensions();

  return (
    <View
      onLayout={(e) => {
        e.persist();
        cardHeight[1]((prev) =>
          Math.max(prev, e.nativeEvent?.layout?.height || 0)
        );
      }}
      style={[
        {
          minHeight: ((height - (StatusBar.currentHeight || 0)) / 7) * 4,
          width: width - 48,
          backgroundColor: theme.background,
          elevation: 6,
          height: cardHeight[0] || "auto",
        },
      ]}
      className="rounded-lg"
    >
      <View className="flex-row items-center justify-between px-4 mt-4 mb-2">
        <TouchableOpacity
          style={{ backgroundColor: theme.primary }}
          onPress={() => alert("hello")}
          className="h-12 w-12 rounded-lg items-center justify-center"
        >
          <AppIcon branch="feather" color="white" size={16} name={"volume-2"} />
        </TouchableOpacity>

        <View className="flex-row gap-2 justify-end">
          <View className="bg-gray-200 h-8 w-8 rounded-lg items-center justify-center">
            <AppIcon
              color="subText3"
              branch="feather"
              size={16}
              name={"arrow-left"}
            />
          </View>
          <View className="bg-gray-200 h-8 w-8 rounded-lg items-center justify-center">
            <AppIcon
              color="subText3"
              branch="feather"
              size={16}
              name={"arrow-right"}
            />
          </View>
          <View className="bg-gray-200 h-8 w-8 rounded-lg items-center justify-center">
            <AppIcon
              color="subText3"
              branch="feather"
              size={16}
              name={"save"}
            />
          </View>
        </View>
      </View>
      <View className="mb-4 px-2">
        <View className="flex-row gap-2 items-center">
          <View>
            <AppText
              font="MulishBold"
              color="primary"
              className="text-center"
              size={24}
            >
              Strauberry cake
            </AppText>
            <View className="flex-row items-center">
              <AppText color="subText2" size={"xs"} font="MulishLightItalic">
                {"/em'la:bupclmm/"}
              </AppText>
            </View>
          </View>
        </View>
      </View>

      <View className="px-4 py-2 justify-between">
        <View className="w-full">
          <AppText font="MulishRegular" size={"sm"}>
            Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do
            eiusmod tempor incididunt.
          </AppText>
        </View>
      </View>
      <View className="mt-auto px-4 py-2">
        <AppText color="subText2" size={"xs"} font="MulishLightItalic">
          Example: Lorem ipsum dolor sit amet, Example: Lorem ipsum dolor dolor
          sit amet,{" "}
          <AppText size={"xs"} font="MulishBoldItalic">
            strauberry cake
          </AppText>{" "}
          adipiscing elit.
        </AppText>
      </View>
    </View>
  );
};

export default CardBackSide;
