import AppButton from "@/components/AppButton";
import AppCard from "@/components/AppCard";
import AppIcon from "@/components/AppIcon";
import AppReturnHeader from "@/components/AppReturnHeader";
import AppText from "@/components/AppText";
import SearchBar from "@/components/SearchBar";
import { getMyCollection, listCollectionSenses, setLocalCover, setLocalOrder } from "@/database/queries/collections";
import { deleteCollectionItem, reorderCollectionItems } from "@/services/api/collections";
import { useTheme } from "@/providers/Theme";
import { useBottomSheet } from "@/providers/BottomSheet";
import { downloadBundle, refreshPending, unpublish } from "@/services/collections";
import { useAppStore } from "@/stores/appStore";
import { ProgressRing, Skeleton, useDebounce } from "@/ui";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useSQLiteContext } from "expo-sqlite";
import { useEffect, useState } from "react";
import { ActivityIndicator, Alert, FlatList, Pressable, ToastAndroid, View } from "react-native";
import CollectionCover from "../components/collectionCover";
import CoverSheet from "./components/coverSheet";
import AddWordsSheet from "./components/addWordsSheet";
import SenseRow from "./components/senseRow";

/** Chi tiết 1 bộ: ảnh bìa, tiến độ, tải về học offline, danh sách nghĩa trong bộ. */
const CollectionDetail = () => {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { theme } = useTheme();
  const router = useRouter();
  const db = useSQLiteContext();
  const { present } = useBottomSheet();
  const queryClient = useQueryClient();
  const userLang = useAppStore((s) => s.settings?.translate_language) ?? "vi";
  const [search, setSearch] = useState("");
  const q = useDebounce(search, 250);

  const info = useQuery({
    queryKey: ["collections", "detail", id],
    queryFn: () => getMyCollection(db, id),
  });
  const c = info.data;

  const [editing, setEditing] = useState(false);
  const [revoking, setRevoking] = useState(false);
  const confirmRevoke = () =>
    Alert.alert(
      "Thu hồi bộ này?",
      "Bộ không còn công khai: người chưa tải sẽ không thấy nữa. Người đã tải vẫn học tiếp. Bạn có thể bấm Tiếp tục phát hành bất cứ lúc nào.",
      [
        { text: "Huỷ", style: "cancel" },
        {
          text: "Thu hồi",
          style: "destructive",
          onPress: async () => {
            setRevoking(true);
            try {
              await unpublish(db, id, userLang);
              await queryClient.invalidateQueries({ queryKey: ["collections"] });
              ToastAndroid.show("Đã thu hồi bộ", ToastAndroid.SHORT);
            } catch {
              ToastAndroid.show("Chưa thu hồi được, thử lại sau", ToastAndroid.SHORT);
            } finally {
              setRevoking(false);
            }
          },
        },
      ],
    );

  const senses = useQuery({
    queryKey: ["collections", "senses", id, q, userLang],
    queryFn: () => listCollectionSenses(db, c!.collectionId, { q, userLang }),
    enabled: !!c?.downloaded,
  });

  const refreshAll = () => queryClient.invalidateQueries({ queryKey: ["collections"] });

  const move = async (index: number, delta: -1 | 1) => {
    const list = senses.data ?? [];
    const target = index + delta;
    if (target < 0 || target >= list.length) return;
    const ids = list.map((s) => s.itemId);
    [ids[index], ids[target]] = [ids[target], ids[index]];
    try {
      await reorderCollectionItems(id, ids.map((item_id, i) => ({ item_id, display_order: i })));
      await setLocalOrder(db, ids);
      await refreshAll();
    } catch {
      ToastAndroid.show("Chưa đổi được thứ tự, thử lại sau", ToastAndroid.SHORT);
    }
  };

  const confirmDelete = (itemId: string, value: string) =>
    Alert.alert(`Xoá "${value}" khỏi bộ?`, !c?.isAuthor ? "Nghĩa này bị bỏ khỏi bản remix của bạn, bộ gốc không đổi." : c?.publishState === "draft" ? "Nghĩa này bị bỏ khỏi bộ." : "Người đã tải bản đã phát hành vẫn giữ nghĩa này; thay đổi có hiệu lực khi bạn cập nhật bộ.", [
      { text: "Huỷ", style: "cancel" },
      {
        text: "Xoá",
        style: "destructive",
        onPress: async () => {
          try {
            await deleteCollectionItem(id, itemId);
            await downloadBundle(db, id, userLang, { force: true, retries: 0 });
            await refreshAll();
          } catch {
            ToastAndroid.show("Chưa xoá được, thử lại sau", ToastAndroid.SHORT);
          }
        },
      },
    ]);

  const openAddWords = () =>
    present({
      title: "Thêm từ vào bộ",
      render: () => (
        <AddWordsSheet
          userCollectionId={id}
          userLang={userLang}
          onDone={async () => {
            try {
              await downloadBundle(db, id, userLang, { force: true, retries: 0 });
            } catch {}
            refreshAll();
          }}
        />
      ),
    });

  const download = useMutation({
    mutationFn: (force: boolean) => downloadBundle(db, id, userLang, { force }),
    onSettled: () => queryClient.invalidateQueries({ queryKey: ["collections"] }),
  });

  // Bộ đã có trong máy: hỏi server có bản mới không ở nền (gửi etag nên rẻ). Bộ chưa tải: chờ user bấm.
  const [checked, setChecked] = useState(false);
  useEffect(() => {
    if (c?.downloaded && !checked) {
      setChecked(true);
      download.mutate(false);
    }
  }, [c?.downloaded]);

  // Còn từ đang chờ AI tạo: hỏi lại mỗi vài giây (tối đa ~2 phút) để từ xong tự vào bộ
  const waiting = c?.downloaded ? c.pendingWords.length : 0;
  useEffect(() => {
    if (!waiting || !c) return;
    let tries = 0;
    let busy = false;
    const timer = setInterval(async () => {
      if (busy || ++tries > 20) return clearInterval(timer);
      busy = true;
      try {
        await refreshPending(db, id, c.collectionId, userLang);
        await queryClient.invalidateQueries({ queryKey: ["collections"] });
      } catch {}
      busy = false;
    }, 6000);
    return () => clearInterval(timer);
  }, [waiting, id]);

  const pct = c?.total ? Math.min(100, (c.learned / c.total) * 100) : 0;

  const header = !c ? null : (
    <View className="gap-4 pb-2">
      <View>
        <CollectionCover collection={c} radius={20} style={{ height: 180, width: "100%" }} />
        {c.canEditCover && (
          <Pressable
            onPress={() =>
              present({
                title: "Ảnh bìa",
                render: () => (
                  <CoverSheet
                    userCollectionId={id}
                    hasOwnCover={!!c.imageUrl}
                    onApplied={async (image) => {
                      await setLocalCover(db, c.collectionId, image);
                      await queryClient.invalidateQueries({ queryKey: ["collections"] });
                    }}
                  />
                ),
              })
            }
            hitSlop={8}
            className="absolute flex-row items-center gap-1.5 px-3 h-9 rounded-full"
            style={{ right: 12, bottom: 12, backgroundColor: theme.card + "E6", borderWidth: 1, borderColor: theme.border }}
            accessibilityLabel="Đổi ảnh bìa"
          >
            <AppIcon branch="feather" name="camera" size={15} color={theme.text} />
            <AppText size="xs" weight="semibold" color="title">
              Đổi ảnh
            </AppText>
          </Pressable>
        )}
      </View>

      <View className="gap-1">
        <AppText size="2xl" weight="bold" color="title">
          {c.name}
        </AppText>
        {!!c.remixedFrom && (
          <View className="flex-row items-center gap-1.5 mt-0.5">
            <AppIcon branch="feather" name="git-branch" size={13} color={theme.subText2} />
            <AppText size="xs" color="subText2" numberOfLines={1} style={{ flexShrink: 1 }}>
              {`Remix từ "${c.remixedFrom}"`}
            </AppText>
          </View>
        )}
        {c.isAuthor && (
          <View className="flex-row items-center gap-1.5 mt-0.5">
            <AppIcon
              branch="feather"
              name={c.publishState === "live" ? (c.draftCount > 0 ? "edit-3" : "globe") : "lock"}
              size={13}
              color={c.publishState === "live" && c.draftCount === 0 ? theme.success : theme.subText2}
            />
            <AppText size="xs" color="subText2">
              {c.publishState === "draft"
                ? "Bản nháp, chỉ mình bạn thấy"
                : c.publishState === "revoked"
                  ? `Đã thu hồi (v${c.version}), chỉ người đã tải còn học được`
                  : c.draftCount > 0
                    ? `Đã phát hành v${c.version} · có ${c.draftCount} thay đổi chưa phát hành`
                    : `Đã phát hành công khai · v${c.version}`}
            </AppText>
          </View>
        )}
        {!!c.description && (
          <AppText color="subText1" numberOfLines={3}>
            {c.description}
          </AppText>
        )}
      </View>

      <AppCard>
        <View className="flex-row items-center gap-5">
          <ProgressRing value={pct} size={72} strokeWidth={8} color="primary">
            <AppText weight="bold">{Math.round(pct)}%</AppText>
          </ProgressRing>
          <View className="flex-row flex-1">
            {[
              { v: c.total, l: "Nghĩa" },
              { v: c.learned, l: "Đã học" },
              { v: Math.max(0, c.total - c.learned), l: "Chưa học" },
            ].map((s) => (
              <View key={s.l} className="flex-1">
                <AppText size="xl" weight="bold" color="title">
                  {s.v}
                </AppText>
                <AppText size="xs" color="subText2">
                  {s.l}
                </AppText>
              </View>
            ))}
          </View>
        </View>
      </AppCard>

      {(c.pendingWords.length > 0 || c.invalidWords.length > 0) && (
        <View className="gap-2">
          {c.pendingWords.length > 0 && (
            <View className="p-3 rounded-2xl gap-1" style={{ backgroundColor: theme.primary + "14" }}>
              <View className="flex-row items-center gap-2">
                <ActivityIndicator size="small" color={theme.primary} />
                <AppText weight="bold" color="primary" style={{ flexShrink: 1 }}>
                  {`Đang tạo ${c.pendingWords.length} từ`}
                </AppText>
              </View>
              <AppText size="sm" color="subText1">
                {c.pendingWords.slice(0, 12).join(", ")}
                {c.pendingWords.length > 12 ? "…" : ""}. Từ nào xong sẽ tự vào bộ, bạn có thể học các từ khác trước.
              </AppText>
            </View>
          )}
          {c.invalidWords.length > 0 && (
            <View className="p-3 rounded-2xl gap-1" style={{ backgroundColor: theme.warning + "1F" }}>
              <View className="flex-row items-center gap-2">
                <AppIcon branch="feather" name="alert-circle" size={16} color={theme.warning} />
                <AppText weight="bold" style={{ color: theme.warning, flexShrink: 1 }}>
                  {`${c.invalidWords.length} từ không dùng được`}
                </AppText>
              </View>
              <AppText size="sm" color="subText1">
                {c.invalidWords.slice(0, 12).join(", ")}
                {c.invalidWords.length > 12 ? "…" : ""}. Từ sai chính tả hoặc không phải mục từ nên không được thêm vào bộ.
              </AppText>
            </View>
          )}
        </View>
      )}

      {!c.downloaded ? (
        <View className="gap-2">
          <AppButton
            size="lg"
            onPress={() => download.mutate(true)}
            isLoading={download.isPending}
            disabled={download.isPending}
          >
            <AppIcon branch="feather" name="download" size={18} color="white" />
            <AppText color="white" weight="bold" size="lg">
              Tải về để học offline
            </AppText>
          </AppButton>
          {download.isError && (
            <AppText size="sm" style={{ color: theme.error }} textAlign="center">
              Không tải được. Kiểm tra mạng rồi thử lại.
            </AppText>
          )}
        </View>
      ) : (
        <View className="gap-2">
          {c.needsUpdate && (
            <Pressable
              onPress={() => download.mutate(true)}
              className="flex-row items-center gap-2 p-3 rounded-2xl"
              style={{ backgroundColor: theme.warning + "1F" }}
            >
              <AppIcon branch="feather" name="refresh-cw" size={16} color={theme.warning} />
              <AppText style={{ flex: 1, color: theme.warning }} weight="semibold">
                Có bản mới của bộ này. Chạm để cập nhật.
              </AppText>
            </Pressable>
          )}
          {c.translationMissing > 0 && (
            <View
              className="flex-row items-center gap-2 p-3 rounded-2xl"
              style={{ backgroundColor: theme.primary + "14" }}
            >
              <AppIcon branch="feather" name="globe" size={16} color={theme.primary} />
              <AppText style={{ flex: 1 }} color="primary" size="sm">
                {`Đã có bản dịch ${Math.max(0, c.total - c.translationMissing)}/${c.total} nghĩa. Phần còn lại sẽ được dịch khi bạn học tới.`}
              </AppText>
            </View>
          )}
          <AppButton type="success" size="lg" onPress={() => router.push({ pathname: "/screens/Learning/New/screen", params: { id } })}>
            <AppIcon branch="feather" name="feather" size={18} color="white" />
            <AppText color="white" weight="bold" size="lg">
              Học từ mới
            </AppText>
          </AppButton>
          {c.canRemix && (
            <View className="p-3 rounded-2xl gap-2" style={{ backgroundColor: theme.primary + "14" }}>
              <View className="flex-row items-center gap-2">
                <AppIcon branch="feather" name="git-branch" size={16} color={theme.primary} />
                <AppText weight="bold" color="primary" style={{ flexShrink: 1 }}>
                  {`Bạn đã sửa ${c.draftCount} nghĩa`}
                </AppText>
              </View>
              <AppText size="sm" color="subText1">
                Thay đổi chỉ có ở máy bạn, bộ gốc không đổi. Phát hành để tạo bản remix riêng của bạn.
              </AppText>
              <Pressable
                onPress={() => router.push({ pathname: "/screens/Collection/Publish/[id]", params: { id } })}
                className="h-12 rounded-2xl flex-row items-center justify-center gap-2"
                style={{ backgroundColor: theme.primary }}
              >
                <AppIcon branch="feather" name="git-branch" size={17} color="white" />
                <AppText color="white" weight="bold">
                  Tạo bản remix
                </AppText>
              </Pressable>
            </View>
          )}
          {c.isAuthor && (
            <View className="flex-row gap-3">
              <Pressable
                disabled={!c.canPublish}
                onPress={() => router.push({ pathname: "/screens/Collection/Publish/[id]", params: { id } })}
                className="flex-1 h-14 rounded-2xl flex-row items-center justify-center gap-2"
                style={{
                  backgroundColor: c.canPublish ? theme.primary : theme.card,
                  borderWidth: 1,
                  borderColor: c.canPublish ? theme.primary : theme.border,
                }}
              >
                <AppIcon branch="feather" name="upload-cloud" size={18} color={c.canPublish ? "white" : theme.subText3} />
                <AppText color={c.canPublish ? "white" : "subText3"} weight="bold" size="lg">
                  {c.publishState === "draft" ? "Phát hành bộ" : c.publishState === "revoked" ? "Tiếp tục phát hành" : "Cập nhật"}
                </AppText>
              </Pressable>
              {c.publishState === "live" && (
                <Pressable
                  disabled={revoking}
                  onPress={confirmRevoke}
                  className="h-14 px-5 rounded-2xl flex-row items-center justify-center gap-2"
                  style={{ borderWidth: 1.5, borderColor: theme.error, opacity: revoking ? 0.5 : 1 }}
                >
                  {revoking ? (
                    <ActivityIndicator size="small" color={theme.error} />
                  ) : (
                    <AppIcon branch="feather" name="eye-off" size={18} color={theme.error} />
                  )}
                  <AppText weight="bold" size="lg" style={{ color: theme.error }}>
                    Thu hồi
                  </AppText>
                </Pressable>
              )}
            </View>
          )}
        </View>
      )}

      {c.downloaded && (
        <>
          <View className="flex-row items-center justify-between" style={{ marginTop: 8 }}>
            <AppText size="lg" weight="bold" color="title">
              Danh sách nghĩa
            </AppText>
            {(
              <View className="flex-row items-center gap-2">
                {editing && (
                  <Pressable
                    onPress={openAddWords}
                    className="flex-row items-center gap-1.5 px-3 h-9 rounded-full"
                    style={{ backgroundColor: theme.primary }}
                  >
                    <AppIcon branch="feather" name="plus" size={15} color="white" />
                    <AppText size="sm" weight="semibold" color="white">
                      Thêm từ
                    </AppText>
                  </Pressable>
                )}
                <Pressable
                  onPress={() => setEditing((v) => !v)}
                  className="flex-row items-center gap-1.5 px-3 h-9 rounded-full"
                  style={{ backgroundColor: editing ? theme.primary + "14" : theme.card, borderWidth: 1, borderColor: editing ? theme.primary : theme.border }}
                >
                  <AppIcon branch="feather" name={editing ? "check" : "edit-2"} size={14} color={editing ? theme.primary : theme.text} />
                  <AppText size="sm" weight="semibold" color={editing ? "primary" : "title"}>
                    {editing ? "Xong" : "Sửa"}
                  </AppText>
                </Pressable>
              </View>
            )}
          </View>
          <SearchBar value={search} onChangeText={setSearch} placeholder="Tìm trong bộ này..." />
        </>
      )}
    </View>
  );

  return (
    <View style={{ flex: 1, backgroundColor: theme.background }}>
      <AppReturnHeader
        title="Bộ từ"
        rightElement={
          c?.downloaded ? (
            <Pressable
              hitSlop={8}
              onPress={() => download.mutate(true)}
              disabled={download.isPending}
              className="h-10 w-10 rounded-full items-center justify-center"
              style={{ backgroundColor: theme.card, borderWidth: 1, borderColor: theme.border }}
            >
              <AppIcon
                branch="feather"
                name="refresh-cw"
                size={18}
                color={download.isPending ? theme.subText3 : theme.text}
              />
            </Pressable>
          ) : undefined
        }
      />

      {info.isLoading ? (
        <View className="px-4 gap-4 pt-2">
          <Skeleton width="100%" height={180} radius={20} />
          <Skeleton width="60%" height={24} />
          <Skeleton width="100%" height={100} radius={20} />
        </View>
      ) : !c ? (
        <View className="flex-1 items-center justify-center px-8 gap-2">
          <AppText size="lg" weight="bold" color="title">
            Không tìm thấy bộ từ
          </AppText>
          <AppText color="subText2" textAlign="center">
            Bộ này không còn trong thư viện của bạn.
          </AppText>
        </View>
      ) : (
        <FlatList
          data={c.downloaded ? (senses.data ?? []) : []}
          keyExtractor={(s) => s.itemId}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 32, gap: 10 }}
          ListHeaderComponent={header}
          renderItem={({ item, index }) => (
            <SenseRow
              item={item}
              edit={
                editing
                  ? {
                      // Người khác chỉ đổi được thứ tự dòng nháp của mình, nên không có mũi tên
                      onUp: c.isAuthor && !q && index > 0 ? () => move(index, -1) : undefined,
                      onDown: c.isAuthor && !q && index < (senses.data?.length ?? 0) - 1 ? () => move(index, 1) : undefined,
                      onDelete: () => confirmDelete(item.itemId, item.value),
                    }
                  : undefined
              }
            />
          )}
          ListEmptyComponent={
            c.downloaded && !senses.isLoading ? (
              <AppText color="subText2" textAlign="center" style={{ paddingTop: 24 }}>
                {search ? "Không có từ nào khớp." : "Bộ này chưa có nghĩa nào."}
              </AppText>
            ) : null
          }
        />
      )}
    </View>
  );
};

export default CollectionDetail;
