import AppIcon from "@/components/AppIcon";
import AppText from "@/components/AppText";
import { MyCollection } from "@/database/queries/collections";
import { useTheme } from "@/providers/Theme";
import { useRouter } from "expo-router";
import { Pressable, View } from "react-native";
import CollectionCover from "../../components/collectionCover";
import CollectionCardWide from "./collectionCardWide";

/** TẠM: dưới thẻ hiện tại hiện thêm thẻ bố cục 16:9 mới để so sánh; xoá khi chọn xong. */
const SHOW_COVER_COMPARE = true;

/** Thẻ 1 bộ trong "Bộ của tôi": ảnh bìa, tên, tiến độ, trạng thái đã tải / cần cập nhật. */
const CollectionCard = ({ item }: { item: MyCollection }) => {
  const router = useRouter();
  const { theme } = useTheme();
  const pct = item.total ? Math.min(100, (item.learned / item.total) * 100) : 0;

  return (
    <View>
    <Pressable
      android_ripple={{ color: theme.primary + "14" }}
      onPress={() =>
        router.push({ pathname: "/screens/Collection/Detail/[id]", params: { id: item.id } })
      }
      className="flex-row items-center gap-3 p-3 rounded-2xl"
      style={{ backgroundColor: theme.card, borderWidth: 1, borderColor: theme.border }}
    >
      <CollectionCover collection={item} style={{ height: 76, width: 96 }} radius={12} />

      <View className="flex-1">
        <AppText numberOfLines={1} size="lg" weight="bold" color="title">
          {item.name}
        </AppText>

        <View className="flex-row items-center gap-1.5 mt-1">
          {item.downloaded ? (
            item.needsUpdate ? (
              <>
                <AppIcon branch="feather" name="refresh-cw" size={12} color={theme.warning} />
                <AppText size="xs" style={{ color: theme.warning }}>
                  Có bản mới
                </AppText>
              </>
            ) : (
              <>
                <AppIcon branch="feather" name="check-circle" size={12} color={theme.success} />
                <AppText size="xs" color="subText2">
                  Học được khi không có mạng
                </AppText>
              </>
            )
          ) : (
            <>
              <AppIcon branch="feather" name="download-cloud" size={12} color={theme.subText2} />
              <AppText size="xs" color="subText2">
                Chưa tải về máy
              </AppText>
            </>
          )}
        </View>

        <View className="flex-row items-center gap-3 mt-2.5">
          <View
            className="flex-1 h-2 rounded-full overflow-hidden"
            style={{ backgroundColor: theme.background2 }}
          >
            <View
              style={{ width: `${pct}%`, height: "100%", backgroundColor: theme.primary }}
              className="rounded-full"
            />
          </View>
          <AppText size="xs" color="subText1" weight="semibold">
            {item.learned}/{item.total}
          </AppText>
        </View>
      </View>
    </Pressable>
    {SHOW_COVER_COMPARE && (
      <View className="pt-2 gap-1">
        <AppText size="xs" color="subText2" style={{ paddingLeft: 4 }}>Bố cục 16:9 (thử)</AppText>
        <CollectionCardWide item={item} />
      </View>
    )}
    </View>
  );
};

export default CollectionCard;
