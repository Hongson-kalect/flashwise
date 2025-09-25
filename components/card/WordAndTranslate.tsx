import { TextStyle, View, ViewStyle } from "react-native";
import AppText from "../AppText";
import { QuestionType } from "@/app/screens/Practice/example";

type Props = {
  wrapperStyle?: ViewStyle;
  textStyle?: TextStyle;
  question: QuestionType;
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
            {props.question.word}
          </AppText>
          <View className="flex-row items-center">
            <AppText color="subText2" size={"xs"} font="MulishLightItalic">
              {props.question.spelling}
            </AppText>
          </View>

          <AppText className="mt-0.5" size={"sm"} font="MulishLight">
            {props.question.translation}
          </AppText>
        </View>
      </View>
    </View>
  );
};

export default CardWordAndTranslated;
