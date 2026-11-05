import AppIcon from "@/components/AppIcon";
import AppReturnHeader from "@/components/AppReturnHeader";
import AppText from "@/components/AppText";
import SearchBar from "@/components/SearchBar";
import { useTheme } from "@/providers/Theme";
import { DiscoverOrdering, fetchDiscover } from "@/services/api/collections";
import { fetchTopics } from "@/services/api/tags";
import { useAppStore } from "@/stores/appStore";
import { Skeleton, useDebounce } from "@/ui";
import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
import { router } from "expo-router";
import { useState } from "react";
import { ActivityIndicator, FlatList, Pressable, RefreshControl, ScrollView, View } from "react-native";
import CollectionCover from "../../components/collectionCover";

const ORDERS: { key: DiscoverOrdering; label: string }[] = [
  { key: "popular", label: "Phổ biến" },
  { key: "newest", label: "Mới nhất" },
  { key: "-downloaded_count", label: "Nhiều lượt tải" },
];

const Chip = ({ label, active, onPress }: { label: string; active: boolean; onPress: () => void }) => {
  const { theme } = useTheme();
  return (
    <Pressable
      onPress={onPress}
      className="px-4 h-9 rounded-full items-center justify-center"
      style={{ backgroundColor: active ? theme.primary : theme.primary + "14" }}
    >
      <AppText size="sm" weight="semibold" color={active ? "white" : "primary"}>
        {label}
      </AppText>
    </Pressable>
  );
};

/** Khám phá bộ từ công khai: tìm theo tên, lọc chủ đề, sắp xếp; chạm bộ để xem trước và tải về. */
const DiscoverList = () => {
  const { theme } = useTheme();
  const learningLang = useAppStore((s) => s.settings?.learning_language) ?? "en";
  const userLang = useAppStore((s) => s.settings?.translate_language) ?? "vi";
  const [search, setSearch] = useState("");
  const q = useDebounce(search, 300);
  const [tag, setTag] = useState<string | null>(null);
  const [ordering, setOrdering] = useState<DiscoverOrdering>("popular");

  const topics = useQuery({
    queryKey: ["collections", "topics", learningLang, userLang],
    queryFn: () => fetchTopics(learningLang, userLang),
    retry: false,
  });

  const list = useInfiniteQuery({
    queryKey: ["collections", "discover", learningLang, q, tag, ordering],
    queryFn: ({ pageParam }) => fetchDiscover({ lang: learningLang, q, tags: tag ? [tag] : [], ordering, page: pageParam }),
    initialPageParam: 1,
    getNextPageParam: (last, all) => (last.next ? all.length + 1 : undefined),
    retry: false,
  });
  const rows = list.data?.pages.flatMap((p) => p.results) ?? [];

  const header = (
    <View className="gap-3 pb-3">
      <SearchBar value={search} onChangeText={setSearch} placeholder="Tìm bộ từ công khai..." />
      {!!topics.data?.length && (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>
          <Chip label="Tất cả" active={!tag} onPress={() => setTag(null)} />
          {topics.data.map((t) => (
            <Chip key={t.id} label={t.name} active={tag === t.id} onPress={() => setTag(tag === t.id ? null : t.id)} />
          ))}
        </ScrollView>
      )}
      <View className="flex-row gap-2">
        {ORDERS.map((o) => (
          <Pressable
            key={o.key}
            onPress={() => setOrdering(o.key)}
            className="flex-row items-center gap-1 px-3 h-8 rounded-full"
            style={{ borderWidth: 1, borderColor: ordering === o.key ? theme.primary : theme.border }}
          >
            <AppText size="xs" weight="semibold" color={ordering === o.key ? "primary" : "subText1"}>
              {o.label}
            </AppText>
          </Pressable>
        ))}
      </View>
    </View>
  );

  return (
    <View style={{ flex: 1, backgroundColor: theme.background }}>
      <AppReturnHeader title="Khám phá" />
      <FlatList
        data={rows}
        keyExtractor={(c) => c.id}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 32, gap: 12 }}
        refreshControl={<RefreshControl refreshing={list.isRefetching && !list.isFetchingNextPage} onRefresh={() => list.refetch()} colors={[theme.primary]} />}
        ListHeaderComponent={header}
        onEndReachedThreshold={0.4}
        onEndReached={() => list.hasNextPage && !list.isFetchingNextPage && list.fetchNextPage()}
        ListFooterComponent={list.isFetchingNextPage ? <ActivityIndicator color={theme.primary} style={{ padding: 16 }} /> : null}
        renderItem={({ item }) => (
          <Pressable
            onPress={() => router.push({ pathname: "/screens/Collection/Discover/Detail/[id]", params: { id: item.id } })}
            className="flex-row items-center gap-3 p-3 rounded-2xl"
            style={{ backgroundColor: theme.card, borderWidth: 1, borderColor: theme.border }}
          >
            <CollectionCover
              collection={{ name: item.name, imageUrl: item.image_url, coverUri: null, coverWord: null, coverKeywords: [] }}
              style={{ height: 72, width: 96 }}
            />
            <View className="flex-1 gap-1">
              <View className="flex-row items-center gap-1.5">
                <AppText numberOfLines={1} size="lg" weight="bold" color="title" style={{ flexShrink: 1 }}>
                  {item.name}
                </AppText>
                {item.is_official && <AppIcon branch="feather" name="check-circle" size={14} color={theme.primary} />}
              </View>
              {!!item.description && (
                <AppText numberOfLines={1} size="sm" color="subText1">
                  {item.description}
                </AppText>
              )}
              <AppText size="xs" color="subText2">
                {item.senses_count} nghĩa · {item.downloaded_count} lượt tải · {item.like_count} thích
              </AppText>
            </View>
          </Pressable>
        )}
        ListEmptyComponent={
          list.isLoading ? (
            <View className="gap-3">
              {[0, 1, 2].map((i) => (
                <Skeleton key={i} width="100%" height={96} radius={16} />
              ))}
            </View>
          ) : list.isError ? (
            <AppText color="subText2" textAlign="center" style={{ paddingTop: 24 }}>
              Không tải được. Kiểm tra mạng rồi kéo xuống để thử lại.
            </AppText>
          ) : (
            <AppText color="subText2" textAlign="center" style={{ paddingTop: 24 }}>
              Không có bộ nào khớp.
            </AppText>
          )
        }
      />
    </View>
  );
};

export default DiscoverList;
