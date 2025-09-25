import { TextStyle, View, ViewStyle } from "react-native";
import AppText from "../AppText";
import { QuestionType } from "@/app/screens/Practice/example";

type Props = {
  hideText?: boolean;
  question: QuestionType;
  wrapperStyle?: ViewStyle;
  textStyle?: TextStyle;
};

const CardCulturalNote = (props: Props) => {
  return (
    <View className="mt-1 px-4 py-2">
      {props.question.example.split(" ").map((text, index) => {
        if (text === props.question.word)
          return (
            <AppText key={index} color="subText2" size={"xs"} font="MulishBold">
              {text}{" "}
            </AppText>
          );
        else
          return (
            <AppText
              key={index}
              color="subText2"
              size={"xs"}
              font="MulishLightItalic"
            >
              {text}{" "}
            </AppText>
          );
      })}
    </View>
  );
};

export default CardCulturalNote;
