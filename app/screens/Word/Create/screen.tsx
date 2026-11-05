import AppIcon from "@/components/AppIcon";
import AppReturnHeader from "@/components/AppReturnHeader";
import AppText from "@/components/AppText";
import { useTheme } from "@/providers/Theme";
import { useAppStore } from "@/stores/appStore";
import { entryProblem, MAX_ENTRY_CHARS } from "@/utils/entryProblem";
import { router } from "expo-router";
import { useState } from "react";
import { KeyboardAvoidingView, Platform, Pressable, TextInput, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

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
              maxLength={MAX_ENTRY_CHARS}
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
