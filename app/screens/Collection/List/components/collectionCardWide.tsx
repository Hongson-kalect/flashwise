import AppIcon from "@/components/AppIcon";
import AppText from "@/components/AppText";
import { MyCollection } from "@/database/queries/collections";
import { useTheme } from "@/providers/Theme";
import { useRouter } from "expo-router";
import { Pressable, View } from "react-native";
import { CollectionCoverWide } from "../../components/collectionCover";

/**
 * Thẻ 1 bộ theo bố cục 16:9 (thử): ảnh bìa 16:9 ngang cả thẻ ở trên, tên + trạng thái + tiến độ ở dưới.
 * Trạng thái tải về nằm thành nhãn nhỏ đè lên góc ảnh để phần chữ chỉ còn tên và tiến độ.
 */
const CollectionCardWide = ({ item }: { item: MyCollection }) => {
  const router = useRouter();
  const { theme } = useTheme();
  const pct = item.total ? Math.min(100, (item.learned / item.total) * 100) : 0;
  const status = !item.downloaded
    ? { icon: "download-cloud", text: "Chưa tải về", color: theme.subText2 }
    : item.needsUpdate
      ? { icon: "refresh-cw", text: "Có bản mới", color: theme.warning }
      : { icon: "check-circle", text: "Học offline", color: theme.success };

  return (
    <Pressable
      android_ripple={{ color: theme.primary + "14" }}
      onPress={() => router.push({ pathname: "/screens/Collection/Detail/[id]", params: { id: item.id } })}
      className="rounded-2xl overflow-hidden"
      style={{ backgroundColor: theme.card, borderWidth: 1, borderColor: theme.border }}
    >
      <View>
        <CollectionCoverWide collection={item} radius={0} />
        <View
          className="absolute flex-row items-center gap-1 px-2.5 h-7 rounded-full"
          style={{ left: 10, bottom: 10, backgroundColor: theme.card + "E6" }}
        >
          <AppIcon branch="feather" name={status.icon as any} size={12} color={status.color} />
          <AppText size="xs" weight="semibold" style={{ color: status.color }}>
            {status.text}
          </AppText>
        </View>
      </View>
      <View style={{ padding: 12, gap: 8 }}>
        <AppText numberOfLines={1} size="lg" weight="bold" color="title">
          {item.name}
        </AppText>
        <View className="flex-row items-center gap-3">
          <View className="flex-1 h-2 rounded-full overflow-hidden" style={{ backgroundColor: theme.background2 }}>
            <View style={{ width: `${pct}%`, height: "100%", backgroundColor: theme.primary }} className="rounded-full" />
          </View>
          <AppText size="xs" color="subText1" weight="semibold">
            {item.learned}/{item.total}
          </AppText>
        </View>
      </View>
    </Pressable>
  );
};

export default CollectionCardWide;
