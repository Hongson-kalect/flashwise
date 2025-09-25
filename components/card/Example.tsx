import { QuestionType } from "@/app/screens/Practice/example";
import { TextStyle, View, ViewStyle } from "react-native";
import AppText from "../AppText";

type Props = {
  hideText?: boolean;
  question: QuestionType;
  wrapperStyle?: ViewStyle;
  textStyle?: TextStyle;
};

const CardExample = (props: Props) => {
  return (
    <View className="mt-1 px-4 py-2">
      <AppText>
        {props.question.example
          .split(props.question.word)
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
                props.question.example.split(props.question.word).length - 1 ? (
                  !props.hideText ? (
                    <AppText color="subText2" size={"xs"} font="MulishBold">
                      {props.question.word}
                    </AppText>
                  ) : (
                    "..."
                  )
                ) : null}
              </AppText>
            );
          })}
      </AppText>
    </View>
  );
};

export default CardExample;
