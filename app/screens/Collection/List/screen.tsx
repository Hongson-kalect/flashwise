import AppChip from "@/components/AppChip";
import AppIcon from "@/components/AppIcon";
import AppText from "@/components/AppText";
import SearchBar from "@/components/SearchBar";
import { CollectionSort, listMyCollections } from "@/database/queries/collections";
import { useAppNavigation } from "@/hooks/useNavigation";
import { useTheme } from "@/providers/Theme";
import { syncMyCollections } from "@/services/collections";
import { ProgressRing, Skeleton, useDebounce } from "@/ui";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useSQLiteContext } from "expo-sqlite";
import { useEffect, useMemo, useState } from "react";
import { FlatList, Pressable, RefreshControl, View } from "react-native";
import CollectionCard from "./components/collectionCard";
import Suggestions from "./components/suggestions";

const SORTS: { key: CollectionSort; label: string }[] = [
  { key: "recent", label: "Mới nhất" },
  { key: "alpha", label: "A–Z" },
  { key: "progress", label: "Tiến độ" },
];

/** Tab Bộ từ: các bộ của mình (kéo từ server, nội dung tải về SQLite để học offline). */
const CollectionListScreen = () => {
  const { theme } = useTheme();
  const db = useSQLiteContext();
  const { routerPush } = useAppNavigation();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState<CollectionSort>("recent");
  const [refreshing, setRefreshing] = useState(false);
  const q = useDebounce(search, 250);

  const list = useQuery({
    queryKey: ["collections", "mine", q, sort],
    queryFn: () => listMyCollections(db, { q, sort }),
  });

  const refresh = async () => {
    await syncMyCollections(db).catch(() => {}); // offline: giữ bản trong máy
    await queryClient.invalidateQueries({ queryKey: ["collections"] });
  };

  // Mở tab thì kéo danh sách mới nhất ở nền
  useEffect(() => {
    refresh();
  // eslint-disable-next-line react-hooks/exhaustive-deps -- cố ý: chỉ chạy lại khi phụ thuộc liệt kê đổi (hàm / đối tượng còn lại đổi mỗi lần render hoặc đã ổn định)
  }, []);

  const totals = useMemo(() => {
    const all = list.data ?? [];
    return {
      learned: all.reduce((n, c) => n + c.learned, 0),
      total: all.reduce((n, c) => n + c.total, 0),
    };
  }, [list.data]);
  const publishedCount = useMemo(() => (list.data ?? []).filter((c) => c.isAuthor && c.released).length, [list.data]);
  const pct = totals.total ? Math.min(100, (totals.learned / totals.total) * 100) : 0;
  const empty = !list.isLoading && !list.data?.length;

  return (
    <View style={{ backgroundColor: theme.background }} className="flex-1">
      <View className="px-4 flex-row justify-between items-center h-14">
        <AppText size="2xl" weight="bold" color="title">
          Bộ từ
        </AppText>
        <View className="flex-row items-center gap-2">
          <Pressable
            onPress={() => routerPush("/screens/Collection/Create/screen")}
            className="flex-row items-center gap-1.5 h-9 px-3.5 rounded-full"
            style={{ backgroundColor: theme.primary + "14" }}
          >
            <AppIcon name="plus" branch="feather" color={theme.primary} size={16} />
            <AppText weight="bold" color="primary" size="sm">
              Tạo
            </AppText>
          </Pressable>
          <Pressable
            onPress={() => routerPush("/screens/Collection/Discover/List/screen")}
            className="flex-row items-center gap-1.5 h-9 px-3.5 rounded-full"
            style={{ backgroundColor: theme.primary }}
          >
            <AppIcon name="compass" branch="feather" color="white" size={16} />
            <AppText weight="bold" color="white" size="sm">
              Khám phá
            </AppText>
          </Pressable>
        </View>
      </View>

      <FlatList
        data={list.data ?? []}
        keyExtractor={(c) => c.id}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={async () => {
              setRefreshing(true);
              await refresh();
              setRefreshing(false);
            }}
            colors={[theme.primary]}
          />
        }
        contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 32, gap: 8 }}
        ListHeaderComponent={
          <View className="gap-3 pb-1">
            {!empty && (
              <View className="flex-row items-center gap-3 px-1">
                <ProgressRing value={pct} size={44} strokeWidth={5} color="primary">
                  <AppText size="xs" weight="bold">{Math.round(pct)}%</AppText>
                </ProgressRing>
                <View className="flex-1">
                  <AppText weight="bold" color="title">
                    {`${totals.learned} / ${totals.total} nghĩa đã học`}
                  </AppText>
                  <AppText size="xs" color="subText2">
                    {`${list.data?.length ?? 0} bộ từ`}
                  </AppText>
                </View>
              </View>
            )}
            {(!empty || !!search) && (
              <>
                <SearchBar
                  value={search}
                  onChangeText={setSearch}
                  placeholder="Tìm trong bộ của bạn..."
                />
                {publishedCount > 0 && (
                  <Pressable
                    onPress={() => routerPush("/screens/Collection/Upload/List/screen")}
                    className="flex-row items-center gap-2 px-4 h-12 rounded-2xl"
                    style={{ backgroundColor: theme.card, borderWidth: 1, borderColor: theme.border }}
                  >
                    <AppIcon branch="feather" name="upload-cloud" size={16} color={theme.primary} />
                    <AppText weight="semibold" color="title" style={{ flex: 1 }}>
                      {`Bộ đã phát hành của tôi (${publishedCount})`}
                    </AppText>
                    <AppIcon branch="feather" name="chevron-right" size={18} color={theme.subText3} />
                  </Pressable>
                )}
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
              </>
            )}
          </View>
        }
        renderItem={({ item }) => <CollectionCard item={item} />}
        ListEmptyComponent={
          list.isLoading ? (
            <View className="gap-3">
              {[0, 1, 2].map((i) => (
                <View
                  key={i}
                  className="flex-row items-center gap-3 p-3 rounded-2xl"
                  style={{
                    backgroundColor: theme.card,
                    borderWidth: 1,
                    borderColor: theme.border,
                  }}
                >
                  <Skeleton width={96} height={76} radius={12} />
                  <View className="flex-1 gap-2">
                    <Skeleton width="60%" height={16} />
                    <Skeleton width="45%" height={12} />
                    <Skeleton width="100%" height={8} />
                  </View>
                </View>
              ))}
            </View>
          ) : (
            <View className="items-center pt-6 px-6 gap-3">
              <View
                className="h-16 w-16 rounded-full items-center justify-center"
                style={{ backgroundColor: theme.primary + "14" }}
              >
                <AppIcon branch="feather" name="layers" size={28} color={theme.primary} />
              </View>
              <AppText size="lg" weight="bold" color="title">
                {search ? "Không tìm thấy bộ nào" : "Chưa có bộ từ nào"}
              </AppText>
              <AppText color="subText2" textAlign="center">
                {search
                  ? "Thử tên khác."
                  : "Thêm một bộ từ để học theo từng chủ đề. Bộ đã tải học được cả khi không có mạng."}
              </AppText>
              {!search && (
                <Pressable
                  onPress={() => routerPush("/screens/Collection/Create/screen")}
                  className="mt-2 h-11 px-5 rounded-2xl flex-row items-center justify-center gap-2"
                  style={{ backgroundColor: theme.primary + "14" }}
                >
                  <AppIcon branch="feather" name="plus" size={16} color={theme.primary} />
                  <AppText color="primary" weight="bold">
                    Tạo bộ đầu tiên của bạn
                  </AppText>
                </Pressable>
              )}
            </View>
          )
        }
        ListFooterComponent={
          <View className="pt-4">
            <Suggestions />
          </View>
        }
      />
    </View>
  );
};

export default CollectionListScreen;
