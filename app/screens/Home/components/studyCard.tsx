import AppIcon from "@/components/AppIcon";
import AppText from "@/components/AppText";
import { useTheme } from "@/providers/Theme";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { Pressable, View } from "react-native";

/** Ôn tập trước, hết thẻ đến hạn mới gợi ý học từ mới (docs/learning-design.md mục 5). */
const StudyCard = ({ due, loading }: { due: number; loading: boolean }) => {
  const { theme } = useTheme();
  const hasDue = due > 0;
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
      style={{ borderRadius: 24, padding: 20 }}
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
      <AppText size={40} font="MulishBold" color="white" style={{ marginTop: 12 }}>
        {loading ? "–" : hasDue ? String(due) : "Học từ mới"}
      </AppText>
      <AppText size="sm" color="white" style={{ opacity: 0.8 }}>
        {hasDue
          ? "nghĩa cần ôn trước khi quên"
          : "Chọn một bộ từ để bắt đầu cụm mới"}
      </AppText>
      <Pressable
        onPress={() =>
          hasDue
            ? router.push("/screens/Learning/Review/screen")
            : router.push("/screens/Collection/Discover/List/screen")
        }
        className="mt-5 h-12 rounded-2xl flex-row items-center justify-center gap-2"
        style={{ backgroundColor: "#FFFFFF" }}
      >
        <AppText font="MulishBold" style={{ color: accent }}>
          {hasDue ? "Ôn tập ngay" : "Chọn bộ từ"}
        </AppText>
        <AppIcon branch="feather" name="arrow-right" size={18} color={accent} />
      </Pressable>
    </LinearGradient>
  );
};

export default StudyCard;
