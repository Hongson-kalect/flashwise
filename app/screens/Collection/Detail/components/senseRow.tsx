import AppIcon from "@/components/AppIcon";
import AppImage from "@/components/AppImage";
import AppText from "@/components/AppText";
import { CollectionSense } from "@/database/queries/collections";
import { useTheme } from "@/providers/Theme";
import { findSenseImage } from "@/services/senseImage";
import { mediaUrl } from "@/stores/appStore";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { Pressable, View } from "react-native";

const cap = (s: string) => (s ? s[0].toUpperCase() + s.slice(1) : s);

/** 1 nghĩa trong bộ: ảnh (của nghĩa, không có thì ảnh minh hoạ mở), từ, nghĩa ngắn, từ loại. */
const SenseRow = ({ item }: { item: CollectionSense }) => {
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

  const uri = own ?? fallback;
  return (
    <Pressable
      android_ripple={{ color: theme.primary + "14" }}
      onPress={() =>
        router.push({ pathname: "/screens/Word/Detail/[value]", params: { value: item.value } })
      }
      className="flex-row items-center gap-3 p-3 rounded-2xl"
      style={{ backgroundColor: theme.card, borderWidth: 1, borderColor: theme.border }}
    >
      <View
        className="rounded-xl overflow-hidden items-center justify-center"
        style={{ height: 60, width: 60, backgroundColor: theme.background2 }}
      >
        {uri ? (
          <AppImage source={{ uri }} style={{ width: "100%", height: "100%" }} />
        ) : (
          <AppText size="xl" weight="bold" style={{ color: theme.primary + "99" }}>
            {item.value[0]?.toUpperCase()}
          </AppText>
        )}
      </View>

      <View className="flex-1">
        <View className="flex-row items-center gap-2">
          <AppText numberOfLines={1} size="lg" weight="bold" color="title" style={{ flexShrink: 1 }}>
            {cap(item.value)}
          </AppText>
          {item.pos ? (
            <View
              className="px-2 h-5 rounded-md items-center justify-center"
              style={{ backgroundColor: theme.primary + "14" }}
            >
              <AppText size="xs" weight="semibold" color="primary">
                {item.pos}
              </AppText>
            </View>
          ) : null}
          {item.learned && (
            <AppIcon branch="feather" name="check-circle" size={14} color={theme.success} />
          )}
        </View>
        <AppText numberOfLines={1} size="sm" color="subText1" style={{ marginTop: 1 }}>
          {item.gloss || " "}
        </AppText>
        {item.ipa ? (
          <AppText numberOfLines={1} size="xs" color="subText3" style={{ marginTop: 2 }}>
            {item.ipa}
          </AppText>
        ) : null}
      </View>
    </Pressable>
  );
};

export default SenseRow;
