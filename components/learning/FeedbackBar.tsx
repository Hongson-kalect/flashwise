import AppIcon from "@/components/AppIcon";
import AppText from "@/components/AppText";
import { Feedback } from "@/learning/engine";
import { useTheme } from "@/providers/Theme";
import { Pressable, View } from "react-native";

type Props = { feedback: Feedback; onNext: () => void };

/** Kết quả 1 bước: đúng (xanh), gần đúng (vàng, kèm đáp án chuẩn), phải hiện đáp án (đỏ, sẽ hỏi lại). */
const FeedbackBar = ({ feedback, onNext }: Props) => {
  const { theme } = useTheme();
  const tone = feedback.revealed ? theme.error : feedback.verdict === "close" ? theme.warning : theme.success;
  const title = feedback.revealed ? "Đáp án đúng" : feedback.verdict === "close" ? "Gần đúng" : "Chính xác!";
  return (
    <View className="p-4 rounded-2xl gap-3" style={{ backgroundColor: tone + "14", borderWidth: 1, borderColor: tone }}>
      <View className="flex-row items-center gap-2">
        <AppIcon branch="feather" name={feedback.revealed ? "x-circle" : "check-circle"} size={20} color={tone} />
        <AppText weight="bold" style={{ color: tone }}>
          {title}
        </AppText>
      </View>
      {(feedback.revealed || feedback.verdict === "close") && (
        <AppText size="xl" weight="bold" color="title">
          {feedback.answer}
        </AppText>
      )}
      {feedback.revealed && (
        <AppText size="sm" color="subText1">
          Bước này sẽ được hỏi lại sau ít thẻ nữa.
        </AppText>
      )}
      <Pressable onPress={onNext} className="h-12 rounded-2xl items-center justify-center" style={{ backgroundColor: tone }}>
        <AppText color="white" weight="bold">
          Tiếp tục
        </AppText>
      </Pressable>
    </View>
  );
};

export default FeedbackBar;
