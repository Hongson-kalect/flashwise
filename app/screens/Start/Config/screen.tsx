import AppIcon from "@/components/AppIcon";
import AppText from "@/components/AppText";
import { useTheme } from "@/providers/Theme";
import { fetchTopics, Tag } from "@/services/api/tags";
import { useAppStore } from "@/stores/appStore";
import { Lang, learningLanguages, motherLanguages } from "@/constants/languages";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { router } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import { ActivityIndicator, FlatList, Pressable, View } from "react-native";
import Animated, { FadeInDown, FadeInRight } from "react-native-reanimated";

const STEPS = [
  { key: "start", title: "Chào bạn! Cùng thiết lập vài điều trước khi học nhé." },
  { key: "learning", title: "Bạn muốn học ngôn ngữ nào?" },
  { key: "native", title: "Tiếng mẹ đẻ của bạn là gì?" },
  { key: "translation", title: "Hiện bản dịch tiếng mẹ đẻ khi học?" },
  { key: "topic", title: "Chọn vài chủ đề bạn quan tâm" },
] as const;

const StartConfigPage = () => {
  const { theme } = useTheme();
  const { displayLanguage, dbService, updateSetting } = useAppStore();
  const [step, setStep] = useState(0);
  const [saving, setSaving] = useState(false);

  const [learning, setLearning] = useState("en");
  // Tiếng mẹ đẻ mặc định: ngôn ngữ giao diện nếu khác ngôn ngữ đang học, không thì tiếng Việt (giao diện app là tiếng Việt)
  const [native, setNative] = useState(
    motherLanguages.find((l) => l.code === displayLanguage && l.code !== "en")?.code ?? "vi",
  );
  const [showTranslation, setShowTranslation] = useState(true);
  const [topics, setTopics] = useState<string[]>([]);

  const current = STEPS[step];
  const isLast = step === STEPS.length - 1;
  // Không lọc ngôn ngữ muốn học theo tiếng mẹ đẻ (trước đây đoán tiếng mẹ đẻ từ ngôn ngữ thiết bị nên mất English);
  // thay vào đó bước tiếng mẹ đẻ loại ngôn ngữ đang học, và đổi tiếng mẹ đẻ nếu trùng
  const nativeOptions = useMemo(
    () => motherLanguages.filter((l) => l.code !== learning),
    [learning],
  );
  const chooseLearning = (code: string) => {
    setLearning(code);
    if (code === native) setNative(code === "vi" ? "en" : "vi");
  };

  const finish = async () => {
    setSaving(true);
    try {
      const values = {
        learning_language: learning,
        translate_language: native,
        show_translation: showTranslation,
        interest_tags: topics,
      };
      for (const [k, v] of Object.entries(values)) {
        await dbService?.setSetting(k, v);
      }
      updateSetting(values);
      await AsyncStorage.setItem("hasSeenStartPage", "true");
      router.replace("/tabs");
    } finally {
      setSaving(false);
    }
  };

  const next = () => (isLast ? finish() : setStep(step + 1));

  return (
    <View className="flex-1 px-5" style={{ backgroundColor: theme.background }}>
      <View className="flex-row items-center gap-3 pt-3 h-12">
        {step > 0 ? (
          <Pressable hitSlop={12} onPress={() => setStep(step - 1)}>
            <AppIcon branch="feather" name="arrow-left" size={24} color={theme.text} />
          </Pressable>
        ) : (
          <View style={{ width: 24 }} />
        )}
        <View
          className="flex-1 h-2 rounded-full overflow-hidden"
          style={{ backgroundColor: theme.card }}
        >
          <View
            className="h-full rounded-full"
            style={{
              width: `${((step + 1) / STEPS.length) * 100}%`,
              backgroundColor: theme.primary,
            }}
          />
        </View>
      </View>

      <Animated.View key={step} entering={FadeInDown.duration(250)} className="mt-6">
        <AppText size="3xl" font="MulishBold" color="title">
          {current.title}
        </AppText>
        {current.key === "learning" && (
          <AppText color="subText2" className="mt-1">
            Bạn có thể thêm ngôn ngữ khác sau.
          </AppText>
        )}
      </Animated.View>

      <View className="flex-1 mt-4">
        {current.key === "start" && <Welcome />}
        {current.key === "learning" && (
          <LanguageList
            data={learningLanguages}
            value={learning}
            onSelect={chooseLearning}
          />
        )}
        {current.key === "native" && (
          <LanguageList data={nativeOptions} value={native} onSelect={setNative} />
        )}
        {current.key === "translation" && (
          <TranslationChoice value={showTranslation} onSelect={setShowTranslation} />
        )}
        {current.key === "topic" && (
          <TopicPicker
            lang={learning}
            userLang={native}
            value={topics}
            onChange={setTopics}
          />
        )}
      </View>

      <View className="pb-8 pt-3">
        <Pressable
          disabled={saving}
          onPress={next}
          className="h-14 rounded-2xl flex-row items-center justify-center gap-2"
          style={{ backgroundColor: theme.primary }}
        >
          {saving ? (
            <ActivityIndicator color="white" />
          ) : (
            <>
              <AppText color="white" size="lg" font="MulishBold">
                {isLast ? (topics.length ? "Vào học thôi" : "Bỏ qua và bắt đầu") : "Tiếp tục"}
              </AppText>
              <AppIcon
                branch="feather"
                name={isLast ? "check" : "arrow-right"}
                size={20}
                color="white"
              />
            </>
          )}
        </Pressable>
      </View>
    </View>
  );
};

const Welcome = () => {
  const { theme } = useTheme();
  const items = [
    ["globe", "Chọn ngôn ngữ muốn học"],
    ["message-circle", "Chọn tiếng mẹ đẻ để xem nghĩa"],
    ["compass", "Gợi ý bộ từ theo chủ đề bạn thích"],
  ] as const;
  return (
    <View className="gap-3 mt-2">
      {items.map(([icon, text], i) => (
        <Animated.View
          key={text}
          entering={FadeInRight.delay(100 * i)}
          className="flex-row items-center gap-4 p-4 rounded-2xl"
          style={{ backgroundColor: theme.card }}
        >
          <View
            className="h-11 w-11 rounded-full items-center justify-center"
            style={{ backgroundColor: theme.tertiary }}
          >
            <AppIcon branch="feather" name={icon} size={20} color={theme.primary} />
          </View>
          <AppText className="flex-1" font="MulishSemiBold">
            {text}
          </AppText>
        </Animated.View>
      ))}
    </View>
  );
};

const OptionRow = ({
  label,
  hint,
  active,
  onPress,
}: {
  label: string;
  hint?: string;
  active: boolean;
  onPress: () => void;
}) => {
  const { theme } = useTheme();
  return (
    <Pressable
      onPress={onPress}
      className="flex-row items-center px-4 py-4 rounded-2xl border-2"
      style={{
        borderColor: active ? theme.primary : "transparent",
        backgroundColor: active ? theme.tertiary + "55" : theme.card,
      }}
    >
      <View className="flex-1">
        <AppText font="MulishSemiBold" color={active ? "primary" : "text"}>
          {label}
        </AppText>
        {hint && (
          <AppText size="sm" color="subText2">
            {hint}
          </AppText>
        )}
      </View>
      {active && (
        <AppIcon branch="feather" name="check-circle" size={22} color={theme.primary} />
      )}
    </Pressable>
  );
};

const LanguageList = ({
  data,
  value,
  onSelect,
}: {
  data: Lang[];
  value: string;
  onSelect: (code: string) => void;
}) => (
  <FlatList
    data={data}
    keyExtractor={(i) => i.code}
    showsVerticalScrollIndicator={false}
    contentContainerStyle={{ gap: 10, paddingBottom: 12 }}
    renderItem={({ item }) => (
      <OptionRow
        label={item.language}
        active={item.code === value}
        onPress={() => onSelect(item.code)}
      />
    )}
  />
);

const TranslationChoice = ({
  value,
  onSelect,
}: {
  value: boolean;
  onSelect: (v: boolean) => void;
}) => (
  <View className="gap-3 mt-2">
    <OptionRow
      label="Có, hiện bản dịch"
      hint="Dễ hiểu hơn khi mới học. Có thể tắt bất cứ lúc nào."
      active={value}
      onPress={() => onSelect(true)}
    />
    <OptionRow
      label="Không, chỉ dùng ngôn ngữ đích"
      hint="Giúp bạn nghĩ trực tiếp bằng ngoại ngữ."
      active={!value}
      onPress={() => onSelect(false)}
    />
  </View>
);

const TopicPicker = ({
  lang,
  userLang,
  value,
  onChange,
}: {
  lang: string;
  userLang: string;
  value: string[];
  onChange: (ids: string[]) => void;
}) => {
  const { theme } = useTheme();
  const [tags, setTags] = useState<Tag[] | null>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let alive = true;
    fetchTopics(lang, userLang)
      .then((t) => alive && setTags(t))
      .catch(() => alive && (setFailed(true), setTags([])));
    return () => {
      alive = false;
    };
  }, [lang, userLang]);

  if (!tags) return <ActivityIndicator className="mt-10" color={theme.primary} />;

  if (!tags.length) {
    return (
      <View className="items-center mt-10 gap-2">
        <AppIcon branch="feather" name={failed ? "wifi-off" : "inbox"} size={36} color={theme.subText3} />
        <AppText color="subText2" style={{ textAlign: "center" }}>
          {failed
            ? "Không kết nối được máy chủ. Bạn có thể bỏ qua, chọn chủ đề sau trong Cài đặt."
            : "Chưa có chủ đề nào cho ngôn ngữ này."}
        </AppText>
      </View>
    );
  }

  const toggle = (id: string) =>
    onChange(value.includes(id) ? value.filter((v) => v !== id) : [...value, id]);

  return (
    <FlatList
      data={tags}
      keyExtractor={(t) => t.id}
      numColumns={2}
      showsVerticalScrollIndicator={false}
      columnWrapperStyle={{ gap: 10 }}
      contentContainerStyle={{ gap: 10, paddingBottom: 12 }}
      renderItem={({ item }) => {
        const active = value.includes(item.id);
        return (
          <Pressable
            onPress={() => toggle(item.id)}
            className="flex-1 px-4 py-5 rounded-2xl border-2 items-center"
            style={{
              borderColor: active ? theme.primary : "transparent",
              backgroundColor: active ? theme.tertiary + "55" : theme.card,
            }}
          >
            <AppText font="MulishSemiBold" color={active ? "primary" : "text"}>
              {item.name}
            </AppText>
            <AppText size="xs" color="subText2">
              {item.collection_count} bộ từ
            </AppText>
          </Pressable>
        );
      }}
    />
  );
};

export default StartConfigPage;
