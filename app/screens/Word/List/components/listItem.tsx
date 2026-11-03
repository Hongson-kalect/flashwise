import AppIcon from "@/components/AppIcon";
import AppImage from "@/components/AppImage";
import AppText from "@/components/AppText";
import { WordRow } from "@/database/queries/words";
import { useTheme } from "@/providers/Theme";
import { mediaUrl } from "@/stores/appStore";
import { useRouter } from "expo-router";
import * as Speech from "expo-speech";
import { Pressable, View } from "react-native";

type Props = {
  word: WordRow;
  onLongPress?: () => void;
};

const cap = (s: string) => (s ? s[0].toUpperCase() + s.slice(1) : s);

/** Thẻ 1 từ trong danh sách: ảnh, từ, nghĩa ngắn, phiên âm, từ loại. Chạm để mở chi tiết. */
const WordListItem = ({ word, onLongPress }: Props) => {
  const router = useRouter();
  const { theme } = useTheme();
  const image = mediaUrl(word.imageUri);

  return (
    <Pressable
      onLongPress={onLongPress}
      android_ripple={{ color: theme.primary + "14" }}
      onPress={() =>
        router.push({
          pathname: "/screens/Word/Detail/[value]",
          params: { value: word.value },
        })
      }
      className="flex-row items-center gap-3 p-3 rounded-2xl"
      style={{
        backgroundColor: theme.card,
        borderWidth: 1,
        borderColor: theme.border,
      }}
    >
      <View
        className="rounded-xl overflow-hidden items-center justify-center"
        style={{ height: 76, width: 96, backgroundColor: theme.background2 }}
      >
        {image ? (
          <AppImage source={{ uri: image }} style={{ width: "100%", height: "100%" }} />
        ) : (
          <AppText size="2xl" weight="bold" style={{ color: theme.primary + "99" }}>
            {word.value[0]?.toUpperCase()}
          </AppText>
        )}
      </View>

      <View className="flex-1">
        <View className="flex-row items-center gap-2">
          <AppText numberOfLines={1} size="lg" weight="bold" color="title" style={{ flexShrink: 1 }}>
            {cap(word.value)}
          </AppText>
          {word.learned && (
            <AppIcon branch="feather" name="check-circle" size={14} color={theme.success} />
          )}
        </View>
        <AppText numberOfLines={1} size="sm" color="subText1" style={{ marginTop: 1 }}>
          {word.gloss || " "}
        </AppText>

        <View className="flex-row items-center justify-between mt-2">
          <View className="flex-row items-center gap-2 flex-1">
            <Pressable
              hitSlop={8}
              onPress={() => Speech.speak(word.value, { language: word.languageCode })}
              className="h-7 w-7 rounded-full items-center justify-center"
              style={{ backgroundColor: theme.primary + "1F" }}
            >
              <AppIcon branch="feather" name="volume-2" size={14} color={theme.primary} />
            </Pressable>
            <AppText numberOfLines={1} size="xs" color="subText2" style={{ flexShrink: 1 }}>
              {word.ipa}
            </AppText>
          </View>
          <View className="flex-row items-center gap-1.5">
            {word.level ? (
              <View
                className="px-2 h-6 rounded-md items-center justify-center"
                style={{ backgroundColor: theme.accent + "26" }}
              >
                <AppText size="xs" weight="semibold" style={{ color: theme.accent }}>
                  {word.level}
                </AppText>
              </View>
            ) : null}
            {word.posList.slice(0, 2).map((p) => (
              <View
                key={p}
                className="px-2 h-6 rounded-md items-center justify-center"
                style={{ backgroundColor: theme.primary + "14" }}
              >
                <AppText size="xs" weight="semibold" color="primary">
                  {p}
                </AppText>
              </View>
            ))}
            {word.senseCount > 1 && (
              <AppText size="xs" color="subText3">
                +{word.senseCount}
              </AppText>
            )}
          </View>
        </View>
      </View>
    </Pressable>
  );
};

export default WordListItem;
