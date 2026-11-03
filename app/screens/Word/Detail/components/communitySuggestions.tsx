import AppChip from "@/components/AppChip";
import AppIcon from "@/components/AppIcon";
import AppText from "@/components/AppText";
import { fetchCommunitySenses, CommunitySense } from "@/services/api/senses";
import { useTheme } from "@/providers/Theme";
import { Skeleton } from "@/ui";
import { useQuery } from "@tanstack/react-query";
import { Pressable, View } from "react-native";

type Props = {
  wordId: string;
  wordLang: string;
  userLang: string;
  onPick: (sense: CommunitySense) => void;
};

const Stat = ({ icon, value }: { icon: any; value: number }) => {
  const { theme } = useTheme();
  return (
    <View className="flex-row items-center gap-1">
      <AppIcon branch="feather" name={icon} size={13} color={theme.subText2} />
      <AppText size="xs" color="subText2">
        {value}
      </AppText>
    </View>
  );
};

/** Danh sách nghĩa của cộng đồng (đã xếp hạng) để chọn điền nhanh vào form. */
const CommunitySuggestions = ({ wordId, wordLang, userLang, onPick }: Props) => {
  const { theme } = useTheme();
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ["community", wordId, userLang],
    queryFn: () => fetchCommunitySenses(wordId, userLang),
    staleTime: 60_000,
  });

  if (isLoading) {
    return (
      <View className="gap-3">
        {[0, 1, 2].map((i) => (
          <Skeleton key={i} height={96} radius={16} />
        ))}
      </View>
    );
  }

  if (isError) {
    return (
      <View className="items-center py-6 gap-3">
        <AppText color="subText2" textAlign="center">
          Không tải được gợi ý. Kiểm tra mạng rồi thử lại.
        </AppText>
        <AppChip label="Thử lại" onPress={() => refetch()} />
      </View>
    );
  }

  if (!data?.length) {
    return (
      <View className="items-center py-8 gap-2">
        <AppIcon branch="feather" name="users" size={28} color={theme.subText3} />
        <AppText color="subText2" textAlign="center">
          Chưa có nghĩa nào từ cộng đồng cho từ này.
        </AppText>
      </View>
    );
  }

  return (
    <View className="gap-3">
      <AppText size="sm" color="subText2">
        Chọn một nghĩa: các ô đang trống sẽ được điền, ô đã có dữ liệu giữ nguyên.
      </AppText>
      {data.map((s, i) => {
        const def =
          s.contents.definition?.[userLang]?.value ?? s.contents.definition?.[wordLang]?.value ?? "";
        const exCount = s.contents.examples?.length ?? 0;
        return (
          <Pressable
            key={s.id}
            onPress={() => onPick(s)}
            android_ripple={{ color: theme.primary + "14" }}
            className="p-3.5 rounded-2xl"
            style={{
              backgroundColor: theme.card,
              borderWidth: 1,
              borderColor: i === 0 ? theme.primary + "66" : theme.border,
            }}
          >
            <View className="flex-row items-center gap-2 mb-1.5">
              {s.pos ? <AppChip label={s.pos} size="sm" /> : null}
              {s.quality_status === "verified" && (
                <View className="flex-row items-center gap-1">
                  <AppIcon branch="feather" name="check-circle" size={13} color={theme.success} />
                  <AppText size="xs" color="success" weight="semibold">
                    Đã xác minh
                  </AppText>
                </View>
              )}
              {i === 0 && (
                <AppText size="xs" color="primary" weight="bold">
                  Phổ biến nhất
                </AppText>
              )}
            </View>
            <AppText numberOfLines={3} weight="semibold" color="title">
              {def || "(chưa có định nghĩa)"}
            </AppText>
            <View className="flex-row items-center gap-4 mt-2">
              <Stat icon="heart" value={s.like_count} />
              <Stat icon="copy" value={s.adopted_count} />
              <Stat icon="list" value={exCount} />
              <View className="flex-1" />
              <AppText size="xs" color="subText3" numberOfLines={1}>
                {s.author?.name ?? "Ẩn danh"}
              </AppText>
            </View>
          </Pressable>
        );
      })}
    </View>
  );
};

export default CommunitySuggestions;
