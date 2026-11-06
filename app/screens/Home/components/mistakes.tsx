import AppText from "@/components/AppText";
import { MistakeWord } from "@/database/queries/home";
import { useTheme } from "@/providers/Theme";
import { SectionTitle } from "@/ui";
import { router } from "expo-router";
import { FlatList, Pressable, View } from "react-native";

/** Từ hay sai (tính từ review_log ở máy, 30 ngày gần nhất). Không có thì ẩn hẳn. */
const Mistakes = ({ items }: { items: MistakeWord[] }) => {
  const { theme } = useTheme();
  if (!items.length) return null;

  return (
    <View>
      <View className="px-4">
        <SectionTitle title="Từ hay sai" />
      </View>
      <FlatList
        horizontal
        showsHorizontalScrollIndicator={false}
        data={items}
        keyExtractor={(m) => m.original_sense_id}
        contentContainerStyle={{ paddingHorizontal: 16, gap: 12 }}
        renderItem={({ item }) => (
          <Pressable
            onPress={() => router.push({ pathname: "/screens/Word/Detail/[value]", params: { value: item.word } })}
            style={{
              minWidth: 120,
              maxWidth: 200,
              borderRadius: 16,
              padding: 12,
              backgroundColor: theme.card,
              borderWidth: 1,
              borderColor: theme.border,
            }}
          >
            <AppText font="MulishBold" numberOfLines={1}>
              {item.word}
            </AppText>
            <AppText size="xs" color="error" style={{ marginTop: 2 }}>
              Sai {item.wrong}/{item.total} lần
            </AppText>
          </Pressable>
        )}
      />
    </View>
  );
};

export default Mistakes;
