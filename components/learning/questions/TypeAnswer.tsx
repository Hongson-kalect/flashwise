import AppIcon from "@/components/AppIcon";
import AppText from "@/components/AppText";
import { hintText } from "@/learning/checker";
import { MAX_HINTS } from "@/learning/engine";
import { useTheme } from "@/providers/Theme";
import { useEffect, useState } from "react";
import { Pressable, TextInput, View } from "react-native";
import { AnswerProps } from "./types";

/** Trả lời bằng cách gõ: gợi ý từng nấc (chữ đầu, rồi chữ đầu + số chữ, rồi hiện đáp án), sai 1 lần được gõ lại. */
const TypeAnswer = ({ question, attempt, onAnswer, onHint }: AnswerProps) => {
  const { theme } = useTheme();
  const [value, setValue] = useState("");
  const wrong = attempt.lastVerdict === "wrong" && attempt.tries > 0;

  // Gõ sai thì xoá ô để gõ lại
  useEffect(() => {
    if (wrong) setValue("");
  // eslint-disable-next-line react-hooks/exhaustive-deps -- cố ý: chỉ chạy lại khi phụ thuộc liệt kê đổi (hàm / đối tượng còn lại đổi mỗi lần render hoặc đã ổn định)
  }, [attempt.tries]);

  const submit = () => value.trim() && onAnswer(value);
  const last = attempt.hints >= MAX_HINTS;

  return (
    <View className="gap-3">
      {attempt.hints > 0 && (
        <AppText size="xl" weight="bold" color="primary" textAlign="center" style={{ letterSpacing: 2 }}>
          {hintText(question.answer, attempt.hints)}
        </AppText>
      )}
      {wrong && (
        <AppText size="sm" textAlign="center" style={{ color: theme.error }}>
          Chưa đúng, thử lại nhé
        </AppText>
      )}
      <TextInput
        value={value}
        onChangeText={setValue}
        onSubmitEditing={submit}
        autoFocus
        autoCapitalize="none"
        autoCorrect={false}
        returnKeyType="done"
        placeholder="Gõ từ..."
        placeholderTextColor={theme.subText3}
        style={{
          color: theme.text,
          backgroundColor: theme.card,
          borderColor: wrong ? theme.error : theme.border,
          borderWidth: 1.5,
          borderRadius: 16,
          paddingHorizontal: 16,
          height: 54,
          fontFamily: "MulishSemiBold",
          fontSize: 18,
        }}
      />
      <View className="flex-row gap-3">
        {/* Bước copy đáp án đang hiện trên thẻ nên không có gợi ý */}
        {question.kind !== "copy" && (
        <Pressable
          onPress={onHint}
          className="flex-row items-center justify-center gap-1.5 px-4 h-12 rounded-2xl"
          style={{ borderWidth: 1.5, borderColor: theme.border }}
        >
          <AppIcon branch="feather" name="help-circle" size={16} color={theme.text} />
          <AppText size="sm" weight="semibold" color="title">
            {last ? "Xem đáp án" : "Gợi ý"}
          </AppText>
        </Pressable>
        )}
        <Pressable
          onPress={submit}
          disabled={!value.trim()}
          className="flex-1 h-12 rounded-2xl items-center justify-center"
          style={{ backgroundColor: theme.primary, opacity: value.trim() ? 1 : 0.45 }}
        >
          <AppText color="white" weight="bold">
            Kiểm tra
          </AppText>
        </Pressable>
      </View>
    </View>
  );
};

export default TypeAnswer;
