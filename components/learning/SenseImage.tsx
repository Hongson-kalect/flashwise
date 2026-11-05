import AppText from "@/components/AppText";
import WideImage from "@/components/WideImage";
import { useTheme } from "@/providers/Theme";
import { LearnCard } from "@/learning/types";
import { findSenseImage } from "@/services/senseImage";
import { mediaUrl } from "@/stores/appStore";
import { useEffect, useState } from "react";
import { StyleProp, ViewStyle } from "react-native";

type Props = {
  card: LearnCard;
  /** Chiều cao cố định; không đặt thì theo `aspect` (rộng / cao). */
  height?: number;
  aspect?: number;
  style?: StyleProp<ViewStyle>;
  showFallbackLetter?: boolean;
};

/** Ảnh minh hoạ của nghĩa: ảnh riêng, không có thì ảnh mở tìm theo từ khoá (như danh sách bộ). Không có ảnh nào thì ẩn. Khung vẽ ở `WideImage`. */
const SenseImage = ({ card, height, aspect = 16 / 9, style, showFallbackLetter = false }: Props) => {
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
    <WideImage
      uri={uri}
      aspect={aspect}
      height={height}
      style={[{ backgroundColor: theme.background2 }, style]}
      fallback={
        <AppText size="3xl" weight="bold" style={{ color: theme.primary + "99" }}>
          {card.word[0]?.toUpperCase()}
        </AppText>
      }
    />
  );
};

export default SenseImage;
