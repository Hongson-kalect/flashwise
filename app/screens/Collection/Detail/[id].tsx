import AppButton from "@/components/AppButton";
import AppCard from "@/components/AppCard";
import AppIcon from "@/components/AppIcon";
import AppReturnHeader from "@/components/AppReturnHeader";
import AppText from "@/components/AppText";
import SearchBar from "@/components/SearchBar";
import { getMyCollection, listCollectionSenses, setLocalCover } from "@/database/queries/collections";
import { useTheme } from "@/providers/Theme";
import { useBottomSheet } from "@/providers/BottomSheet";
import { downloadBundle, refreshPending } from "@/services/collections";
import { useAppStore } from "@/stores/appStore";
import { ProgressRing, Skeleton, useDebounce } from "@/ui";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useSQLiteContext } from "expo-sqlite";
import { useEffect, useState } from "react";
import { ActivityIndicator, FlatList, Pressable, View } from "react-native";
import CollectionCover from "../components/collectionCover";
import CoverSheet from "./components/coverSheet";
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

  const senses = useQuery({
    queryKey: ["collections", "senses", id, q, userLang],
    queryFn: () => listCollectionSenses(db, c!.collectionId, { q, userLang }),
    enabled: !!c?.downloaded,
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

  const pending = download.data?.pending ?? 0;
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
          {pending > 0 && (
            <View
              className="flex-row items-center gap-2 p-3 rounded-2xl"
              style={{ backgroundColor: theme.primary + "14" }}
            >
              <AppIcon branch="feather" name="loader" size={16} color={theme.primary} />
              <AppText style={{ flex: 1 }} color="primary">
                {pending} nghĩa đang được dịch sang ngôn ngữ của bạn. Kéo xuống danh sách sau ít phút để làm mới.
              </AppText>
            </View>
          )}
          <AppButton type="success" size="lg" onPress={() => router.push("/screens/Practice/screen")}>
            <AppIcon branch="feather" name="feather" size={18} color="white" />
            <AppText color="white" weight="bold" size="lg">
              Học từ mới
            </AppText>
          </AppButton>
        </View>
      )}

      {c.downloaded && (
        <>
          <AppText size="lg" weight="bold" color="title" style={{ marginTop: 8 }}>
            Danh sách nghĩa
          </AppText>
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
          renderItem={({ item }) => <SenseRow item={item} />}
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
