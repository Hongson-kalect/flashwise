import { getHabitView } from "@/database/queries/habit";
import {
  dateKey,
  getMistakeWords,
  getRecentLogs,
  learningDayBounds,
} from "@/database/queries/home";
import { countReadyDue } from "@/database/queries/review";
import { useAppStore } from "@/stores/appStore";
import { useQuery } from "@tanstack/react-query";
import { useSQLiteContext } from "expo-sqlite";

/** Số liệu Home tính từ SQLite (không có API riêng, xem APP_INTEGRATION mục 8). */
export const useHomeData = () => {
  const db = useSQLiteContext();
  const settings = useAppStore((s) => s.settings);
  const dayStartHour = Number(settings?.day_start_hour ?? 4);
  const userLang = settings?.translate_language ?? "vi";
  const reviewLimit = Number(settings?.review_limit ?? 0);
  const dailyGoal = Number(settings?.daily_goal ?? 20);

  const q = useQuery({
    queryKey: ["home", dayStartHour, userLang, reviewLimit],
    queryFn: async () => {
      const [due, week, mistakes, habit] = await Promise.all([
        countReadyDue(db, userLang, dayStartHour, new Date(), reviewLimit),
        getRecentLogs(db, 7, dayStartHour),
        getMistakeWords(db),
        getHabitView(db, { dayStartHour }),
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
