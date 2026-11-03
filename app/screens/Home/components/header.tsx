import AppIcon from "@/components/AppIcon";
import AppText from "@/components/AppText";
import { useTheme } from "@/providers/Theme";
import { useAppStore } from "@/stores/appStore";
import { useAuthStore } from "@/stores/useAuthStore";
import { View } from "react-native";

const greeting = () => {
  const h = new Date().getHours();
  if (h < 11) return "Chào buổi sáng";
  if (h < 14) return "Chào buổi trưa";
  if (h < 18) return "Chào buổi chiều";
  return "Chào buổi tối";
};

const Chip = ({
  icon,
  value,
  color,
}: {
  icon: "local-fire-department" | "bolt";
  value: string;
  color: string;
}) => {
  const { theme } = useTheme();
  return (
    <View
      className="flex-row items-center gap-1.5 px-3 py-1.5 rounded-full"
      style={{ backgroundColor: theme.card, borderWidth: 1, borderColor: theme.border }}
    >
      <AppIcon branch="mui" name={icon} size={16} color={color} />
      <AppText size="sm" font="MulishBold">
        {value}
      </AppText>
    </View>
  );
};

const HomeHeader = () => {
  const profile = useAppStore((s) => s.userProfile);
  const authUser = useAuthStore((s) => s.user);
  const { theme } = useTheme();
  const name = (profile?.full_name || authUser?.full_name || "").trim();
  const streak = profile?.current_streak ?? authUser?.current_streak ?? 0;
  const xp = profile?.total_xp ?? authUser?.total_xp ?? 0;

  return (
    <View className="flex-row items-center justify-between">
      <View className="flex-1 pr-3">
        <AppText size="sm" color="subText2">
          {greeting()}
        </AppText>
        <AppText size="2xl" font="MulishBold" numberOfLines={1}>
          {name || "Bạn"} 👋
        </AppText>
      </View>
      <View className="flex-row gap-2">
        <Chip icon="local-fire-department" color={theme.accent} value={String(streak)} />
        <Chip icon="bolt" color={theme.primary} value={String(xp)} />
      </View>
    </View>
  );
};

export default HomeHeader;
