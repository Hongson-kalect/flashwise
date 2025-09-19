import { TextStyle, View, ViewStyle } from "react-native";
import AppText from "../AppText";

type Props = {
  hideText?: boolean;
  question: any;
  wrapperStyle?: ViewStyle;
  textStyle?: TextStyle;
};

const CardExplanation = (props: Props) => {
  return (
    <View className="mt-1 px-4 py-2">
      <AppText color="subText2" size={"xs"} font="MulishLightItalic">
        Example: Lorem ipsum dolor sit amet, Example: Lorem ipsum dolor dolor
        sit amet,{" "}
        <AppText size={"xs"} font="MulishBoldItalic">
          strauberry cake
        </AppText>{" "}
        adipiscing elit.
      </AppText>
    </View>
  );
};

export default CardExplanation;
