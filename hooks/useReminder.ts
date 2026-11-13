import { askReminderPermission, getReminderPermission, ReminderPermission, rescheduleReminders } from "@/services/reminder";
import { hourLabel, REMINDER_HOURS } from "@/reminder/plan";
import { requestSync } from "@/services/sync/bus";
import { useAppStore } from "@/stores/appStore";
import useModalStore from "@/stores/modalStore";
import { toast } from "@/utils/toast";
import { useSQLiteContext } from "expo-sqlite";
import { useCallback, useEffect, useState } from "react";

const OFF = -1;
const PROMPTED_KEY = "reminder_prompted";

/**
 * Nhắc học: chọn giờ (hộp chọn một), xin quyền thông báo khi chọn giờ, lưu cài đặt và đặt lịch.
 * `promptAfterFirstSession` hỏi đúng một lần, sau phiên học / ôn đầu tiên (cờ `reminder_prompted` ở system_configs, riêng từng máy).
 */
export const useReminder = () => {
  const db = useSQLiteContext();
  const addModal = useModalStore((s) => s.addModal);
  const settings = useAppStore((s) => s.settings);
  const dbService = useAppStore((s) => s.dbService);
  const updateSetting = useAppStore((s) => s.updateSetting);

  const enabled = settings?.notification_enabled !== false;
  // Quyền thông báo là của máy: cài đặt mặc định "bật" mà chưa được cấp quyền thì chưa nhắc được
  const [permission, setPermission] = useState<ReminderPermission | null>(null);
  useEffect(() => {
    getReminderPermission().then(setPermission, () => {});
  }, [settings?.notification_enabled, settings?.study_reminder_hour]);
  const hour = Number(settings?.study_reminder_hour ?? 20);

  const save = useCallback(
    async (values: Record<string, unknown>) => {
      updateSetting(values);
      for (const [k, v] of Object.entries(values)) await dbService?.setSetting(k, v);
    },
    [dbService, updateSetting],
  );

  const apply = useCallback(
    async (picked: number) => {
      if (picked === OFF) {
        await save({ notification_enabled: false });
        await rescheduleReminders(db);
        toast.info("Đã tắt nhắc học");
        requestSync();
        return;
      }
      const granted = await askReminderPermission();
      if (!granted) {
        await save({ notification_enabled: false });
        toast.warning("Chưa có quyền thông báo nên không nhắc được. Bật thông báo cho Flashwise trong cài đặt máy rồi chọn lại giờ ở tab Cá nhân.", { long: true });
        return;
      }
      setPermission("granted");
      await save({ study_reminder_hour: picked, notification_enabled: true });
      await rescheduleReminders(db);
      toast.success(`Mình sẽ nhắc bạn lúc ${hourLabel(picked)} mỗi ngày`);
      requestSync();
    },
    [db, save],
  );

  const chooseHour = useCallback(
    (title = "Nhắc bạn học lúc mấy giờ?") => {
      addModal({
        type: "radio",
        title,
        options: [...REMINDER_HOURS.map((h) => ({ label: h.label, value: h.hour })), { label: "Không nhắc", value: OFF }],
        value: enabled && permission === "granted" ? hour : OFF,
        onSelect: (v) => apply(Number(v)),
      });
    },
    [addModal, apply, enabled, hour, permission],
  );

  const promptAfterFirstSession = useCallback(async () => {
    const done = await db.getFirstAsync(`SELECT 1 FROM system_configs WHERE key = ?`, [PROMPTED_KEY]);
    if (done) return;
    await db.runAsync(`INSERT OR REPLACE INTO system_configs (key, value) VALUES (?, '1')`, [PROMPTED_KEY]);
    chooseHour("Nhắc bạn học mỗi ngày? Chọn giờ");
  }, [db, chooseHour]);

  const active = enabled && permission === "granted";
  return { enabled: active, hour, chooseHour, promptAfterFirstSession, label: active ? hourLabel(hour) : "Chưa bật" };
};
