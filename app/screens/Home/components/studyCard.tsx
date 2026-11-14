import AppIcon from "@/components/AppIcon";
import AppText from "@/components/AppText";

import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { Pressable, View } from "react-native";
import { useNextStudy } from "../useNextStudy";

/** Ôn tập trước, hết thẻ đến hạn mới gợi ý học từ mới (docs/learning-design.md mục 5). */
const StudyCard = ({ due, loading }: { due: number; loading: boolean }) => {
  
  const hasDue = due > 0;
  const next = useNextStudy(!hasDue && !loading).data;
  // Hết thẻ ôn: nút đi thẳng tới bộ còn từ mới (hoặc bộ cần tải), học hết cả rồi thì tới Khám phá
  const target = !hasDue && next
    ? next.kind === "learn"
      ? { title: "Học từ mới", sub: `Bộ "${next.name}": còn ${next.remaining} nghĩa chưa học`, button: "Học từ mới", go: () => router.push({ pathname: "/screens/Learning/New/screen", params: { id: next.id } }) }
      : next.kind === "download"
        ? { title: "Tải bộ từ", sub: `Tải bộ "${next.name}" về máy để học tiếp`, button: "Tải bộ từ", go: () => router.push({ pathname: "/screens/Collection/Detail/[id]", params: { id: next.id } }) }
        : { title: "Đã học hết", sub: next.hasCollections ? "Bạn đã học hết từ mới trong mọi bộ. Khám phá thêm bộ từ nhé" : "Bạn chưa có bộ từ nào. Khám phá để thêm bộ đầu tiên", button: "Khám phá bộ từ", go: () => router.push("/screens/Collection/Discover/List/screen") }
    : null;
  // Luôn gradient xanh thương hiệu; trạng thái "đã ôn xong" dịu hơn (xanh trời -> xanh chủ đạo)
  const colors = hasDue
    ? (["#2563EB", "#1E3A8A"] as const)
    : (["#0EA5E9", "#2563EB"] as const);
  const accent = "#2563EB";

  return (
    <LinearGradient
      colors={colors}
      start={[0, 0]}
      end={[1, 1]}
      style={{ borderRadius: 20, padding: 16 }}
    >
      <View className="flex-row items-center gap-2">
        <AppIcon
          branch="feather"
          name={hasDue ? "refresh-cw" : "sun"}
          size={14}
          color="#ffffffcc"
        />
        <AppText size="sm" color="white" font="MulishSemiBold">
          {hasDue ? "Đến giờ ôn tập" : "Hôm nay đã ôn xong"}
        </AppText>
      </View>
      <AppText size={32} font="MulishBold" color="white" style={{ marginTop: 8 }}>
        {loading ? "–" : hasDue ? String(due) : (target?.title ?? "Học từ mới")}
      </AppText>
      <AppText size="sm" color="white" style={{ opacity: 0.8 }}>
        {hasDue
          ? "nghĩa cần ôn trước khi quên"
          : (target?.sub ?? "Đang tìm bộ từ để học tiếp...")}
      </AppText>
      <Pressable
        onPress={() => (hasDue ? router.push("/screens/Learning/Review/screen") : target ? target.go() : router.push("/screens/Collection/Discover/List/screen"))}
        className="mt-4 h-11 rounded-xl flex-row items-center justify-center gap-2"
        style={{ backgroundColor: "#FFFFFF" }}
      >
        <AppText font="MulishBold" style={{ color: accent }}>
          {hasDue ? "Ôn tập ngay" : (target?.button ?? "Chọn bộ từ")}
        </AppText>
        <AppIcon branch="feather" name="arrow-right" size={16} color={accent} />
      </Pressable>
    </LinearGradient>
  );
};

export default StudyCard;
