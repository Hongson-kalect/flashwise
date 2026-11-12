import { dateKey, learningDayBounds } from "@/database/queries/home";
import { planReminders } from "@/reminder/plan";
import * as Notifications from "expo-notifications";
import { SQLiteDatabase } from "expo-sqlite";
import { Platform } from "react-native";

/**
 * Nhắc học bằng thông báo cục bộ (expo-notifications, không cần server). Lịch do `reminder/plan.ts` tính: vài thông báo một lần cho
 * những ngày sắp tới, đặt lại mỗi khi mở app / xong phiên học (ngày đã học rồi thì bỏ giờ nhắc của ngày đó).
 * Giờ nhắc ở user_settings `study_reminder_hour`, bật / tắt ở `notification_enabled` (đồng bộ); quyền thông báo là của từng máy.
 */

const PREFIX = "study-reminder-";
const CHANNEL = "study-reminder";

type Db = Pick<SQLiteDatabase, "getFirstAsync" | "getAllAsync">;

export type ReminderPermission = "granted" | "denied" | "undetermined";

export const getReminderPermission = async (): Promise<ReminderPermission> => {
  const p = await Notifications.getPermissionsAsync();
  return p.granted ? "granted" : p.status === "denied" ? "denied" : "undetermined";
};

/** Xin quyền thông báo (hiện hộp xin quyền của hệ điều hành nếu còn xin được). Trả true nếu đã được cấp. */
export const askReminderPermission = async (): Promise<boolean> => {
  const cur = await Notifications.getPermissionsAsync();
  if (cur.granted) return true;
  if (!cur.canAskAgain) return false;
  const res = await Notifications.requestPermissionsAsync();
  return res.granted;
};

const ensureChannel = async () => {
  if (Platform.OS !== "android") return;
  await Notifications.setNotificationChannelAsync(CHANNEL, {
    name: "Nhắc học",
    importance: Notifications.AndroidImportance.DEFAULT,
  });
};

export const cancelReminders = async () => {
  const all = await Notifications.getAllScheduledNotificationsAsync();
  await Promise.all(all.filter((n) => n.identifier.startsWith(PREFIX)).map((n) => Notifications.cancelScheduledNotificationAsync(n.identifier)));
};

const setting = async (db: Db, key: string) => {
  const row = await db.getFirstAsync<{ value: string }>(`SELECT value FROM user_settings WHERE key = ?`, [key]);
  if (!row) return undefined;
  try {
    return JSON.parse(row.value);
  } catch {
    return row.value;
  }
};

/** Ngày học hiện tại đã có học / ôn chưa. */
const studiedToday = async (db: Db, dayStartHour: number, now: Date) => {
  const day = dateKey(learningDayBounds(dayStartHour, now).start);
  const r = await db.getFirstAsync<{ n: number }>(`SELECT COALESCE(words_learned, 0) + COALESCE(words_relearned, 0) AS n FROM day_learn_log WHERE date = ?`, [day]);
  return (r?.n ?? 0) > 0;
};

/** Đặt lại các thông báo nhắc học theo cài đặt hiện tại (tắt / chưa có quyền thì chỉ xoá). Trả số thông báo đã đặt. */
export const rescheduleReminders = async (db: Db, now = new Date()): Promise<number> => {
  await cancelReminders();
  const enabled = (await setting(db, "notification_enabled")) !== false;
  if (!enabled || (await getReminderPermission()) !== "granted") return 0;

  const hour = Number(await setting(db, "study_reminder_hour"));
  const dayStartHour = Number((await setting(db, "day_start_hour")) ?? 4);
  if (!Number.isFinite(hour) || hour < 0 || hour > 23) return 0;

  await ensureChannel();
  const times = planReminders({ now, hour, studiedToday: await studiedToday(db, dayStartHour, now), dayStartHour });
  for (const at of times) {
    await Notifications.scheduleNotificationAsync({
      identifier: `${PREFIX}${dateKey(at)}`,
      content: { title: "Đến giờ học từ vựng rồi", body: "Ôn vài từ để giữ chuỗi ngày học của bạn." },
      trigger: { type: Notifications.SchedulableTriggerInputTypes.DATE, date: at, channelId: CHANNEL },
    });
  }
  return times.length;
};
