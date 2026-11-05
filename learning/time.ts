/** Cột thời gian SQLite 'YYYY-MM-DD HH:MM:SS' (UTC) <-> Date. */
export const toDbTime = (d: Date | number) => new Date(d).toISOString().replace("T", " ").slice(0, 19);

export const fromDbTime = (s: string | null | undefined): Date | null => {
  if (!s) return null;
  const d = new Date(s.includes("T") ? s : `${s.replace(" ", "T")}Z`);
  return Number.isNaN(d.getTime()) ? null : d;
};
