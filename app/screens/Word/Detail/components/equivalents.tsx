import AppIcon from "@/components/AppIcon";
import AppText from "@/components/AppText";
import { useTheme } from "@/providers/Theme";
import { router } from "expo-router";
import { Pressable, View } from "react-native";
import { SenseConcept } from "../../data";
import SectionHeader from "./sectionHeader";

const LANGUAGE_NAMES: Record<string, string> = {
  en: "Tiếng Anh",
  vi: "Tiếng Việt",
  ja: "Tiếng Nhật",
  zh: "Tiếng Trung",
  ko: "Tiếng Hàn",
  es: "Tiếng Tây Ban Nha",
  fr: "Tiếng Pháp",
};

type Props = {
  concept?: SenseConcept | null;
};

/**
 * "Cùng nghĩa ở ngôn ngữ khác": các nghĩa giống hệt nghĩa này (server nối vào cùng một concept). Chưa nối / không có nghĩa nào
 * khác thì ẩn cả mục. Khái niệm khuyết từ vựng (không có từ tương đương một từ) ghi chú rõ thay vì ép một từ.
 */
const WordEquivalents = ({ concept }: Props) => {
  const { theme } = useTheme();
  const list = concept?.equivalents ?? [];
  if (!concept || (!list.length && concept.status !== "lexical_gap")) return null;

  const byLanguage = list.reduce<Record<string, typeof list>>((acc, item) => {
    (acc[item.language_code] ||= []).push(item);
    return acc;
  }, {});

  return (
    <View>
      <SectionHeader
        icon={<AppIcon branch="fa6" name="language" size={14} color="title" />}
        title="Cùng nghĩa ở ngôn ngữ khác"
      />

      {concept.status === "lexical_gap" && (
        <AppText color="subText3" font="MulishRegularItalic" size="sm" className="mt-2">
          Khái niệm này không có một từ tương đương gọn trong tiếng Anh.
        </AppText>
      )}

      {Object.entries(byLanguage).map(([lang, items]) => (
        <View key={lang} className="mt-2">
          <AppText size="xs" color="subText2">
            {LANGUAGE_NAMES[lang] ?? lang.toUpperCase()}
          </AppText>
          <View className="flex-row flex-wrap gap-2 mt-1">
            {items.map((item) => (
              <Pressable
                key={item.id}
                onPress={() =>
                  router.push({ pathname: "/screens/Word/Detail/[value]", params: { value: item.word } })
                }
                style={{ backgroundColor: theme.card, borderWidth: 1, borderColor: theme.border }}
                className="px-3 rounded-lg py-1.5"
              >
                <AppText size="sm">{item.word}</AppText>
              </Pressable>
            ))}
          </View>
        </View>
      ))}
    </View>
  );
};

export default WordEquivalents;
