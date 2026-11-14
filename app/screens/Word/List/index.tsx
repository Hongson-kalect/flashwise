import AppChip from "@/components/AppChip";
import AppIcon from "@/components/AppIcon";
import AppText from "@/components/AppText";
import SearchBar from "@/components/SearchBar";
import { Skeleton, useDebounce } from "@/ui";
import { getWordStats, listWords, WordSort } from "@/database/queries/words";
import { useAppNavigation } from "@/hooks/useNavigation";
import { useTheme } from "@/providers/Theme";
import { useAppStore } from "@/stores/appStore";
import { useQuery } from "@tanstack/react-query";
import { useSQLiteContext } from "expo-sqlite";
import { useState } from "react";
import { FlatList, Pressable, View } from "react-native";
import ListHeader from "./components/header";
import WordListItem from "./components/listItem";
import ListSumary from "./components/sumary";

const SORTS: { key: WordSort; label: string }[] = [
  { key: "alpha", label: "A–Z" },
  { key: "recent", label: "Mới nhất" },
  { key: "learned", label: "Đã học" },
];

/** Tab Từ vựng: các từ đã tra / lưu trong máy, gộp nghĩa theo từ. */
export default function CardPage() {
  const { theme } = useTheme();
  const db = useSQLiteContext();
  const { routerPush } = useAppNavigation();
  const userLang = useAppStore((s) => s.settings?.translate_language);
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState<WordSort>("alpha");
  const q = useDebounce(search, 250);

  const stats = useQuery({
    queryKey: ["words", "stats"],
    queryFn: () => getWordStats(db),
  });
  const list = useQuery({
    queryKey: ["words", "list", q, sort, userLang],
    queryFn: () => listWords(db, { q, sort, userLang }),
  });

  const empty = !list.isLoading && !list.data?.length;

  return (
    <View style={{ backgroundColor: theme.background }} className="flex-1">
      <View className="px-4">
        <ListHeader />
      </View>

      <FlatList
        data={list.data ?? []}
        keyExtractor={(w) => w.wordId}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 32, gap: 8 }}
        ListHeaderComponent={
          <View className="gap-3 pb-1">
            <ListSumary stats={stats.data} loading={stats.isLoading} />
            <SearchBar
              value={search}
              onChangeText={setSearch}
              placeholder="Tìm trong từ vựng của bạn..."
            />
            <View className="flex-row items-center justify-between">
              <AppText size="sm" color="subText2">
                {list.data ? `${list.data.length} từ` : " "}
              </AppText>
              <View className="flex-row gap-2">
                {SORTS.map((s) => (
                  <AppChip
                    key={s.key}
                    label={s.label}
                    size="sm"
                    selected={sort === s.key}
                    onPress={() => setSort(s.key)}
                  />
                ))}
              </View>
            </View>
          </View>
        }
        renderItem={({ item }) => <WordListItem word={item} />}
        ListEmptyComponent={
          list.isLoading ? (
            <View className="gap-3">
              {[0, 1, 2, 3].map((i) => (
                <View
                  key={i}
                  className="flex-row items-center gap-3 p-3 rounded-2xl"
                  style={{ backgroundColor: theme.card, borderWidth: 1, borderColor: theme.border }}
                >
                  <Skeleton width={96} height={72} radius={12} />
                  <View className="flex-1 gap-2">
                    <Skeleton width="55%" height={16} />
                    <Skeleton width="85%" height={12} />
                    <Skeleton width="40%" height={12} />
                  </View>
                </View>
              ))}
            </View>
          ) : empty ? (
            <View className="items-center pt-10 px-6 gap-3">
              <View
                className="h-16 w-16 rounded-full items-center justify-center"
                style={{ backgroundColor: theme.primary + "14" }}
              >
                <AppIcon branch="feather" name="book-open" size={28} color={theme.primary} />
              </View>
              <AppText size="lg" weight="bold" color="title">
                {search ? "Không tìm thấy từ nào" : "Chưa có từ nào"}
              </AppText>
              <AppText color="subText2" textAlign="center">
                {search
                  ? "Thử từ khoá khác, hoặc tra từ này ở trang chủ."
                  : "Tra một từ ở Trang chủ, từ đó sẽ được lưu vào đây để xem lại khi không có mạng."}
              </AppText>
              <Pressable
                onPress={() => routerPush("/screens/Word/Create/screen")}
                className="mt-2 h-11 px-5 rounded-2xl items-center justify-center flex-row gap-2"
                style={{ backgroundColor: theme.primary + "14" }}
              >
                <AppIcon branch="feather" name="plus" size={16} color={theme.primary} />
                <AppText color="primary" weight="bold">
                  Tìm kiếm từ mới
                </AppText>
              </Pressable>
            </View>
          ) : null
        }
      />
    </View>
  );
}
