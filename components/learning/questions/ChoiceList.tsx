import AppIcon from "@/components/AppIcon";
import AppText from "@/components/AppText";
import { useTheme } from "@/providers/Theme";
import { Pressable, View } from "react-native";
import { AnswerProps } from "./types";

/** Trả lời bằng cách chọn: chọn sai thì ô đó đỏ và được chọn lại 1 lần; xong thì ô đúng xanh. */
const ChoiceList = ({ question, attempt, feedback, onAnswer }: AnswerProps) => {
  const { theme } = useTheme();
  return (
    <View className="gap-3">
      {question.options.map((option) => {
        const wrong = attempt.wrongOptionIds.includes(option.id);
        const showCorrect = !!feedback && option.correct;
        const color = showCorrect ? theme.success : wrong ? theme.error : theme.border;
        return (
          <Pressable
            key={option.id}
            disabled={!!feedback || wrong}
            onPress={() => onAnswer(option.id)}
            className="flex-row items-center gap-3 px-4 py-3.5 rounded-2xl"
            style={{
              backgroundColor: showCorrect ? theme.success + "14" : wrong ? theme.error + "10" : theme.card,
              borderWidth: 1.5,
              borderColor: color,
              opacity: feedback && !showCorrect && !wrong ? 0.55 : 1,
            }}
          >
            <AppText weight="semibold" color="title" style={{ flex: 1 }}>
              {option.text}
            </AppText>
            {showCorrect && <AppIcon branch="feather" name="check" size={18} color={theme.success} />}
            {wrong && <AppIcon branch="feather" name="x" size={18} color={theme.error} />}
          </Pressable>
        );
      })}
    </View>
  );
};

export default ChoiceList;
