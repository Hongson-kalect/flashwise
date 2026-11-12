import type { HabitReport } from "@/database/queries/habit";

/** Dòng tóm tắt streak / habit / khiên sau phiên học, vd " Chuỗi 5 ngày, habit +3%, +1 khiên." (rỗng nếu không có gì). */
export const habitLine = (h?: HabitReport) => {
  if (!h || h.streak <= 0) return "";
  const parts = [`Chuỗi ${h.streak} ngày`];
  if (h.habitDelta > 0) parts.push(`habit +${h.habitDelta}%`);
  if (h.shieldDelta > 0) parts.push(`+${h.shieldDelta} khiên`);
  return ` ${parts.join(", ")}.`;
};
