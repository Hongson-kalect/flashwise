import AppIcon from "@/components/AppIcon";
import AppReturnHeader from "@/components/AppReturnHeader";
import AppText from "@/components/AppText";
import { Lang, learningLanguages, motherLanguages } from "@/constants/languages";
import { useTheme } from "@/providers/Theme";
import { useAppStore } from "@/stores/appStore";
import { useState } from "react";
import { Pressable, ScrollView, View } from "react-native";

/**
 * Cá nhân → Ngôn ngữ: đổi ngôn ngữ đang học và ngôn ngữ dịch (tiếng mẹ đẻ). Ghi `user_settings` (đồng bộ lên server)
 * và store; trang từ / bộ từ đọc lại theo `settings` nên đổi xong có hiệu lực ngay. Hai ngôn ngữ không được trùng nhau.
 */
const LanguageSettingsScreen = () => {
  const { theme } = useTheme();
  const settings = useAppStore((s) => s.settings);
  const dbService = useAppStore((s) => s.dbService);
  const updateSetting = useAppStore((s) => s.updateSetting);
  const [saving, setSaving] = useState(false);

  const learning: string = settings?.learning_language ?? "en";
  const native: string = settings?.translate_language ?? "vi";

  const save = async (values: Record<string, string>) => {
    if (saving) return;
    setSaving(true);
    try {
      for (const [k, v] of Object.entries(values)) await dbService?.setSetting(k, v);
      updateSetting(values);
    } finally {
      setSaving(false);
    }
  };

  const chooseLearning = (code: string) => {
    if (code === learning) return;
    // Trùng với ngôn ngữ dịch thì đẩy ngôn ngữ dịch sang mặc định khác
    save(code === native ? { learning_language: code, translate_language: code === "vi" ? "en" : "vi" } : { learning_language: code });
  };
  const chooseNative = (code: string) => {
    if (code === native) return;
    save({ translate_language: code });
  };

  return (
    <View className="flex-1" style={{ backgroundColor: theme.background }}>
      <AppReturnHeader title="Ngôn ngữ" />
      <ScrollView className="px-4" contentContainerStyle={{ paddingBottom: 32 }}>
        <Section title="Ngôn ngữ đang học" hint="Từ bạn tra và học là ngôn ngữ này.">
          {learningLanguages.map((l) => (
            <Row key={l.code} lang={l} selected={l.code === learning} onPress={() => chooseLearning(l.code)} />
          ))}
        </Section>
        <Section title="Ngôn ngữ dịch (tiếng mẹ đẻ)" hint="Bản dịch nghĩa, ví dụ hiện bằng ngôn ngữ này.">
          {motherLanguages
            .filter((l) => l.code !== learning)
            .map((l) => (
              <Row key={l.code} lang={l} selected={l.code === native} onPress={() => chooseNative(l.code)} />
            ))}
        </Section>
      </ScrollView>
    </View>
  );
};

const Section = ({ title, hint, children }: { title: string; hint: string; children: React.ReactNode }) => (
  <View className="mt-4">
    <AppText font="MulishBold" size="lg" color="title">
      {title}
    </AppText>
    <AppText size="xs" color="subText2" style={{ marginBottom: 8, marginTop: 2 }}>
      {hint}
    </AppText>
    {children}
  </View>
);

const Row = ({ lang, selected, onPress }: { lang: Lang; selected: boolean; onPress: () => void }) => {
  const { theme } = useTheme();
  return (
    <Pressable
      onPress={onPress}
      className="flex-row items-center justify-between px-4 rounded-xl mb-1.5"
      style={{
        height: 46,
        backgroundColor: selected ? theme.primary + "14" : theme.card,
        borderWidth: 1,
        borderColor: selected ? theme.primary : theme.border,
      }}
    >
      <AppText color={selected ? "primary" : "text"} font={selected ? "MulishBold" : "MulishSemiBold"}>
        {lang.language}
      </AppText>
      {selected && <AppIcon branch="feather" name="check" size={18} color="primary" />}
    </Pressable>
  );
};

export default LanguageSettingsScreen;
