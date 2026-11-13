import AppCard from "@/components/AppCard";
import AppIcon from "@/components/AppIcon";
import AppReturnHeader from "@/components/AppReturnHeader";
import AppText from "@/components/AppText";
import { useTheme } from "@/providers/Theme";
import { fetchMyUploads, MyUploads } from "@/services/api/collections";
import { mediaUrl } from "@/stores/appStore";
import { Skeleton } from "@/ui";
import AppImage from "@/components/AppImage";
import { useQuery } from "@tanstack/react-query";
import { router } from "expo-router";
import { useSQLiteContext } from "expo-sqlite";
import { FlatList, Pressable, RefreshControl, View } from "react-native";

const Stat = ({ icon, value, label }: { icon: any; value: number; label: string }) => {
  const { theme } = useTheme();
  return (
    <View className="flex-1 items-center gap-1">
      <AppIcon branch="feather" name={icon} size={16} color={theme.primary} />
      <AppText size="xl" weight="bold" color="title">
        {value}
      </AppText>
      <AppText size="xs" color="subText2">
        {label}
      </AppText>
    </View>
  );
};

const UploadedRow = ({ item }: { item: MyUploads["collections"][number] }) => {
  const { theme } = useTheme();
  const db = useSQLiteContext();
  const image = mediaUrl(item.image_url);

  // Mở bộ trong máy (nếu bộ này đã có trong thư viện của máy này)
  const open = async () => {
    const row = await db.getFirstAsync<{ id: string }>(
      `SELECT id FROM user_collection WHERE collection_id = ? AND is_deleted = 0`,
      [item.id],
    );
    if (row) router.push({ pathname: "/screens/Collection/Detail/[id]", params: { id: row.id } });
  };

  return (
    <Pressable
      onPress={open}
      className="flex-row items-center gap-3 p-3 rounded-2xl"
      style={{ backgroundColor: theme.card, borderWidth: 1, borderColor: theme.border, opacity: item.is_active ? 1 : 0.6 }}
    >
      <View
        className="rounded-xl overflow-hidden items-center justify-center"
        style={{ height: 64, width: 84, backgroundColor: theme.primary + "14" }}
      >
        {image ? (
          <AppImage source={{ uri: image }} style={{ width: "100%", height: "100%" }} />
        ) : (
          <AppText size="2xl" weight="bold" style={{ color: theme.primary + "99" }}>
            {item.name[0]?.toUpperCase()}
          </AppText>
        )}
      </View>
      <View className="flex-1 gap-1">
        <AppText numberOfLines={1} size="lg" weight="bold" color="title">
          {item.name}
        </AppText>
        <AppText size="xs" color="subText2">
          Phiên bản {item.version} · {item.item_count} nghĩa{item.is_active ? "" : " · đã ẩn"}
        </AppText>
        <View className="flex-row items-center gap-3">
          {[
            ["eye", item.view_count],
            ["heart", item.like_count],
            ["download", item.downloaded_count],
          ].map(([icon, n]) => (
            <View key={icon as string} className="flex-row items-center gap-1">
              <AppIcon branch="feather" name={icon as any} size={12} color={theme.subText2} />
              <AppText size="xs" color="subText1">
                {n as number}
              </AppText>
            </View>
          ))}
        </View>
      </View>
    </Pressable>
  );
};

/** Các bộ mình đã phát hành: tổng lượt xem / thích / tải và từng bộ. */
const CollectionUploadList = () => {
  const { theme } = useTheme();
  const q = useQuery({ queryKey: ["collections", "uploads"], queryFn: fetchMyUploads, retry: false });
  const data = q.data;

  return (
    <View style={{ flex: 1, backgroundColor: theme.background }}>
      <AppReturnHeader title="Bộ đã phát hành" />
      <FlatList
        data={data?.collections ?? []}
        keyExtractor={(c) => c.id}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={q.isRefetching} onRefresh={() => q.refetch()} colors={[theme.primary]} />}
        contentContainerStyle={{ padding: 16, paddingBottom: 32, gap: 12 }}
        ListHeaderComponent={
          <View className="pb-2">
            <AppCard>
              {q.isLoading ? (
                <Skeleton width="100%" height={64} radius={12} />
              ) : (
                <View className="flex-row">
                  <Stat icon="layers" value={data?.collection_count ?? 0} label="Bộ" />
                  <Stat icon="eye" value={data?.view_count ?? 0} label="Lượt xem" />
                  <Stat icon="heart" value={data?.like_count ?? 0} label="Lượt thích" />
                  <Stat icon="download" value={data?.downloaded_count ?? 0} label="Lượt tải" />
                </View>
              )}
            </AppCard>
          </View>
        }
        renderItem={({ item }) => <UploadedRow item={item} />}
        ListEmptyComponent={
          q.isLoading ? null : q.isError ? (
            <AppText color="subText2" textAlign="center" style={{ paddingTop: 24 }}>
              Không tải được danh sách. Kiểm tra mạng rồi kéo xuống để thử lại.
            </AppText>
          ) : (
            <View className="items-center pt-8 px-6 gap-3">
              <View className="h-16 w-16 rounded-full items-center justify-center" style={{ backgroundColor: theme.primary + "14" }}>
                <AppIcon branch="feather" name="upload-cloud" size={28} color={theme.primary} />
              </View>
              <AppText size="lg" weight="bold" color="title">
                Chưa phát hành bộ nào
              </AppText>
              <AppText color="subText2" textAlign="center">
                Mở một bộ do bạn tạo và bấm &ldquo;Phát hành&rdquo; để chia sẻ với mọi người.
              </AppText>
            </View>
          )
        }
      />
    </View>
  );
};

export default CollectionUploadList;
