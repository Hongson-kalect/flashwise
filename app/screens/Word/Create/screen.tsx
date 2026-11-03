import AppIcon from "@/components/AppIcon";
import AppReturnHeader from "@/components/AppReturnHeader";
import AppText from "@/components/AppText";
import { useTheme } from "@/providers/Theme";
import { useAppStore } from "@/stores/appStore";
import { router } from "expo-router";
import { useState } from "react";
import { KeyboardAvoidingView, Platform, Pressable, TextInput, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

// Khớp bộ lọc của server (utils/utils/normalize.lookup_entry_problem): chỉ từ, cụm từ, thành ngữ, tục ngữ
const MAX_TOKENS = 12;
const MAX_CJK_CHARS = 14;
const MAX_CHARS = 100;

/** Lỗi nhìn thấy ngay ở máy; còn lại (từ sai chính tả, câu ngắn...) do AI quyết định ở bước tạo từ. */
const entryProblem = (raw: string, lang: string): string | null => {
  const word = raw.trim().replace(/\s+/g, " ");
  if (!word) return "Hãy nhập một từ hoặc cụm từ.";
  if (!/[\p{L}\p{N}]/u.test(word)) return "Hãy nhập một từ hoặc cụm từ.";
  if (word.length > MAX_CHARS) return `Tối đa ${MAX_CHARS} ký tự.`;
  const cjk = ["ja", "zh"].includes(lang.split("-")[0]);
  const tooLong = cjk ? word.length > MAX_CJK_CHARS : word.split(" ").length > MAX_TOKENS;
  const body = word.replace(/[.!?。！？ ]+$/u, "");
  if (tooLong || /[.!?。！？]\s*\S/u.test(body)) {
    return "Đây giống một câu hơn là một mục từ. Chỉ thêm từ, cụm từ, thành ngữ hoặc tục ngữ.";
  }
  return null;
};

/**
 * Tìm kiếm từ mới: chỉ nhập từ rồi Enter. Từ chưa có sẽ được AI tạo ngay ở trang từ (tiến độ hiện dần, báo rõ nếu bị từ chối);
 * từ đã có thì mở luôn.
 */
export default function CreateWord() {
  const { theme } = useTheme();
  const wordLang: string = useAppStore((s) => s.settings?.learning_language) ?? "en";
  const [text, setText] = useState("");
  const [error, setError] = useState<string | null>(null);

  const submit = () => {
    const problem = entryProblem(text, wordLang);
    if (problem) {
      setError(problem);
      return;
    }
    const value = text.trim().replace(/\s+/g, " ").toLowerCase();
    // Thay màn này bằng trang từ: quay lại sẽ về danh sách từ chứ không về ô nhập
    router.replace({ pathname: "/screens/Word/Detail/[value]", params: { value, valueId: value } });
  };

  const ready = text.trim().length > 0;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.background }}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <AppReturnHeader title="Tìm kiếm từ mới" />
        <View className="px-4 pt-4 gap-5">
          <View className="gap-1">
            <AppText size="xl" weight="bold" color="title">
              Bạn muốn tìm từ nào?
            </AppText>
            <AppText color="subText1">
              Nhập một từ, cụm từ, thành ngữ hoặc tục ngữ ({wordLang.toUpperCase()}). Nếu từ chưa có trong từ điển, nó sẽ được khởi tạo cùng nghĩa, ví dụ và bản dịch.
            </AppText>
          </View>

          <View>
            <TextInput
              value={text}
              onChangeText={(t) => {
                setText(t);
                if (error) setError(null);
              }}
              onSubmitEditing={submit}
              autoFocus
              autoCapitalize="none"
              autoCorrect={false}
              returnKeyType="go"
              maxLength={MAX_CHARS}
              placeholder="vd: break the ice"
              placeholderTextColor={theme.subText3}
              style={{
                height: 60,
                color: theme.text,
                backgroundColor: theme.card,
                borderColor: error ? theme.error : theme.primary,
                borderWidth: 2,
                borderRadius: 20,
                paddingHorizontal: 18,
                fontFamily: "MulishSemiBold",
                fontSize: 20,
              }}
            />
            {!!error && (
              <View className="flex-row gap-2 items-start" style={{ marginTop: 8 }}>
                <AppIcon branch="feather" name="alert-circle" size={16} color={theme.error} style={{ marginTop: 2 }} />
                <AppText size="sm" color="error" style={{ flex: 1 }}>
                  {error}
                </AppText>
              </View>
            )}
          </View>

          <Pressable
            disabled={!ready}
            onPress={submit}
            className="h-14 rounded-2xl flex-row items-center justify-center gap-2"
            style={{ backgroundColor: theme.primary, opacity: ready ? 1 : 0.45 }}
          >
            <AppText color="white" size="lg" weight="bold">
              Tìm từ
            </AppText>
            <AppIcon branch="feather" name="arrow-right" size={18} color="white" />
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
