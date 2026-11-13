import { rescheduleReminders } from "@/services/reminder";
import { useAppStore } from "@/stores/appStore";
import { useSQLiteContext } from "expo-sqlite";
import * as Notifications from "expo-notifications";
import { router } from "expo-router";
import { useEffect, useRef } from "react";
import { AppState } from "react-native";

/** Mở app / về foreground: đặt lại lịch nhắc học (bỏ giờ nhắc của ngày đã học xong, bù các ngày sắp tới). */
export const useReminderSync = () => {
  const db = useSQLiteContext();
  const ready = useAppStore((s) => !!s.settings);

  // Chạm thông báo (kể cả mở app nguội từ thông báo): có thẻ cần ôn thì vào thẳng màn ôn (`data.route` do reminder/message.ts đặt)
  const last = Notifications.useLastNotificationResponse();
  const handled = useRef<string | null>(null);
  useEffect(() => {
    if (!ready || !last) return;
    const id = `${last.notification.request.identifier}:${last.notification.date}`;
    if (handled.current === id) return;
    handled.current = id;
    const route = (last.notification.request.content.data as { route?: string | null } | undefined)?.route;
    if (route) router.push(route as any);
  }, [last, ready]);

  useEffect(() => {
    if (!ready) return;
    const run = () => rescheduleReminders(db).catch((e) => console.warn("[reminder] không đặt được lịch:", e));
    run();
    const sub = AppState.addEventListener("change", (s) => s === "active" && run());
    return () => sub.remove();
  }, [db, ready]);
};
