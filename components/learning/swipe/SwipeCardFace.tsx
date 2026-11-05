import AppIcon from "@/components/AppIcon";
import AppText from "@/components/AppText";
import SenseImage from "@/components/learning/SenseImage";
import WordHeader from "@/components/learning/WordHeader";
import { glossOf, LearnCard } from "@/learning/types";
import { useTheme } from "@/providers/Theme";
import { ScrollView, View } from "react-native";

type Props = {
  card: LearnCard;
  /** Đã xem nghĩa tiếng mẹ đẻ (tính Quên). */
  flipped: boolean;
  /** Xem lại thẻ đã quên: không chấm. */
  review: boolean;
};

/**
 * Nội dung 1 thẻ vuốt: mặt trước toàn tiếng đích (từ, ảnh, định nghĩa, ví dụ), tiếng mẹ đẻ chỉ hiện khi bấm "Xem nghĩa"
 * (docs 3.2). Cuộn được nếu thẻ dài; cử chỉ vuốt ngang ở SwipeDeck.
 */
const SwipeCardFace = ({ card, flipped, review }: Props) => {
  const { theme } = useTheme();
  return (
    <ScrollView contentContainerStyle={{ padding: 16, gap: 14 }} showsVerticalScrollIndicator={false}>
      {review && (
        <View className="flex-row items-center justify-center gap-1.5 px-3 h-8 rounded-full self-center" style={{ backgroundColor: theme.warning + "1F" }}>
          <AppIcon branch="feather" name="rotate-ccw" size={14} color={theme.warning} />
          <AppText size="xs" weight="semibold" style={{ color: theme.warning }}>
            Từ vừa quên, xem lại một lần
          </AppText>
        </View>
      )}
      <WordHeader card={card} />
      <SenseImage card={card} aspect={16 / 9} />
      {!!card.definition && (
        <AppText color="title" textAlign="center">
          {card.definition}
        </AppText>
      )}
      {!!card.example && (
        <AppText color="subText1" textAlign="center" style={{ fontStyle: "italic" }}>
          {card.example.text}
        </AppText>
      )}
      {flipped && (
        <View className="p-4 rounded-2xl gap-1" style={{ backgroundColor: theme.primary + "14", borderWidth: 1, borderColor: theme.primary }}>
          <AppText size="xl" weight="bold" color="primary" textAlign="center">
            {glossOf(card)}
          </AppText>
          {!!card.definitionNative && (
            <AppText size="sm" color="subText1" textAlign="center">
              {card.definitionNative}
            </AppText>
          )}
          {!!card.example?.native && (
            <AppText size="sm" color="subText2" textAlign="center" style={{ fontStyle: "italic" }}>
              {card.example.native}
            </AppText>
          )}
        </View>
      )}
    </ScrollView>
  );
};

export default SwipeCardFace;
