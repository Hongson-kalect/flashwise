import AppCard from "@/components/AppCard";
import AppIcon from "@/components/AppIcon";
import AppText from "@/components/AppText";
import { HabitView } from "@/database/queries/habit";
import { HABIT_CONFIG } from "@/habit/engine";
import { useBottomSheet } from "@/providers/BottomSheet";
import { useTheme } from "@/providers/Theme";
import { Pressable, View } from "react-native";
import HabitChart from "./habitChart";

const TYPE_LABEL: Record<string, string> = { active: "Có học", shield: "Khiên che ngày nghỉ", lapse: "Mất streak" };

const fmt = (n: number) => (Number.isInteger(n) ? String(n) : n.toFixed(1));
const { shieldDailyTarget: TARGET, stacksPerShield: STACKS, shieldLimit } = HABIT_CONFIG;

/** Biểu đồ chăm chỉ 30 ngày, cách kiếm khiên và lịch sử gần đây (habit_log). Mở từ thẻ Thói quen. */
const HabitDetail = ({ view }: { view: HabitView }) => {
  const { theme } = useTheme();
  return (
    <View style={{ padding: 16, gap: 18 }}>
      <View>
        <AppText font="MulishBold" style={{ marginBottom: 2 }}>
          Mức chăm chỉ
        </AppText>
        <AppText size="sm" color="subText2" style={{ marginBottom: 10 }}>
          Habit tăng khi bạn học đều, giảm khi nghỉ mà không còn khiên che. Dốc lên là học đều, dốc xuống là bỏ bê.
        </AppText>
        <HabitChart series={view.series} />
      </View>

      <View style={{ backgroundColor: theme.background2, borderRadius: 12, padding: 14, gap: 6 }}>
        <AppText font="MulishBold" size="sm">
          Cách kiếm khiên
        </AppText>
        <AppText size="sm" color="subText2">
          {`Mỗi ngày làm đủ ${TARGET} từ (học mới + ôn) được 1 stack, không cần liên tiếp. Đủ ${STACKS} stack đổi 1 khiên (tối đa ${shieldLimit}). Nghỉ một ngày tốn 1 khiên; hết khiên thì mất chuỗi và habit bị trừ.`}
        </AppText>
      </View>

      <View style={{ gap: 12 }}>
        <AppText font="MulishBold">Lịch sử</AppText>
        {view.recent.length === 0 && (
          <AppText color="subText2" size="sm">
            Chưa có gì. Học hoặc ôn một phiên để bắt đầu chuỗi ngày học.
          </AppText>
        )}
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
    </View>
  );
};

/** Thẻ Thói quen: streak, khiên, habit, stack tới khiên kế. Chạm để xem biểu đồ chăm chỉ. */
const HabitCard = ({ view }: { view?: HabitView }) => {
  const { theme } = useTheme();
  const { present } = useBottomSheet();
  if (!view) return null;
  const s = view.state;
  const today = view.series[view.series.length - 1]?.date;
  const doneToday = !!today && s.stackDate === today;

  return (
    <Pressable onPress={() => present({ title: "Thói quen học", size: "full", render: () => <HabitDetail view={view} /> })}>
      <AppCard style={{ padding: 20, gap: 14 }}>
        <View className="flex-row items-center justify-between">
          <View className="flex-row items-center gap-2">
            <AppIcon branch="mui" name="local-fire-department" size={22} color={theme.accent} />
            <AppText size="lg" weight="bold">
              {s.streak > 0 ? `${s.streak} ngày liên tiếp` : "Chưa có chuỗi ngày học"}
            </AppText>
          </View>
          <View className="flex-row items-center gap-1">
            {Array.from({ length: shieldLimit }, (_, i) => (
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
            <View style={{ height: 10, width: `${Math.min(100, s.habit)}%`, backgroundColor: s.habit >= 100 ? theme.success : theme.primary }} />
          </View>
        </View>

        <View>
          <View className="flex-row items-center justify-between mb-1.5">
            <AppText size="sm" color="subText2">
              {`Khiên kế tiếp: học đủ ${TARGET} từ mỗi ngày`}
            </AppText>
            <AppText size="sm" weight="bold">{`${s.stack}/${STACKS}`}</AppText>
          </View>
          <View className="flex-row gap-1.5">
            {Array.from({ length: STACKS }, (_, i) => (
              <View key={i} style={{ flex: 1, height: 8, borderRadius: 4, backgroundColor: i < s.stack ? theme.primary : theme.border }} />
            ))}
          </View>
          <AppText size="tiny" color="subText2" style={{ marginTop: 6 }}>
            {doneToday ? "Hôm nay đã được 1 stack. Chạm để xem biểu đồ chăm chỉ." : `Hôm nay chưa đủ ${TARGET} từ. Chạm để xem biểu đồ chăm chỉ.`}
          </AppText>
        </View>
      </AppCard>
    </Pressable>
  );
};

export default HabitCard;
