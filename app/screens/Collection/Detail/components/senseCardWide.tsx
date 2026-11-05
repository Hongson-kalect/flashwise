import AppIcon from "@/components/AppIcon";
import AppText from "@/components/AppText";
import WideImage from "@/components/WideImage";
import { CollectionSense } from "@/database/queries/collections";
import { useTheme } from "@/providers/Theme";
import { findSenseImage } from "@/services/senseImage";
import { mediaUrl } from "@/stores/appStore";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { Pressable, View } from "react-native";

const cap = (s: string) => (s ? s[0].toUpperCase() + s.slice(1) : s);

/**
 * 1 nghĩa trong bộ theo bố cục 16:9 (thử), xếp lưới 2 cột: ảnh 16:9 trên đầu thẻ, từ + từ loại + nghĩa ngắn bên dưới,
 * dấu "đã học" đè góc ảnh.
 */
const SenseCardWide = ({ item }: { item: CollectionSense }) => {
  const router = useRouter();
  const { theme } = useTheme();
  const own = mediaUrl(item.imageUri);
  const [fallback, setFallback] = useState<string | null>(null);

  useEffect(() => {
    if (own) return;
    let alive = true;
    findSenseImage(item.keywords, item.value).then((img) => alive && setFallback(img?.url ?? null));
    return () => {
      alive = false;
    };
  }, [own, item.value, item.keywords.join("|")]);

  return (
    <Pressable
      android_ripple={{ color: theme.primary + "14" }}
      onPress={() => router.push({ pathname: "/screens/Word/Detail/[value]", params: { value: item.value } })}
      className="flex-1 rounded-2xl overflow-hidden"
      style={{ backgroundColor: theme.card, borderWidth: 1, borderColor: theme.border }}
    >
      <View>
        <WideImage
          uri={own ?? fallback}
          radius={0}
          style={{ backgroundColor: theme.background2 }}
          fallback={
            <AppText size="2xl" weight="bold" style={{ color: theme.primary + "99" }}>
              {item.value[0]?.toUpperCase()}
            </AppText>
          }
        />
        {item.learned && (
          <View className="absolute h-6 w-6 rounded-full items-center justify-center" style={{ right: 8, top: 8, backgroundColor: theme.card + "E6" }}>
            <AppIcon branch="feather" name="check-circle" size={14} color={theme.success} />
          </View>
        )}
      </View>
      <View style={{ padding: 10, gap: 2 }}>
        <View className="flex-row items-center gap-1.5">
          <AppText numberOfLines={1} weight="bold" color="title" style={{ flexShrink: 1 }}>
            {cap(item.value)}
          </AppText>
          {!!item.pos && (
            <View className="px-1.5 h-4 rounded items-center justify-center" style={{ backgroundColor: theme.primary + "14" }}>
              <AppText size="xs" weight="semibold" color="primary">
                {item.pos}
              </AppText>
            </View>
          )}
        </View>
        <AppText numberOfLines={1} size="sm" color="subText1">
          {item.gloss || " "}
        </AppText>
      </View>
    </Pressable>
  );
};

export default SenseCardWide;
