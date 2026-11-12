import AppIcon from "@/components/AppIcon";
import AppText from "@/components/AppText";
import { useTheme } from "@/providers/Theme";
import { fetchWordSenses, WordSenseOption, WordSensesResult } from "@/services/api/collections";
import { Skeleton } from "@/ui";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useMemo, useState } from "react";
import { ActivityIndicator, FlatList, Pressable, View } from "react-native";

export type ChosenSenses = { senseIds: string[]; pendingWords: string[]; offensiveWords: string[] };

type Props = {
  words: string[];
  lang: string;
  userLang: string;
  submitting: boolean;
  onBack: () => void;
  onSubmit: (chosen: ChosenSenses) => void;
};

const cap = (s: string) => (s ? s[0].toUpperCase() + s.slice(1) : s);

const SenseRow = ({
  sense,
  selected,
  onToggle,
}: {
  sense: WordSenseOption;
  selected: boolean;
  onToggle: () => void;
}) => {
  const { theme } = useTheme();
  return (
    <Pressable
      onPress={onToggle}
      className="flex-row gap-3 p-3 rounded-xl"
      style={{
        backgroundColor: selected ? theme.primary + "14" : theme.background,
        borderWidth: 1,
        borderColor: selected ? theme.primary : theme.border,
      }}
    >
      <AppIcon
        branch="feather"
        name={selected ? "check-square" : "square"}
        size={20}
        color={selected ? theme.primary : theme.subText3}
        style={{ marginTop: 2 }}
      />
      <View className="flex-1 gap-1">
        <View className="flex-row items-center gap-2 flex-wrap">
          {sense.pos ? (
            <View className="px-2 h-5 rounded-md items-center justify-center" style={{ backgroundColor: theme.primary + "14" }}>
              <AppText size="xs" weight="semibold" color="primary">
                {sense.pos}
              </AppText>
            </View>
          ) : null}
          {sense.level ? (
            <View className="px-2 h-5 rounded-md items-center justify-center" style={{ backgroundColor: theme.accent + "26" }}>
              <AppText size="xs" weight="semibold" style={{ color: theme.accent }}>
                {sense.level}
              </AppText>
            </View>
          ) : null}
          {sense.best ? (
            <AppText size="xs" color="subText2">
              · Phù hợp nhất
            </AppText>
          ) : null}
        </View>
        {sense.translations.length ? (
          <AppText weight="semibold" color="title">
            {sense.translations.join(", ")}
          </AppText>
        ) : null}
        <AppText size="sm" color="subText1" numberOfLines={3}>
          {sense.definition}
        </AppText>
        {sense.example ? (
          <AppText size="xs" color="subText3" numberOfLines={2} style={{ fontStyle: "italic" }}>
            {sense.example}
          </AppText>
        ) : null}
      </View>
    </Pressable>
  );
};

/**
 * Bước 2 của chế độ chuyên sâu: với mỗi từ hiện các nghĩa chính thức để chọn (chọn được nhiều nghĩa của cùng một từ).
 * Mặc định tick nghĩa phù hợp nhất. Từ chưa có trong từ điển thì không có gì để chọn: được tạo tự động và lấy nghĩa tốt nhất.
 */
const ChooseSenses = ({ words, lang, userLang, submitting, onBack, onSubmit }: Props) => {
  const { theme } = useTheme();
  const q = useQuery({
    queryKey: ["collection-create-senses", lang, userLang, words.join("|")],
    queryFn: () => fetchWordSenses(lang, userLang, words),
    staleTime: 0,
    retry: 1,
  });
  const results = q.data;

  // Mỗi từ: tập id nghĩa đang chọn. Khởi tạo từ nghĩa `best` khi dữ liệu về.
  const [chosen, setChosen] = useState<Record<string, string[]>>({});
  useEffect(() => {
    if (!results) return;
    setChosen(
      Object.fromEntries(
        words.map((w) => [w, (results[w.toLowerCase()]?.senses ?? []).filter((s) => s.best).map((s) => s.id)]),
      ),
    );
  }, [results]);

  const toggle = (word: string, id: string) =>
    setChosen((c) => {
      const cur = c[word] ?? [];
      return { ...c, [word]: cur.includes(id) ? cur.filter((x) => x !== id) : [...cur, id] };
    });

  const stat = (word: string): WordSensesResult | undefined => results?.[word.toLowerCase()];
  const senseCount = useMemo(() => Object.values(chosen).reduce((n, ids) => n + ids.length, 0), [chosen]);
  const pendingWords = useMemo(
    () => words.filter((w) => ["processing", "unknown"].includes(stat(w)?.status ?? "")),
    [results, words],
  );
  // Từ có nghĩa thô tục đang được chọn: app báo sau khi tạo bộ
  const offensiveWords = useMemo(
    () => words.filter((w) => (results?.[w.toLowerCase()]?.senses ?? []).some((s) => s.offensive && (chosen[w] ?? []).includes(s.id))),
    [results, words, chosen],
  );
  const canSubmit = !submitting && (senseCount > 0 || pendingWords.length > 0);

  return (
    <View className="flex-1">
      <FlatList
        data={words}
        keyExtractor={(w) => w}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ padding: 16, paddingBottom: 120, gap: 12 }}
        ListHeaderComponent={
          <View className="gap-1 pb-2">
            <AppText size="xl" weight="bold" color="title">
              Chọn nghĩa cho từng từ
            </AppText>
            <AppText color="subText1">
              Chọn một hoặc nhiều nghĩa mỗi từ. Khi học, các nghĩa của cùng một từ sẽ không xuất hiện trong cùng một lượt.
            </AppText>
          </View>
        }
        renderItem={({ item: word }) => {
          if (q.isLoading) {
            return <Skeleton width="100%" height={110} radius={20} />;
          }
          const info = stat(word);
          const senses = info?.senses ?? [];
          return (
            <View
              className="p-3 rounded-2xl gap-2"
              style={{ backgroundColor: theme.card, borderWidth: 1, borderColor: theme.border }}
            >
              <AppText size="lg" weight="bold" color="title">
                {cap(word)}
              </AppText>
              {senses.length ? (
                senses.map((s) => (
                  <SenseRow
                    key={s.id}
                    sense={s}
                    selected={(chosen[word] ?? []).includes(s.id)}
                    onToggle={() => toggle(word, s.id)}
                  />
                ))
              ) : (
                <View className="flex-row gap-2 items-start">
                  <AppIcon
                    branch="feather"
                    name={info?.status === "rejected" || info?.status === "invalid" ? "slash" : "clock"}
                    size={15}
                    color={theme.subText2}
                    style={{ marginTop: 2 }}
                  />
                  <AppText size="sm" color="subText2" style={{ flex: 1 }}>
                    {info?.status === "rejected" || info?.status === "invalid"
                      ? "Không dùng được từ này, sẽ bị bỏ qua."
                      : "Từ này chưa có trong từ điển. Nó sẽ được tạo tự động và thêm vào bộ với nghĩa phù hợp nhất."}
                  </AppText>
                </View>
              )}
            </View>
          );
        }}
        ListEmptyComponent={
          q.isError ? (
            <AppText color="subText2" textAlign="center" style={{ paddingTop: 24 }}>
              Không tải được danh sách nghĩa. Kiểm tra mạng rồi thử lại.
            </AppText>
          ) : null
        }
      />

      <View
        className="absolute left-0 right-0 bottom-0 px-4 pt-3 pb-5 flex-row gap-3"
        style={{ backgroundColor: theme.background, borderTopWidth: 1, borderTopColor: theme.border }}
      >
        <Pressable
          onPress={onBack}
          disabled={submitting}
          className="h-14 px-5 rounded-2xl items-center justify-center"
          style={{ backgroundColor: theme.primary + "14" }}
        >
          <AppText weight="bold" color="primary">
            Quay lại
          </AppText>
        </Pressable>
        <Pressable
          onPress={() => onSubmit({ senseIds: Object.values(chosen).flat(), pendingWords, offensiveWords })}
          disabled={!canSubmit}
          className="flex-1 h-14 rounded-2xl flex-row items-center justify-center gap-2"
          style={{ backgroundColor: theme.primary, opacity: canSubmit ? 1 : 0.45 }}
        >
          {submitting ? <ActivityIndicator color="white" /> : null}
          <AppText color="white" size="lg" weight="bold">
            {submitting ? "Đang tạo..." : `Tạo bộ (${senseCount} nghĩa${pendingWords.length ? ` + ${pendingWords.length} từ mới` : ""})`}
          </AppText>
        </Pressable>
      </View>
    </View>
  );
};

export default ChooseSenses;
