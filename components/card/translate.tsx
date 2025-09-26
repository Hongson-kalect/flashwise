import { QuestionType } from "@/app/screens/Practice/example";
import { TextStyle, View, ViewStyle } from "react-native";
import AppText from "../AppText";

type Props = {
  wrapperStyle?: ViewStyle;
  textStyle?: TextStyle;
  question: QuestionType;
  questionIndex: number;
  hideText?: boolean;
};

const CardTranslated = (props: Props) => {
  if (props.hideText) return null;
  return (
    <View className="px-2 mb-4">
      <View className="flex-row gap-2 items-center">
        <View>
          <AppText
            font="MulishBold"
            color="primary"
            // className="text-center"
            size={24}
          >
            {props.question.translation}
          </AppText>
          <View className="flex-row items-center">
            <AppText color="subText2" size={"xs"} font="MulishLightItalic">
              {"/em'la:bupclmm/"}
            </AppText>
          </View>

          {/* <AppText className="mt-0.5" size={"sm"} font="MulishLight">
            Bánh dâu
          </AppText> */}
        </View>
      </View>
    </View>
  );
};

export default CardTranslated;
