import { rescheduleReminders } from "@/services/reminder";
import { useAppStore } from "@/stores/appStore";
import { useSQLiteContext } from "expo-sqlite";
import { useEffect } from "react";
import { AppState } from "react-native";

/** Mở app / về foreground: đặt lại lịch nhắc học (bỏ giờ nhắc của ngày đã học xong, bù các ngày sắp tới). */
export const useReminderSync = () => {
  const db = useSQLiteContext();
  const ready = useAppStore((s) => !!s.settings);

  useEffect(() => {
    if (!ready) return;
    const run = () => rescheduleReminders(db).catch((e) => console.warn("[reminder] không đặt được lịch:", e));
    run();
    const sub = AppState.addEventListener("change", (s) => s === "active" && run());
    return () => sub.remove();
  }, [db, ready]);
};
