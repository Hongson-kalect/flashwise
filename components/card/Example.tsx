import { QuestionType } from "@/app/screens/Practice/example";
import { fontFamily } from "@/configs/fonts";
import { useTheme } from "@/providers/Theme";
import { TextStyle, View, ViewStyle } from "react-native";
import Animated, { FadeIn } from "react-native-reanimated";
import AppText from "../AppText";

type Props = {
  hideText?: boolean;
  question: QuestionType;
  wrapperStyle?: ViewStyle;
  textStyle?: TextStyle;
};

const CardExample = (props: Props) => {
  const { theme } = useTheme();
  return (
    <View className="mt-1 px-4 py-2">
      <View className="flex-row items-center flex-wrap">
        {props.question.example
          .split(props.question.word)
          .map((text, index) => {
            return (
              <View className="flex-row items-center flex-wrap" key={index}>
                <AppText
                  style={{ height: 20, fontSize: 12 }}
                  color="subText2"
                  size={"xs"}
                  font="MulishLightItalic"
                >
                  {text}
                </AppText>
                {index !==
                props.question.example.split(props.question.word).length - 1 ? (
                  !props.hideText ? (
                    <Animated.Text
                      entering={FadeIn}
                      style={{
                        height: 20,
                        color: theme.subText2,
                        fontFamily: fontFamily.MulishBold,
                        fontSize: 12,
                      }}
                    >
                      {props.question.word}
                    </Animated.Text>
                  ) : (
                    <AppText
                      style={{ height: 20, fontSize: 12 }}
                      color="subText2"
                      size={"xs"}
                      font="MulishLightItalic"
                    >
                      {"....."}
                    </AppText>
                  )
                ) : null}
              </View>
            );
          })}
      </View>
    </View>
  );
};

export default CardExample;
