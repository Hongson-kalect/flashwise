/**
 * Lên lịch nhắc học (thuần, không đụng expo-notifications). Thay vì 1 thông báo lặp hằng ngày (không bỏ được ngày đã học xong),
 * app đặt vài thông báo một lần cho những ngày sắp tới và đặt lại mỗi khi mở app / xong phiên học: ngày đã học rồi thì bỏ giờ nhắc
 * của ngày đó; bỏ app vài ngày thì chỉ nhắc tối đa `days` lần rồi im (không làm phiền).
 */

export const REMINDER_DAYS = 3;

/** Ngày học (theo `dayStartHour`) của một thời điểm: 'YYYY-MM-DD'. */
export const learningDayOf = (d: Date, dayStartHour: number) => {
  const t = new Date(d.getTime() - dayStartHour * 3_600_000);
  return `${t.getFullYear()}-${String(t.getMonth() + 1).padStart(2, "0")}-${String(t.getDate()).padStart(2, "0")}`;
};

export interface PlanInput {
  now: Date;
  /** Giờ nhắc 0-23 (giờ máy). */
  hour: number;
  minute?: number;
  /** Ngày học hiện tại đã có học / ôn chưa: có thì không nhắc lại ngày đó. */
  studiedToday: boolean;
  dayStartHour: number;
  days?: number;
}

/** Các thời điểm cần đặt thông báo, tăng dần, tối đa `days` mốc, đều ở tương lai. */
export const planReminders = ({ now, hour, minute = 0, studiedToday, dayStartHour, days = REMINDER_DAYS }: PlanInput): Date[] => {
  const today = learningDayOf(now, dayStartHour);
  const out: Date[] = [];
  for (let offset = 0; offset < days + 2 && out.length < days; offset++) {
    const at = new Date(now);
    at.setDate(at.getDate() + offset);
    at.setHours(hour, minute, 0, 0);
    if (at.getTime() <= now.getTime() + 60_000) continue; // đã qua (hoặc sát giờ): bỏ
    if (studiedToday && learningDayOf(at, dayStartHour) === today) continue;
    out.push(at);
  }
  return out;
};

/** Giờ nhắc gợi ý ở màn chọn: [giờ, nhãn]. */
export const REMINDER_HOURS: { hour: number; label: string }[] = [
  { hour: 7, label: "Sáng · 7:00" },
  { hour: 12, label: "Trưa · 12:00" },
  { hour: 18, label: "Chiều · 18:00" },
  { hour: 20, label: "Tối · 20:00" },
  { hour: 21, label: "Khuya · 21:00" },
];

export const hourLabel = (hour: number) => `${String(hour).padStart(2, "0")}:00`;
