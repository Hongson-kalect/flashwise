import { QuestionType } from "@/app/screens/Practice/example";
import { TextStyle, View, ViewStyle } from "react-native";
import AppText from "../AppText";

type Props = {
  hideText: boolean;
  question: QuestionType;
  wrapperStyle?: ViewStyle;
  textStyle?: TextStyle;
};

const CardTranslatedExample = (props: Props) => {
  // hideText = false

  return (
    <View className="mt-1 px-4 py-2">
      <AppText>
        {props.question.translation_example
          .split(props.question.translation)
          .map((text, index) => {
            return (
              <AppText key={index}>
                <AppText
                  color="subText2"
                  size={"xs"}
                  font="MulishLightItalic"
                  key={index}
                >
                  {text}
                </AppText>
                {index !==
                  props.question.translation_example.split(
                    props.question.translation
                  ).length -
                    1 && (
                  <AppText color="subText2" size={"xs"} font="MulishBold">
                    {props.question.translation}
                  </AppText>
                )}
              </AppText>
            );
          })}
      </AppText>
    </View>
  );
};

export default CardTranslatedExample;
