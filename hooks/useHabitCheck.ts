import { trackHabit } from "@/database/queries/habit";
import { HABIT_CONFIG } from "@/habit/engine";
import { requestSync } from "@/services/sync/bus";
import { useAppStore } from "@/stores/appStore";
import useModalStore from "@/stores/modalStore";
import { useQueryClient } from "@tanstack/react-query";
import { useSQLiteContext } from "expo-sqlite";
import { useCallback, useEffect, useRef } from "react";
import { AppState } from "react-native";

/**
 * Mở app / quay lại foreground: trừ khiên hoặc habit cho các ngày nghỉ (habit/engine `reconcile`, chạy lại không phạt hai lần)
 * rồi báo người dùng: khiên đã cứu chuỗi ngày, hoặc chuỗi đã mất.
 */
export const useHabitCheck = () => {
  const db = useSQLiteContext();
  const addModal = useModalStore((s) => s.addModal);
  const queryClient = useQueryClient();
  const dayStartHour = Number(useAppStore((s) => s.settings?.day_start_hour) ?? 4);
  const ready = useAppStore((s) => !!s.settings);
  const running = useRef(false);

  const check = useCallback(async () => {
    if (running.current) return;
    running.current = true;
    try {
      const r = await trackHabit(db, { dayStartHour, activity: false });
      if (!r.changed) return;
      queryClient.invalidateQueries({ queryKey: ["home"] });
      requestSync();
      if (r.lostStreak > 0) {
        addModal({
          type: "alert",
          title: "Chuỗi ngày học đã đứt",
          message: `Bạn nghỉ ${r.missedDays} ngày và không còn đủ khiên để che, nên chuỗi ${r.lostStreak} ngày bị mất${r.habitDelta < 0 ? ` và độ bền thói quen giảm ${Math.abs(r.habitDelta)}%` : ""}.`,
          subMessage: "Học hoặc ôn một phiên hôm nay để bắt đầu chuỗi mới.",
          okText: "Học lại thôi",
        });
      } else if (r.shieldUsed > 0) {
        addModal({
          type: "alert",
          title: "Khiên đã giữ chuỗi cho bạn",
          message: `Bạn nghỉ ${r.missedDays} ngày, mình dùng ${r.shieldUsed} khiên để giữ chuỗi ${r.streak} ngày. Còn ${r.shield} khiên.`,
          subMessage: `Mỗi ngày học đủ ${HABIT_CONFIG.shieldDailyTarget} từ được 1 stack, đủ ${HABIT_CONFIG.stacksPerShield} stack đổi 1 khiên.`,
          okText: "Đã hiểu",
        });
      }
    } catch (e) {
      console.warn("[habit] không kiểm được streak:", e);
    } finally {
      running.current = false;
    }
  }, [db, dayStartHour, addModal, queryClient]);

  useEffect(() => {
    if (!ready) return;
    check();
    const sub = AppState.addEventListener("change", (s) => s === "active" && check());
    return () => sub.remove();
  }, [ready, check]);
};
