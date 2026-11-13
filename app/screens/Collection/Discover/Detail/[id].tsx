import AppIcon from "@/components/AppIcon";
import AppReturnHeader from "@/components/AppReturnHeader";
import AppText from "@/components/AppText";
import { useTheme } from "@/providers/Theme";
import { fetchCollectionDetail, fetchCollectionLikes, setCollectionLike } from "@/services/api/collections";
import { addAndDownload } from "@/services/collections";
import { useAppStore } from "@/stores/appStore";
import { Skeleton } from "@/ui";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { router, useLocalSearchParams } from "expo-router";
import { useSQLiteContext } from "expo-sqlite";
import { ActivityIndicator, FlatList, Pressable, View } from "react-native";
import CollectionCover from "../../components/collectionCover";
import OwnershipBadge from "../../components/ownershipBadge";
import type { OwnedCollection } from "@/database/queries/collections";
import { toast } from "@/utils/toast";

const Stat = ({ icon, value, label }: { icon: any; value: number; label: string }) => {
  const { theme } = useTheme();
  return (
    <View className="flex-1 items-center gap-1">
      <AppIcon branch="feather" name={icon} size={16} color={theme.primary} />
      <AppText size="lg" weight="bold" color="title">
        {value}
      </AppText>
      <AppText size="xs" color="subText2">
        {label}
      </AppText>
    </View>
  );
};

/** Xem trước 1 bộ công khai: thông tin, thống kê, danh sách từ; thích; thêm vào thư viện và tải về học offline. */
const DiscoverDetail = () => {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { theme } = useTheme();
  const db = useSQLiteContext();
  const queryClient = useQueryClient();
  const userLang = useAppStore((s) => s.settings?.translate_language) ?? "vi";

  const detail = useQuery({ queryKey: ["collections", "discover", "detail", id, userLang], queryFn: () => fetchCollectionDetail(id, userLang), retry: false });
  const likes = useQuery({ queryKey: ["collections", "discover", "likes", id], queryFn: () => fetchCollectionLikes(id), retry: false });
  const owned = useQuery({
    queryKey: ["collections", "owned", id],
    queryFn: () => db.getFirstAsync<{ id: string; is_author: number | null }>(`SELECT id, is_author FROM user_collection WHERE collection_id = ? AND is_deleted = 0 AND downloaded_at IS NOT NULL`, [id]),
  });
  const c = detail.data;

  const add = useMutation({
    mutationFn: () => addAndDownload(db, id, userLang),
    onSuccess: (ucId) => {
      queryClient.invalidateQueries({ queryKey: ["collections"] });
      router.replace({ pathname: "/screens/Collection/Detail/[id]", params: { id: ucId } });
    },
  });

  const liked = !!likes.data && likes.data.likedVersions.includes(likes.data.version);
  const like = useMutation({
    mutationFn: () => setCollectionLike(id, !liked),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["collections", "discover"] });
    },
    onError: (e: any) => {
      const code = e?.response?.data?.errorCode;
      if (code === "account_required") toast.info("Đăng nhập để thích bộ từ");
      else toast.error("Chưa thích được, thử lại sau");
    },
  });

  const header = !c ? null : (
    <View className="gap-4 pb-3">
      <CollectionCover
        collection={{
          name: c.name,
          imageUrl: c.image_url,
          // Ảnh đầu tiên khả dụng trong các nghĩa của bộ; không nghĩa nào có ảnh thì tìm ảnh mở theo từ của nghĩa đầu
          coverUri: c.senses.find((s) => s.image_preview)?.image_preview ?? null,
          coverWord: c.senses[0]?.word_value ?? null,
          coverKeywords: [],
        }}
        radius={20}
        watermark
        style={{ height: 180, width: "100%" }}
      />
      <View className="gap-1">
        <View className="flex-row items-center justify-between gap-3">
          <AppText size="2xl" weight="bold" color="title" style={{ flex: 1 }}>
            {c.name}
          </AppText>
          <Pressable
            onPress={() => like.mutate()}
            disabled={like.isPending}
            hitSlop={8}
            className="h-11 w-11 rounded-full items-center justify-center"
            style={{ backgroundColor: liked ? theme.error + "1F" : theme.card, borderWidth: 1, borderColor: liked ? theme.error : theme.border }}
          >
            <AppIcon branch="antd" name={liked ? "heart" : "hearto"} size={18} color={liked ? theme.error : theme.text} />
          </Pressable>
        </View>
        <View className="flex-row items-center gap-2">
          {!!owned.data && <OwnershipBadge owned={{ id: owned.data.id, isAuthor: !!owned.data.is_author } as OwnedCollection} />}
          <AppText size="xs" color="subText2">
            {c.is_official ? "Bộ chính thức" : "Do cộng đồng chia sẻ"} · phiên bản {c.version}
          </AppText>
        </View>
        {!!c.description && <AppText color="subText1">{c.description}</AppText>}
      </View>

      <View className="flex-row p-4 rounded-2xl" style={{ backgroundColor: theme.card, borderWidth: 1, borderColor: theme.border }}>
        <Stat icon="book-open" value={c.item_count} label="Nghĩa" />
        <Stat icon="download" value={c.downloaded_count} label="Lượt tải" />
        <Stat icon="heart" value={likes.data?.likeCount ?? c.like_count} label="Thích" />
        <Stat icon="eye" value={c.view_count} label="Lượt xem" />
      </View>

      {owned.data ? (
        <Pressable
          onPress={() => router.replace({ pathname: "/screens/Collection/Detail/[id]", params: { id: owned.data!.id } })}
          className="h-14 rounded-2xl flex-row items-center justify-center gap-2"
          style={{ backgroundColor: theme.success }}
        >
          <AppIcon branch="feather" name="check-circle" size={18} color="white" />
          <AppText color="white" weight="bold" size="lg">
            Đã có trong thư viện, mở bộ
          </AppText>
        </Pressable>
      ) : (
        <View className="gap-2">
          <Pressable
            onPress={() => add.mutate()}
            disabled={add.isPending}
            className="h-14 rounded-2xl flex-row items-center justify-center gap-2"
            style={{ backgroundColor: theme.primary, opacity: add.isPending ? 0.7 : 1 }}
          >
            {add.isPending ? <ActivityIndicator color="white" /> : <AppIcon branch="feather" name="download" size={18} color="white" />}
            <AppText color="white" weight="bold" size="lg">
              {add.isPending ? "Đang tải..." : "Thêm & tải về để học offline"}
            </AppText>
          </Pressable>
          {add.isError && (
            <AppText size="sm" style={{ color: theme.error }} textAlign="center">
              Không tải được. Kiểm tra mạng rồi thử lại.
            </AppText>
          )}
        </View>
      )}

      {!!c.translation && (
        <View className="flex-row items-center gap-2 px-3 py-2 rounded-xl" style={{ backgroundColor: theme.primary + "14" }}>
          <AppIcon branch="feather" name="globe" size={15} color={theme.primary} />
          <AppText size="sm" color="primary" style={{ flex: 1 }}>
            {c.translation.missing === 0
              ? `Đã có bản dịch cho cả ${c.translation.total} nghĩa`
              : `Đã có bản dịch ${c.translation.total - c.translation.missing}/${c.translation.total} nghĩa, phần còn lại dịch khi bạn học tới`}
          </AppText>
        </View>
      )}

      <AppText size="lg" weight="bold" color="title" style={{ marginTop: 4 }}>
        Xem trước {c.senses.length} nghĩa
      </AppText>
    </View>
  );

  return (
    <View style={{ flex: 1, backgroundColor: theme.background }}>
      <AppReturnHeader title="Bộ từ" />
      {detail.isLoading ? (
        <View className="px-4 gap-4 pt-2">
          <Skeleton width="100%" height={180} radius={20} />
          <Skeleton width="60%" height={24} />
          <Skeleton width="100%" height={80} radius={20} />
        </View>
      ) : !c ? (
        <View className="flex-1 items-center justify-center px-8 gap-2">
          <AppText size="lg" weight="bold" color="title">
            Không mở được bộ này
          </AppText>
          <AppText color="subText2" textAlign="center">
            Bộ đã bị thu hồi hoặc bạn không có mạng.
          </AppText>
        </View>
      ) : (
        <FlatList
          data={c.senses}
          keyExtractor={(s) => s.id}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 32, gap: 8 }}
          ListHeaderComponent={header}
          renderItem={({ item }) => (
            <View
              className="flex-row items-center gap-2 p-3 rounded-2xl"
              style={{ backgroundColor: theme.card, borderWidth: 1, borderColor: theme.border }}
            >
              <View className="flex-1">
                <View className="flex-row items-center gap-2">
                  <AppText weight="bold" size="lg" color="title" style={{ flexShrink: 1 }}>
                    {item.word_value}
                  </AppText>
                  {!!item.pos && (
                    <View className="px-2 h-5 rounded-md items-center justify-center" style={{ backgroundColor: theme.primary + "14" }}>
                      <AppText size="xs" weight="semibold" color="primary">
                        {String(item.pos).toLowerCase()}
                      </AppText>
                    </View>
                  )}
                </View>
                {!!item.gloss && (
                  <AppText numberOfLines={2} size="sm" color="subText1">
                    {item.gloss}
                  </AppText>
                )}
              </View>
            </View>
          )}
        />
      )}
    </View>
  );
};

export default DiscoverDetail;
