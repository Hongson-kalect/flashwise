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
  }, [card.key, autoPlay]);

  return (
    <View className="flex-row items-center justify-center gap-3">
      <View className="items-center">
        <View className="flex-row items-center gap-2">
          <AppText size="3xl" weight="bold" color="primary" textAlign="center">
            {card.word}
          </AppText>
          {!!card.pos && (
            <View className="px-2 h-5 rounded-md items-center justify-center" style={{ backgroundColor: theme.primary + "14" }}>
              <AppText size="xs" weight="semibold" color="primary">
                {card.pos}
              </AppText>
            </View>
          )}
        </View>
        {!!card.ipa && (
          <AppText size="sm" color="subText2">
            {card.ipa}
          </AppText>
        )}
      </View>
      <Pressable
        onPress={() => speakWord(card)}
        hitSlop={8}
        className="h-11 w-11 rounded-full items-center justify-center"
        style={{ backgroundColor: theme.primary + "14" }}
        accessibilityLabel="Nghe phát âm"
      >
        <AppIcon branch="feather" name="volume-2" size={20} color={theme.primary} />
      </Pressable>
    </View>
  );
};

export default WordHeader;
