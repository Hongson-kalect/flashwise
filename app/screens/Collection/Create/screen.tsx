import AppIcon from "@/components/AppIcon";
import AppReturnHeader from "@/components/AppReturnHeader";
import AppText from "@/components/AppText";
import { useTheme } from "@/providers/Theme";
import { createCollectionErrorKind } from "@/services/api/collections";
import { createAdvanced, createQuick } from "@/services/collections";
import { useAppStore } from "@/stores/appStore";
import { parseWords } from "@/utils/entryProblem";
import { useQueryClient } from "@tanstack/react-query";
import { router } from "expo-router";
import { useSQLiteContext } from "expo-sqlite";
import { useMemo, useState } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  TextInput,
  View,
} from "react-native";

import ChooseSenses, { ChosenSenses } from "./components/chooseSenses";

const MAX_WORDS = 200; // khớp BULK_MAX_WORDS_PER_REQUEST của server

type Mode = "quick" | "advanced";

const ERROR_TEXT = {
  quota: "Hôm nay bạn đã dùng hết lượt tạo từ mới. Thử lại vào ngày mai, hoặc bỏ bớt từ chưa có trong từ điển.",
  invalid: "Thông tin chưa hợp lệ. Kiểm tra lại tên bộ và danh sách từ.",
  forbidden: "Tài khoản của bạn chưa được phép làm việc này.",
  offline: "Không kết nối được máy chủ. Kiểm tra mạng rồi thử lại.",
  unknown: "Có lỗi xảy ra, thử lại sau.",
} as const;

const ModeCard = ({
  selected,
  icon,
  title,
  desc,
  onPress,
}: {
  selected: boolean;
  icon: "zap" | "sliders";
  title: string;
  desc: string;
  onPress: () => void;
}) => {
  const { theme } = useTheme();
  return (
    <Pressable
      onPress={onPress}
      className="flex-1 p-3 rounded-2xl gap-1"
      style={{
        backgroundColor: selected ? theme.primary + "14" : theme.card,
        borderWidth: 2,
        borderColor: selected ? theme.primary : theme.border,
      }}
    >
      <View className="flex-row items-center gap-2">
        <AppIcon branch="feather" name={icon} size={16} color={selected ? theme.primary : theme.subText2} />
        <AppText weight="bold" color={selected ? "primary" : "title"}>
          {title}
        </AppText>
      </View>
      <AppText size="xs" color="subText2">
        {desc}
      </AppText>
    </Pressable>
  );
};

const inputStyle = (theme: any, focused = false) => ({
  color: theme.text,
  backgroundColor: theme.card,
  borderColor: focused ? theme.primary : theme.border,
  borderWidth: 1.5,
  borderRadius: 16,
  paddingHorizontal: 16,
  fontFamily: "MulishSemiBold",
  fontSize: 16,
});

/**
 * Tạo bộ từ. Nhập tên + danh sách từ rồi chọn chế độ:
 * - Nhanh (mặc định): server chọn nghĩa chính thức tốt nhất cho từng từ, từ chưa có thì AI tạo dần.
 * - Chuyên sâu: tự chọn nghĩa (được chọn nhiều nghĩa mỗi từ) ở bước 2.
 */
export default function CreateCollection() {
  const { theme } = useTheme();
  const db = useSQLiteContext();
  const queryClient = useQueryClient();
  const lang: string = useAppStore((s) => s.settings?.learning_language) ?? "en";
  const userLang: string = useAppStore((s) => s.settings?.translate_language) ?? "vi";

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [text, setText] = useState("");
  const [mode, setMode] = useState<Mode>("quick");
  const [step, setStep] = useState<"input" | "choose">("input");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const parsed = useMemo(() => parseWords(text, lang), [text, lang]);
  const tooMany = parsed.words.length > MAX_WORDS;
  const words = parsed.words.slice(0, MAX_WORDS);
  const ready = name.trim().length > 0 && words.length > 0 && !tooMany;

  const done = async (id: string) => {
    await queryClient.invalidateQueries({ queryKey: ["collections"] });
    router.replace({ pathname: "/screens/Collection/Detail/[id]", params: { id } });
  };

  const fail = (e: any) => {
    setError(ERROR_TEXT[createCollectionErrorKind(e)]);
    setStep("input");
  };

  const createFast = async () => {
    setError(null);
    setSubmitting(true);
    try {
      done(await createQuick(db, { name: name.trim(), description: description.trim(), lang, userLang, words }));
    } catch (e) {
      fail(e);
      setSubmitting(false);
    }
  };

  const createChosen = async ({ senseIds, pendingWords }: ChosenSenses) => {
    setError(null);
    setSubmitting(true);
    try {
      done(
        await createAdvanced(db, {
          name: name.trim(),
          description: description.trim(),
          lang,
          userLang,
          senseIds,
          pendingWords,
        }),
      );
    } catch (e) {
      fail(e);
      setSubmitting(false);
    }
  };

  const submit = () => (mode === "quick" ? createFast() : setStep("choose"));

  return (
    <View style={{ flex: 1, backgroundColor: theme.background }}>
      <AppReturnHeader title={step === "choose" ? "Chọn nghĩa" : "Tạo bộ từ"} />
      {step === "choose" ? (
        <ChooseSenses
          words={words}
          lang={lang}
          userLang={userLang}
          submitting={submitting}
          onBack={() => setStep("input")}
          onSubmit={createChosen}
        />
      ) : (
        <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : undefined}>
          <ScrollView
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ padding: 16, paddingBottom: 32, gap: 18 }}
          >
            <View className="gap-2">
              <AppText size="sm" weight="semibold" color="subText1">
                Tên bộ
              </AppText>
              <TextInput
                value={name}
                onChangeText={setName}
                maxLength={255}
                placeholder="vd: Từ vựng đi du lịch"
                placeholderTextColor={theme.subText3}
                style={[inputStyle(theme), { height: 52 }]}
              />
            </View>

            <View className="gap-2">
              <AppText size="sm" weight="semibold" color="subText1">
                Mô tả (không bắt buộc)
              </AppText>
              <TextInput
                value={description}
                onChangeText={setDescription}
                maxLength={2000}
                multiline
                placeholder="Bộ này dùng để làm gì?"
                placeholderTextColor={theme.subText3}
                style={[inputStyle(theme), { minHeight: 52, paddingTop: 14, textAlignVertical: "top" }]}
              />
            </View>

            <View className="gap-2">
              <View className="flex-row items-center justify-between">
                <AppText size="sm" weight="semibold" color="subText1">
                  Danh sách từ ({lang.toUpperCase()})
                </AppText>
                <AppText size="sm" style={{ color: tooMany ? theme.error : theme.subText2 }}>
                  {parsed.words.length}/{MAX_WORDS} từ
                </AppText>
              </View>
              <TextInput
                value={text}
                onChangeText={(t) => {
                  setText(t);
                  if (error) setError(null);
                }}
                multiline
                autoCapitalize="none"
                autoCorrect={false}
                placeholder={"Mỗi từ một dòng, hoặc ngăn cách bằng dấu phẩy.\nvd:\nairport\nboarding pass\nbreak the ice"}
                placeholderTextColor={theme.subText3}
                style={[inputStyle(theme), { minHeight: 170, paddingTop: 14, textAlignVertical: "top" }]}
              />
              {tooMany && (
                <AppText size="sm" style={{ color: theme.error }}>
                  Tối đa {MAX_WORDS} từ mỗi bộ khi tạo. Bạn có thể thêm tiếp sau khi tạo.
                </AppText>
              )}
              {parsed.skipped.length > 0 && (
                <View className="flex-row gap-2 items-start">
                  <AppIcon branch="feather" name="alert-circle" size={15} color={theme.warning} style={{ marginTop: 2 }} />
                  <AppText size="sm" color="subText1" style={{ flex: 1 }}>
                    Bỏ qua {parsed.skipped.length} mục không phải từ hoặc cụm từ:{" "}
                    {parsed.skipped
                      .slice(0, 3)
                      .map((s) => `"${s.word.length > 24 ? s.word.slice(0, 24) + "…" : s.word}"`)
                      .join(", ")}
                    {parsed.skipped.length > 3 ? "…" : ""}
                  </AppText>
                </View>
              )}
            </View>

            <View className="gap-2">
              <AppText size="sm" weight="semibold" color="subText1">
                Cách thêm từ
              </AppText>
              <View className="flex-row gap-3">
                <ModeCard
                  selected={mode === "quick"}
                  icon="zap"
                  title="Nhanh"
                  desc="Tự chọn nghĩa phổ biến và phù hợp nhất cho từng từ."
                  onPress={() => setMode("quick")}
                />
                <ModeCard
                  selected={mode === "advanced"}
                  icon="sliders"
                  title="Chuyên sâu"
                  desc="Tự chọn nghĩa, chọn được nhiều nghĩa mỗi từ."
                  onPress={() => setMode("advanced")}
                />
              </View>
            </View>

            {!!error && (
              <View className="flex-row gap-2 items-start p-3 rounded-2xl" style={{ backgroundColor: theme.error + "14" }}>
                <AppIcon branch="feather" name="alert-circle" size={16} color={theme.error} style={{ marginTop: 2 }} />
                <AppText size="sm" style={{ flex: 1, color: theme.error }}>
                  {error}
                </AppText>
              </View>
            )}

            <Pressable
              disabled={!ready || submitting}
              onPress={submit}
              className="h-14 rounded-2xl flex-row items-center justify-center gap-2"
              style={{ backgroundColor: theme.primary, opacity: ready && !submitting ? 1 : 0.45 }}
            >
              {submitting ? <ActivityIndicator color="white" /> : null}
              <AppText color="white" size="lg" weight="bold">
                {submitting ? "Đang tạo..." : mode === "quick" ? "Tạo bộ" : "Tiếp tục: chọn nghĩa"}
              </AppText>
              {!submitting && mode === "advanced" ? (
                <AppIcon branch="feather" name="arrow-right" size={18} color="white" />
              ) : null}
            </Pressable>
          </ScrollView>
        </KeyboardAvoidingView>
      )}
    </View>
  );
}
