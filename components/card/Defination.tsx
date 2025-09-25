import { TextStyle, View, ViewStyle } from "react-native";
import AppText from "../AppText";
import { QuestionType } from "@/app/screens/Practice/example";

type Props = {
  wrapperStyle?: ViewStyle;
  textStyle?: TextStyle;
  question: QuestionType;
};

const CardDefination = (props: Props) => {
  return (
    <View className="w-full px-4 mt-1">
      <AppText style={props.textStyle} font="MulishRegular" size={"sm"}>
        {props.question.meaning}
      </AppText>
    </View>
  );
};

export default CardDefination;
