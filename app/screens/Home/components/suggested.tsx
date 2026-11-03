import AppIcon from "@/components/AppIcon";
import AppImage from "@/components/AppImage";
import AppText from "@/components/AppText";
import { SectionTitle } from "@/ui";
import { useTheme } from "@/providers/Theme";
import { CollectionSummary, fetchSuggested } from "@/services/api/collections";
import { mediaUrl, useAppStore } from "@/stores/appStore";
import { useQuery } from "@tanstack/react-query";
import { router } from "expo-router";
import { FlatList, Pressable, View } from "react-native";

const Suggested = () => {
  const { theme } = useTheme();
  const settings = useAppStore((s) => s.settings);
  const lang = settings?.learning_language ?? "en";
  const tags: string[] = Array.isArray(settings?.interest_tags)
    ? settings.interest_tags
    : [];

  const { data, isLoading, isError } = useQuery({
    queryKey: ["suggested", lang, tags.join(",")],
    queryFn: () => fetchSuggested(lang, tags),
    staleTime: 5 * 60_000,
  });

  // Offline hoặc chưa có bộ nào: ẩn hẳn, không chiếm chỗ.
  if (isError || (!isLoading && !data?.length)) return null;

  const items: (CollectionSummary | null)[] = isLoading ? [null, null, null] : data!;

  return (
    <View>
      <View className="px-4">
        <SectionTitle
          title="Gợi ý cho bạn"
          right={
            <Pressable
              hitSlop={8}
              onPress={() => router.push("/screens/Collection/Discover/List/screen")}
            >
              <AppText size="sm" color="primary" weight="semibold">
                Xem tất cả
              </AppText>
            </Pressable>
          }
        />
      </View>
      <FlatList
        horizontal
        showsHorizontalScrollIndicator={false}
        data={items}
        keyExtractor={(c, i) => c?.id ?? `sk-${i}`}
        contentContainerStyle={{ paddingHorizontal: 16, gap: 12 }}
        renderItem={({ item }) =>
          !item ? (
            <View
              style={{
                width: 200,
                height: 150,
                borderRadius: 20,
                backgroundColor: theme.card,
              }}
            />
          ) : (
            <Pressable
              onPress={() =>
                router.push(`/screens/Collection/Discover/Detail/${item.id}`)
              }
              style={{
                width: 200,
                borderRadius: 20,
                backgroundColor: theme.card,
                borderWidth: 1,
                borderColor: theme.border,
                overflow: "hidden",
              }}
            >
              <View style={{ height: 90, backgroundColor: theme.tertiary }}>
                {mediaUrl(item.image_url) ? (
                  <AppImage
                    source={{ uri: mediaUrl(item.image_url) }}
                    style={{ flex: 1 }}
                  />
                ) : (
                  <View className="flex-1 items-center justify-center">
                    <AppIcon branch="feather" name="layers" size={28} color={theme.primary} />
                  </View>
                )}
              </View>
              <View className="p-3">
                <AppText font="MulishBold" numberOfLines={1}>
                  {item.name}
                </AppText>
                <AppText size="xs" color="subText2" style={{ marginTop: 2 }}>
                  {item.senses_count} nghĩa · {item.downloaded_count} lượt tải
                </AppText>
              </View>
            </Pressable>
          )
        }
      />
    </View>
  );
};

export default Suggested;
