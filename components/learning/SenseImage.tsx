import AppImage from "@/components/AppImage";
import AppText from "@/components/AppText";
import { useTheme } from "@/providers/Theme";
import { LearnCard } from "@/learning/types";
import { findSenseImage } from "@/services/senseImage";
import { mediaUrl } from "@/stores/appStore";
import { useEffect, useState } from "react";
import { StyleProp, View, ViewStyle } from "react-native";

type Props = {
  card: LearnCard;
  /** Chiều cao cố định; không đặt thì theo `aspect` (rộng / cao) nên ảnh không bị cắt mất phần đầu. */
  height?: number;
  aspect?: number;
  style?: StyleProp<ViewStyle>;
  showFallbackLetter?: boolean;
};

/** Ảnh minh hoạ của nghĩa: ảnh riêng, không có thì ảnh mở tìm theo từ khoá (như danh sách bộ). Không có ảnh nào thì ẩn. */
const SenseImage = ({ card, height, aspect = 4 / 3, style, showFallbackLetter = false }: Props) => {
  const { theme } = useTheme();
  const own = mediaUrl(card.imageUri);
  const [fallback, setFallback] = useState<string | null>(null);

  useEffect(() => {
    if (own) return;
    let alive = true;
    findSenseImage(card.keywords, card.word).then((img) => alive && setFallback(img?.url ?? null));
    return () => {
      alive = false;
    };
  }, [own, card.word, card.keywords.join("|")]);

  const uri = own ?? fallback;
  if (!uri && !showFallbackLetter) return null;
  return (
    <View className="rounded-2xl overflow-hidden items-center justify-center" style={[height ? { height, width: "100%" } : { aspectRatio: aspect, width: "100%" }, { backgroundColor: theme.background2 }, style]}>
      {uri ? (
        <>
          {/* Nền: chính ảnh đó phủ kín khung và làm mờ nhẹ; ảnh thật cắt vuông 1:1 (như ảnh bìa bên ngoài) nằm giữa */}
          <AppImage source={{ uri }} style={{ position: "absolute", width: "100%", height: "100%" }} contentFit="cover" blurRadius={10} transition={0} />
          <View style={{ position: "absolute", width: "100%", height: "100%", backgroundColor: theme.background2 + "55" }} />
          <AppImage source={{ uri }} style={{ height: "100%", aspectRatio: 1 }} contentFit="cover" contentPosition="top" />
        </>
      ) : (
        <AppText size="3xl" weight="bold" style={{ color: theme.primary + "99" }}>
          {card.word[0]?.toUpperCase()}
        </AppText>
      )}
    </View>
  );
};

export default SenseImage;
