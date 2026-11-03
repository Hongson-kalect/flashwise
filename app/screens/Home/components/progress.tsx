import AppCard from "@/components/AppCard";
import AppText from "@/components/AppText";
import { ProgressRing } from "@/ui";
import { DayLog } from "@/database/queries/home";
import { useTheme } from "@/providers/Theme";
import { View } from "react-native";

const DOW = ["CN", "T2", "T3", "T4", "T5", "T6", "T7"];

/** Mục tiêu hôm nay + cột 7 ngày gần nhất (words_learned + words_relearned). */
const Progress = ({
  week,
  today,
  goal,
}: {
  week: DayLog[];
  today?: DayLog;
  goal: number;
}) => {
  const { theme } = useTheme();
  const doneToday = (today?.words_learned ?? 0) + (today?.words_relearned ?? 0);
  const pct = Math.min(1, goal > 0 ? doneToday / goal : 0);
  const totals = week.map((d) => d.words_learned + d.words_relearned);
  const max = Math.max(1, ...totals);

  return (
    <AppCard style={{ padding: 20 }}>
      <View className="flex-row items-center gap-5">
        <ProgressRing
          value={pct * 100}
          size={88}
          strokeWidth={9}
          color={pct >= 1 ? "success" : "primary"}
        >
          <AppText size="lg" weight="bold">
            {Math.round(pct * 100)}%
          </AppText>
        </ProgressRing>
        <View className="flex-1">
          <AppText size="sm" color="subText2">
            Mục tiêu hôm nay
          </AppText>
          <AppText size="2xl" weight="bold">
            {doneToday}
            <AppText size="md" color="subText2">{` / ${goal} từ`}</AppText>
          </AppText>
          {pct >= 1 && (
            <AppText size="sm" color="success" weight="bold">
              Hoàn thành 🎉
            </AppText>
          )}
        </View>
      </View>

      <View className="flex-row items-end justify-between mt-6 h-24">
        {week.map((d, i) => {
          const isToday = i === week.length - 1;
          const h = totals[i] === 0 ? 4 : Math.max(8, (totals[i] / max) * 72);
          return (
            <View key={d.date} className="flex-1 items-center justify-end gap-1.5">
              <View
                style={{
                  height: h,
                  width: 14,
                  borderRadius: 7,
                  backgroundColor:
                    totals[i] === 0
                      ? theme.border
                      : isToday
                        ? theme.primary
                        : theme.primary + "55",
                }}
              />
              <AppText
                size="tiny"
                color={isToday ? "primary" : "subText2"}
                font={isToday ? "MulishBold" : "MulishRegular"}
              >
                {DOW[new Date(d.date + "T00:00:00").getDay()]}
              </AppText>
            </View>
          );
        })}
      </View>
    </AppCard>
  );
};

export default Progress;
