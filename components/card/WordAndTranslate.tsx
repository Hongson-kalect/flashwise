import { TextStyle, View, ViewStyle } from "react-native";
import AppText from "../AppText";

type Props = {
  wrapperStyle?: ViewStyle;
  textStyle?: TextStyle;
  question: any;
  questionIndex: number;
};

const CardWordAndTranslated = (props: Props) => {
  return (
    <View className="px-2 mb-4">
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

          <AppText className="mt-0.5" size={"sm"} font="MulishLight">
            Bánh dâu
          </AppText>
        </View>
      </View>
    </View>
  );
};

export default CardWordAndTranslated;
