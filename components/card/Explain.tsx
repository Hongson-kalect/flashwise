import { TextStyle, View, ViewStyle } from "react-native";
import AppText from "../AppText";
import { QuestionType } from "@/app/screens/Practice/example";

type Props = {
  hideText?: boolean;
  question: QuestionType;
  wrapperStyle?: ViewStyle;
  textStyle?: TextStyle;
};

const CardExplanation = (props: Props) => {
  return (
    <View className="mt-1 px-4 py-2">
      <AppText color="subText2" size={"xs"} font="MulishLightItalic">
        {props.question.meaning}
      </AppText>
    </View>
  );
};

export default CardExplanation;
