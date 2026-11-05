import AppImage from "@/components/AppImage";
import AppText from "@/components/AppText";
import { useTheme } from "@/providers/Theme";
import { LearnCard } from "@/learning/types";
import { findSenseImage } from "@/services/senseImage";
import { mediaUrl } from "@/stores/appStore";
import { useEffect, useState } from "react";
import { StyleProp, View, ViewStyle } from "react-native";

type Props = { card: LearnCard; height?: number; style?: StyleProp<ViewStyle>; showFallbackLetter?: boolean };

/** Ảnh minh hoạ của nghĩa: ảnh riêng, không có thì ảnh mở tìm theo từ khoá (như danh sách bộ). Không có ảnh nào thì ẩn. */
const SenseImage = ({ card, height = 150, style, showFallbackLetter = false }: Props) => {
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
    <View className="rounded-2xl overflow-hidden items-center justify-center" style={[{ height, width: "100%", backgroundColor: theme.background2 }, style]}>
      {uri ? (
        <AppImage source={{ uri }} style={{ width: "100%", height: "100%" }} />
      ) : (
        <AppText size="3xl" weight="bold" style={{ color: theme.primary + "99" }}>
          {card.word[0]?.toUpperCase()}
        </AppText>
      )}
    </View>
  );
};

export default SenseImage;
