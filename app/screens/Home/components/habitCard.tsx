import AppCard from "@/components/AppCard";
import AppIcon from "@/components/AppIcon";
import AppText from "@/components/AppText";
import { HabitView } from "@/database/queries/habit";
import { HABIT_CONFIG, nextMilestone } from "@/habit/engine";
import { useBottomSheet } from "@/providers/BottomSheet";
import { useTheme } from "@/providers/Theme";
import { Pressable, View } from "react-native";

const TYPE_LABEL: Record<string, string> = { active: "Có học", shield: "Khiên che ngày nghỉ", lapse: "Mất streak" };

const fmt = (n: number) => (Number.isInteger(n) ? String(n) : n.toFixed(1));

/** Lịch sử streak / khiên / habit gần đây (habit_log), mở từ thẻ Thói quen. */
const HabitHistory = ({ view }: { view: HabitView }) => {
  const { theme } = useTheme();
  if (!view.recent.length) {
    return (
      <AppText color="subText2" style={{ padding: 16 }}>
        Chưa có gì. Học hoặc ôn một phiên để bắt đầu chuỗi ngày học.
      </AppText>
    );
  }
  return (
    <View style={{ padding: 16, gap: 12 }}>
      {view.recent.map((r) => (
        <View key={r.id} className="flex-row items-center gap-3">
          <AppIcon
            branch="mui"
            name={r.type === "active" ? "check-circle" : r.type === "shield" ? "shield" : "heart-broken"}
            size={20}
            color={r.type === "active" ? theme.success : r.type === "shield" ? theme.primary : theme.error}
          />
          <View className="flex-1">
            <AppText font="MulishBold" size="sm">
              {TYPE_LABEL[r.type] ?? r.type} · {r.log_date}
            </AppText>
            <AppText size="tiny" color="subText2">
              {[
                r.habit_delta ? `habit ${r.habit_delta > 0 ? "+" : ""}${fmt(r.habit_delta)}%` : null,
                r.shield_delta ? `khiên ${r.shield_delta > 0 ? "+" : ""}${r.shield_delta}` : null,
                r.note,
              ]
                .filter(Boolean)
                .join(" · ") || "Không đổi"}
            </AppText>
          </View>
          <AppText size="sm" color="subText2">{`${fmt(r.habit_snap)}%`}</AppText>
        </View>
      ))}
    </View>
  );
};

/** Thẻ Thói quen: streak, thanh habit 0-100 có mốc thưởng khiên, số khiên. Chạm để xem lịch sử. */
const HabitCard = ({ view }: { view?: HabitView }) => {
  const { theme } = useTheme();
  const { present } = useBottomSheet();
  if (!view) return null;
  const s = view.state;
  const next = nextMilestone(s);
  const full = s.habit >= 100;

  return (
    <Pressable onPress={() => present({ title: "Thói quen học", size: "long", render: () => <HabitHistory view={view} /> })}>
      <AppCard style={{ padding: 20, gap: 14 }}>
        <View className="flex-row items-center justify-between">
          <View className="flex-row items-center gap-2">
            <AppIcon branch="mui" name="local-fire-department" size={22} color={theme.accent} />
            <AppText size="lg" weight="bold">
              {s.streak > 0 ? `${s.streak} ngày liên tiếp` : "Chưa có chuỗi ngày học"}
            </AppText>
          </View>
          <View className="flex-row items-center gap-1">
            {Array.from({ length: HABIT_CONFIG.shieldLimit }, (_, i) => (
              <AppIcon key={i} branch="mui" name="shield" size={20} color={i < s.shield ? theme.primary : theme.border} />
            ))}
          </View>
        </View>

        <View>
          <View className="flex-row justify-between mb-1.5">
            <AppText size="sm" color="subText2">
              Độ bền thói quen
            </AppText>
            <AppText size="sm" weight="bold">{`${fmt(s.habit)}%`}</AppText>
          </View>
          <View style={{ height: 10, borderRadius: 5, backgroundColor: theme.border, overflow: "hidden" }}>
            <View style={{ height: 10, width: `${Math.min(100, s.habit)}%`, backgroundColor: full ? theme.success : theme.primary }} />
          </View>
          <View style={{ height: 14 }}>
            {HABIT_CONFIG.milestones.slice(0, 2).map((m, i) => (
              <View key={m} style={{ position: "absolute", left: `${m}%`, top: 2, alignItems: "center", width: 16, marginLeft: -8 }}>
                <AppIcon branch="mui" name="shield" size={10} color={s.claim[i] ? theme.subText2 : theme.primary} />
              </View>
            ))}
          </View>
        </View>

        <AppText size="sm" color="subText2">
          {full
            ? `Habit đã đầy. Tích thêm ${fmt(s.retain)}/${HABIT_CONFIG.retainLimit} điểm để được 1 khiên nữa.`
            : next
              ? `Còn ${fmt(next.remaining)}% tới mốc ${next.at}% (được 1 khiên). Nghỉ một ngày sẽ tốn 1 khiên, hết khiên thì mất chuỗi và tụt habit.`
              : `Học đều để giữ habit. Nghỉ một ngày sẽ tốn 1 khiên.`}
        </AppText>
      </AppCard>
    </Pressable>
  );
};

export default HabitCard;
