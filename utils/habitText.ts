import type { HabitReport } from "@/database/queries/habit";
import { HABIT_CONFIG } from "@/habit/engine";

/** Dòng tóm tắt streak / habit / khiên sau phiên học, vd " Chuỗi 5 ngày, habit +3%, hoàn thành mục tiêu ngày (3/7 tới khiên)." (rỗng nếu không có gì). */
export const habitLine = (h?: HabitReport) => {
  if (!h || h.streak <= 0) return "";
  const parts = [`Chuỗi ${h.streak} ngày`];
  if (h.habitDelta > 0) parts.push(`habit +${h.habitDelta}%`);
  if (h.shieldDelta > 0) parts.push(`+${h.shieldDelta} khiên`);
  else if (h.stackAdded) parts.push(`hoàn thành mục tiêu ngày (${h.stack}/${HABIT_CONFIG.stacksPerShield} tới khiên)`);
  return ` ${parts.join(", ")}.`;
};
