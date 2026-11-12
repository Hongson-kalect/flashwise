import AppImage from "@/components/AppImage";
import AppText from "@/components/AppText";
import { useTheme } from "@/providers/Theme";
import { findSenseImage } from "@/services/senseImage";
import { mediaUrl } from "@/stores/appStore";
import { useEffect, useState } from "react";
import { StyleProp, View, ViewStyle } from "react-native";

type CoverSource = {
  name: string;
  imageUrl: string | null;
  coverUri: string | null;
  coverWord: string | null;
  coverKeywords: string[];
};

/**
 * Ảnh bìa bộ từ, thứ tự: ảnh riêng của bộ → ảnh của một nghĩa trong bộ → ảnh minh hoạ mở (Pixabay / Wikimedia
 * Commons) tìm theo từ khoá của nghĩa đó → chữ cái đầu trên nền nhạt.
 */
const CollectionCover = ({
  collection,
  style,
  radius = 14,
  watermark = false,
}: {
  collection: CoverSource;
  style?: StyleProp<ViewStyle>;
  radius?: number;
  /** true: tên bộ in hoa, đậm, mờ, cỡ lớn ngay trên khung ảnh (màn xem chi tiết); false: chữ cái đầu khi không có ảnh (thẻ nhỏ). */
  watermark?: boolean;
}) => {
  const { theme } = useTheme();
  const own = mediaUrl(collection.imageUrl) ?? mediaUrl(collection.coverUri);
  const [fallback, setFallback] = useState<string | null>(null);

  useEffect(() => {
    if (own || !collection.coverWord) {
      setFallback(null);
      return;
    }
    let alive = true;
    findSenseImage(collection.coverKeywords, collection.coverWord).then(
      (img) => alive && setFallback(img?.url ?? null),
    );
    return () => {
      alive = false;
    };
  }, [own, collection.coverWord, collection.coverKeywords.join("|")]);

  const uri = own ?? fallback;
  return (
    <View
      style={[
        {
          backgroundColor: theme.primary + "14",
          borderRadius: radius,
          overflow: "hidden",
          alignItems: "center",
          justifyContent: "center",
        },
        style,
      ]}
    >
      {uri ? (
        <AppImage source={{ uri }} style={{ width: "100%", height: "100%" }} />
      ) : !watermark ? (
        <AppText size="3xl" weight="bold" style={{ color: theme.primary + "99" }}>
          {collection.name?.[0]?.toUpperCase() ?? "?"}
        </AppText>
      ) : null}
      {watermark && !!collection.name && (
        <View pointerEvents="none" style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0, alignItems: "center", justifyContent: "center", paddingHorizontal: 20 }}>
          <AppText
            numberOfLines={3}
            style={{
              fontSize: 34,
              lineHeight: 40,
              fontWeight: "900",
              textAlign: "center",
              letterSpacing: 1.5,
              textTransform: "uppercase",
              color: uri ? "#FFFFFF" : theme.primary,
              opacity: uri ? 0.62 : 0.4,
              textShadowColor: uri ? "rgba(0,0,0,0.45)" : "transparent",
              textShadowRadius: uri ? 10 : 0,
            }}
          >
            {collection.name}
          </AppText>
        </View>
      )}
    </View>
  );
};

export default CollectionCover;
