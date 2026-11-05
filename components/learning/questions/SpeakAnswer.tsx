import AppIcon from "@/components/AppIcon";
import AppText from "@/components/AppText";
import { useSpeechRecognizer } from "@/learning/speechRecognizer";
import { useTheme } from "@/providers/Theme";
import { speakWord } from "@/utils/speak";
import { useEffect } from "react";
import { Pressable, View } from "react-native";
import { AnswerProps } from "./types";

/**
 * Trả lời bằng giọng nói: bấm micro, nói, bộ nhận dạng trên máy trả kết quả (tạm thời hiện ngay). Sai 1 lần được nói lại.
 * Micro bị chặn / không nhận dạng được (hoặc bấm "Không tiện nói") thì các bước nói còn lại tự đổi sang dạng gõ.
 */
const SpeakAnswer = ({ card, question, attempt, onSpeech, onSkipSpeak }: AnswerProps) => {
  const { theme } = useTheme();
  const rec = useSpeechRecognizer(card.lang, onSpeech);
  const listening = rec.status === "listening";
  // Từ chối quyền vẫn cho bấm lại (hỏi lại được, hoặc báo bật trong Cài đặt); chỉ máy không hỗ trợ mới khoá hẳn
  const blocked = rec.status === "unavailable";
  const denied = rec.status === "denied";
  // Micro bị chặn (từ chối quyền / máy không nhận dạng được): tự chuyển các bước nói còn lại sang dạng gõ
  useEffect(() => {
    if (blocked || denied) onSkipSpeak();
  }, [blocked, denied]);
  const wrong = attempt.lastVerdict === "wrong" && attempt.tries > 0 && !listening;
  const color = blocked ? theme.subText3 : listening ? theme.error : theme.primary;

  return (
    <View className="items-center gap-3">
      <View className="min-h-[44px] items-center justify-center">
        {listening ? (
          <AppText color="subText1" textAlign="center">
            {rec.heard || "Đang nghe, bạn nói đi..."}
          </AppText>
        ) : wrong ? (
          <AppText size="sm" textAlign="center" style={{ color: theme.error }}>
            {rec.heard ? `Nghe được "${rec.heard}", chưa khớp. Nói lại nhé` : "Chưa khớp, nói lại nhé"}
          </AppText>
        ) : rec.message ? (
          <AppText size="sm" textAlign="center" style={{ color: blocked || denied ? theme.warning : theme.error }}>
            {rec.message}
          </AppText>
        ) : (
          <AppText size="sm" color="subText2" textAlign="center">
            Bấm micro rồi đọc to từ này
          </AppText>
        )}
      </View>
      <View className="flex-row items-center gap-5">
        <Pressable
          onPress={() => speakWord(card)}
          hitSlop={8}
          className="h-12 w-12 rounded-full items-center justify-center"
          style={{ borderWidth: 1.5, borderColor: theme.border }}
          accessibilityLabel="Nghe phát âm mẫu"
        >
          <AppIcon branch="feather" name="volume-2" size={20} color={theme.text} />
        </Pressable>
        <Pressable
          onPress={rec.toggle}
          disabled={blocked}
          className="h-20 w-20 rounded-full items-center justify-center"
          style={{ backgroundColor: color + (listening ? "" : "1F"), borderWidth: 2, borderColor: color, opacity: blocked ? 0.5 : 1 }}
          accessibilityLabel={listening ? "Dừng nghe" : "Bắt đầu nói"}
        >
          <AppIcon branch="feather" name={listening ? "square" : "mic"} size={30} color={listening ? "white" : color} />
        </Pressable>
        <View className="h-12 w-12" />
      </View>
      <Pressable onPress={onSkipSpeak} hitSlop={8}>
        <AppText size="sm" weight="semibold" style={{ color: blocked || denied ? theme.primary : theme.subText2 }}>
          Không tiện nói, chuyển sang gõ
        </AppText>
      </Pressable>
    </View>
  );
};

export default SpeakAnswer;
