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
}: {
  collection: CoverSource;
  style?: StyleProp<ViewStyle>;
  radius?: number;
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
      ) : (
        <AppText size="3xl" weight="bold" style={{ color: theme.primary + "99" }}>
          {collection.name?.[0]?.toUpperCase() ?? "?"}
        </AppText>
      )}
    </View>
  );
};

export default CollectionCover;
