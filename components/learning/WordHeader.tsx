import AppIcon from "@/components/AppIcon";
import AppText from "@/components/AppText";
import { LearnCard } from "@/learning/types";
import { useTheme } from "@/providers/Theme";
import { speakWord } from "@/utils/speak";
import { useEffect } from "react";
import { Pressable, View } from "react-native";

type Props = { card: LearnCard; autoPlay?: boolean };

/** Từ + phiên âm + từ loại + nút nghe. `autoPlay` đọc 1 lần khi hiện (theo cài đặt `hearable`). */
const WordHeader = ({ card, autoPlay = false }: Props) => {
  const { theme } = useTheme();
  useEffect(() => {
    if (autoPlay) speakWord(card);
  // eslint-disable-next-line react-hooks/exhaustive-deps -- cố ý: chỉ chạy lại khi phụ thuộc liệt kê đổi (hàm / đối tượng còn lại đổi mỗi lần render hoặc đã ổn định)
  }, [card.key, autoPlay]);

  return (
    // Từ ở giữa cả dòng; từ loại, phiên âm và nút nghe xếp thành 1 hàng phụ ngay dưới
    <View className="items-center gap-2">
      <AppText size="3xl" weight="bold" color="primary" textAlign="center">
        {card.word}
      </AppText>
      <View className="flex-row items-center justify-center gap-2">
        {!!card.pos && (
          <View className="px-2 h-6 rounded-md items-center justify-center" style={{ backgroundColor: theme.primary + "14" }}>
            <AppText size="xs" weight="semibold" color="primary">
              {card.pos}
            </AppText>
          </View>
        )}
        {!!card.ipa && (
          <AppText size="sm" color="subText2">
            {card.ipa}
          </AppText>
        )}
        <Pressable
          onPress={() => speakWord(card)}
          hitSlop={8}
          className="h-8 w-8 rounded-full items-center justify-center"
          style={{ backgroundColor: theme.primary + "14" }}
          accessibilityLabel="Nghe phát âm"
        >
          <AppIcon branch="feather" name="volume-2" size={16} color={theme.primary} />
        </Pressable>
      </View>
    </View>
  );
};

export default WordHeader;
