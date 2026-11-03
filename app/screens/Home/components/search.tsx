import AppIcon from "@/components/AppIcon";
import SearchBar from "@/components/SearchBar";
import AppText from "@/components/AppText";
import { useDebounce } from "@/hooks/useDebouce";
import { useTheme } from "@/providers/Theme";
import { searchWords } from "@/services/api/words";
import { useAppStore } from "@/stores/appStore";
import { useQuery } from "@tanstack/react-query";
import { router } from "expo-router";
import { useState } from "react";
import { Pressable, View } from "react-native";

const HomeSearch = () => {
  const { theme } = useTheme();
  const lang = useAppStore((s) => s.settings?.learning_language ?? "en");
  const [value, setValue] = useState("");
  const q = useDebounce(value.trim());

  const { data = [], isFetching } = useQuery({
    queryKey: ["searchWord", q, lang],
    queryFn: () => searchWords(q, lang),
    enabled: q.length > 0,
    staleTime: 60_000,
  });

  // Từ chưa có trong hệ thống vẫn mở được: màn chi tiết sẽ nhờ AI tạo.
  const open = (word: string) => {
    setValue("");
    router.push({
      pathname: "/screens/Word/Detail/[value]",
      params: { value: word },
    });
  };

  return (
    <View>
      <SearchBar
        value={value}
        onChangeText={setValue}
        placeholder="Tra từ bất kỳ..."
        onSubmitEditing={() => value.trim() && open(value.trim())}
      />

      {q.length > 0 && (
        <View
          className="mt-2 rounded-2xl overflow-hidden"
          style={{ backgroundColor: theme.card, borderWidth: 1, borderColor: theme.border }}
        >
          {data.map((w) => (
            <Pressable
              key={w.id}
              onPress={() => open(w.value)}
              className="px-4 py-3 flex-row items-center justify-between"
            >
              <AppText font="MulishSemiBold">{w.value}</AppText>
              <AppIcon branch="feather" name="chevron-right" size={16} color={theme.subText3} />
            </Pressable>
          ))}
          <Pressable
            onPress={() => open(q)}
            className="px-4 py-3 flex-row items-center gap-2"
          >
            <AppIcon branch="feather" name="plus-circle" size={16} color={theme.primary} />
            <AppText color="primary" font="MulishSemiBold" size="sm">
              {isFetching && !data.length ? "Đang tìm..." : `Tra "${q}"`}
            </AppText>
          </Pressable>
        </View>
      )}
    </View>
  );
};

export default HomeSearch;
