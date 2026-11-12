import { getHabitView } from "@/database/queries/habit";
import {
  dateKey,
  getDueCount,
  getMistakeWords,
  getRecentLogs,
  learningDayBounds,
} from "@/database/queries/home";
import { useAppStore } from "@/stores/appStore";
import { useQuery } from "@tanstack/react-query";
import { useSQLiteContext } from "expo-sqlite";

/** Số liệu Home tính từ SQLite (không có API riêng, xem APP_INTEGRATION mục 8). */
export const useHomeData = () => {
  const db = useSQLiteContext();
  const settings = useAppStore((s) => s.settings);
  const dayStartHour = Number(settings?.day_start_hour ?? 4);
  const dailyGoal = Number(settings?.daily_goal ?? 20);

  const q = useQuery({
    queryKey: ["home", dayStartHour],
    queryFn: async () => {
      const [due, week, mistakes, habit] = await Promise.all([
        getDueCount(db, dayStartHour),
        getRecentLogs(db, 7, dayStartHour),
        getMistakeWords(db),
        getHabitView(db),
      ]);
      const todayKey = dateKey(learningDayBounds(dayStartHour).start);
      const today = week.find((d) => d.date === todayKey) ?? week[week.length - 1];
      return { due, week, today, mistakes, habit };
    },
    staleTime: 0,
    // Thẻ vừa học / vừa quên hẹn vài phút hoặc vài giờ: tới giờ thì số "đến hạn" phải tự đổi (đọc SQLite nên rẻ)
    refetchInterval: 30_000,
  });

  return { ...q, dailyGoal };
};
