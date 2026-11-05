import AppIcon from "@/components/AppIcon";
import AppText from "@/components/AppText";
import { useTheme } from "@/providers/Theme";
import { CollectionSummary, fetchSuggested } from "@/services/api/collections";
import { addAndDownload } from "@/services/collections";
import { useAppStore } from "@/stores/appStore";
import { Skeleton } from "@/ui";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "expo-router";
import { useSQLiteContext } from "expo-sqlite";
import { ActivityIndicator, Pressable, ScrollView, View } from "react-native";
import CollectionCover from "../../components/collectionCover";

const SuggestionCard = ({ item }: { item: CollectionSummary }) => {
  const { theme } = useTheme();
  const db = useSQLiteContext();
  const router = useRouter();
  const queryClient = useQueryClient();
  const userLang = useAppStore((s) => s.settings?.translate_language) ?? "vi";

  const add = useMutation({
    mutationFn: () => addAndDownload(db, item.id, userLang),
    onSuccess: (id) => {
      queryClient.invalidateQueries({ queryKey: ["collections"] });
      router.push({ pathname: "/screens/Collection/Detail/[id]", params: { id } });
    },
  });

  return (
    <View
      className="rounded-2xl overflow-hidden"
      style={{ width: 200, backgroundColor: theme.card, borderWidth: 1, borderColor: theme.border }}
    >
      <CollectionCover
        collection={{
          name: item.name,
          imageUrl: item.image_url,
          coverUri: null,
          coverWord: null,
          coverKeywords: [],
        }}
        radius={0}
        style={{ height: 100, width: "100%" }}
      />
      <View className="p-3 gap-1">
        <AppText numberOfLines={1} weight="bold" color="title">
          {item.name}
        </AppText>
        <AppText size="xs" color="subText2">
          {item.senses_count} nghĩa · {item.downloaded_count} lượt tải
        </AppText>
        <Pressable
          onPress={() => add.mutate()}
          disabled={add.isPending}
          className="mt-2 h-9 rounded-xl flex-row items-center justify-center gap-1.5"
          style={{ backgroundColor: theme.primary + "14" }}
        >
          {add.isPending ? (
            <ActivityIndicator size="small" color={theme.primary} />
          ) : (
            <AppIcon branch="feather" name="download" size={14} color={theme.primary} />
          )}
          <AppText size="sm" weight="bold" color="primary">
            {add.isPending ? "Đang tải..." : "Thêm & tải về"}
          </AppText>
        </Pressable>
        {add.isError && (
          <AppText size="xs" style={{ color: theme.error }}>
            Không tải được, thử lại sau.
          </AppText>
        )}
      </View>
    </View>
  );
};

/** Gợi ý bộ từ chưa có trong thư viện (theo chủ đề quan tâm). Ẩn khi không có mạng / không có gợi ý. */
const Suggestions = () => {
  const learningLang = useAppStore((s) => s.settings?.learning_language) ?? "en";
  const q = useQuery({
    queryKey: ["collections", "suggested", learningLang],
    queryFn: () => fetchSuggested(learningLang, []),
    retry: false,
  });

  if (q.isError || (!q.isLoading && !q.data?.length)) return null;
  return (
    <View className="gap-3">
      <AppText size="lg" weight="bold" color="title">
        Gợi ý cho bạn
      </AppText>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ gap: 12 }}
      >
        {q.isLoading
          ? [0, 1].map((i) => <Skeleton key={i} width={200} height={190} radius={20} />)
          : q.data!.map((c) => <SuggestionCard key={c.id} item={c} />)}
      </ScrollView>
    </View>
  );
};

export default Suggestions;
