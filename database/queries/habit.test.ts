import assert from "node:assert/strict";
import { DatabaseSync } from "node:sqlite";
import { beforeEach, test } from "node:test";
import { generateSchema, generateSeedData } from "../schema/ddl";
import { getHabitSeries, getHabitView, loadHabitState, trackHabit } from "./habit";

let raw: DatabaseSync;
const db = (): any => ({
  getAllAsync: async (sql: string, params: any[] = []) => raw.prepare(sql).all(...params) as any,
  getFirstAsync: async (sql: string, params: any[] = []) => (raw.prepare(sql).get(...params) as any) ?? null,
  runAsync: async (sql: string, params: any[] = []) => raw.prepare(sql).run(...params) as any,
});

/** Giờ máy 12:00 của ngày YYYY-MM-DD (dayStartHour = 4 nên thuộc ngày đó). */
const at = (day: string) => new Date(`${day}T12:00:00`);
const study = async (day: string, items: number) => {
  raw.prepare(`INSERT INTO day_learn_log (id, date, words_learned, xp_earned) VALUES (?, ?, ?, ?) ON CONFLICT(date) DO UPDATE SET words_learned = excluded.words_learned, xp_earned = excluded.xp_earned`).run(`id-${day}`, day, items, items * 10);
  return trackHabit(db(), { dayStartHour: 4, activity: true, now: at(day) });
};

beforeEach(() => {
  raw = new DatabaseSync(":memory:");
  raw.exec(generateSchema);
  raw.exec(generateSeedData);
});

test("học 3 ngày liên tiếp: streak, habit, profile và nhật ký", async () => {
  for (const d of ["2026-11-10", "2026-11-11", "2026-11-12"]) await study(d, 20);
  const s = await loadHabitState(db());
  assert.equal(s.streak, 3);
  assert.equal(s.habit, 15);
  const p = raw.prepare("SELECT current_streak, max_streak, total_xp FROM user_profile").get() as any;
  assert.deepEqual({ ...p }, { current_streak: 3, max_streak: 3, total_xp: 600 });
  assert.equal((raw.prepare("SELECT COUNT(*) n FROM habit_log WHERE type = 'active'").get() as any).n, 3);
});

test("nghỉ 1 ngày có khiên: ghi dòng day_learn_log is_shield, streak giữ", async () => {
  // dựng 40 ngày học để có khiên từ mốc 35%
  let d = new Date("2026-09-01T12:00:00");
  for (let i = 0; i < 8; i++, d = new Date(d.getTime() + 86_400_000)) await study(d.toISOString().slice(0, 10), 20);
  const before = await loadHabitState(db());
  assert.equal(before.shield, 1); // 8 ngày x 5 = 40 qua mốc 35
  const last = before.streakDate!;
  const resume = new Date(new Date(`${last}T12:00:00`).getTime() + 2 * 86_400_000).toISOString().slice(0, 10); // nghỉ 1 ngày
  const r = await trackHabit(db(), { dayStartHour: 4, activity: false, now: at(resume) });
  assert.equal(r.shieldUsed, 1);
  assert.equal(r.lostStreak, 0);
  const shielded = raw.prepare("SELECT date FROM day_learn_log WHERE is_shield = 1").all() as any[];
  assert.equal(shielded.length, 1);
  assert.equal((await loadHabitState(db())).streak, before.streak);
});

test("mở app lại cùng ngày không trừ lần hai", async () => {
  await study("2026-11-01", 20);
  const first = await trackHabit(db(), { dayStartHour: 4, activity: false, now: at("2026-11-05") });
  assert.equal(first.lostStreak, 1);
  const logs = (raw.prepare("SELECT COUNT(*) n FROM habit_log").get() as any).n;
  const again = await trackHabit(db(), { dayStartHour: 4, activity: false, now: at("2026-11-05") });
  assert.equal(again.changed, false);
  assert.equal((raw.prepare("SELECT COUNT(*) n FROM habit_log").get() as any).n, logs);
});

test("nghỉ không khiên: mất streak, habit giảm, không có dòng is_shield", async () => {
  await study("2026-11-01", 20);
  const r = await trackHabit(db(), { dayStartHour: 4, activity: false, now: at("2026-11-04") });
  assert.equal(r.lostStreak, 1);
  assert.equal(r.habit, 0);
  assert.equal((raw.prepare("SELECT COUNT(*) n FROM day_learn_log WHERE is_shield = 1").get() as any).n, 0);
  assert.equal((await loadHabitState(db())).streak, 0);
});

test("nhiều phiên cùng ngày: streak +1 một lần, habit theo tổng thẻ trong ngày", async () => {
  await study("2026-11-10", 4);
  const a = (await loadHabitState(db())).habit;
  await study("2026-11-10", 20);
  const s = await loadHabitState(db());
  assert.equal(s.streak, 1);
  assert.ok(s.habit > a);
  assert.equal(s.habit, 5);
});

test("ngày học bắt đầu lúc 4h: 2h sáng vẫn thuộc ngày hôm trước", async () => {
  await trackHabit(db(), { dayStartHour: 4, activity: true, now: new Date("2026-11-11T02:00:00") });
  assert.equal((await loadHabitState(db())).streakDate, "2026-11-10");
});

test("getHabitView: trả state, nhật ký mới trước và tổng XP", async () => {
  await study("2026-11-10", 20);
  await study("2026-11-11", 20);
  const v = await getHabitView(db(), { dayStartHour: 4 });
  assert.equal(v.state.streak, 2);
  assert.equal(v.recent[0].log_date, "2026-11-11");
  assert.equal(v.totalXp, 400);
});

test("người đã học từ trước khi có tính năng: dựng streak từ day_learn_log, không phạt", async () => {
  for (const d of ["2026-11-08", "2026-11-09", "2026-11-10"]) raw.prepare(`INSERT INTO day_learn_log (id, date, words_learned) VALUES (?, ?, 9)`).run(d, d);
  const r = await trackHabit(db(), { dayStartHour: 4, activity: false, now: at("2026-11-11") });
  assert.equal(r.streak, 3);
  assert.equal(r.lostStreak, 0);
  assert.ok(raw.prepare("SELECT 1 FROM user_settings WHERE key = 'habit_state'").get(), "state được lưu ngay lần đầu");
  const after = await study("2026-11-11", 20);
  assert.equal(after.streak, 4);
});

test("getHabitSeries: giữ giá trị ngày không có sự kiện, đánh dấu ngày mất streak, điểm cuối là habit hiện tại", async () => {
  await study("2026-11-01", 20); // habit 5
  await study("2026-11-02", 20); // habit 10
  await trackHabit(db(), { dayStartHour: 4, activity: false, now: at("2026-11-06") }); // nghỉ 3 ngày, không khiên: lapse ghi ở 11-05
  const series = await getHabitSeries(db(), "2026-11-06", 7, (await loadHabitState(db())).habit);
  assert.equal(series.length, 7);
  assert.equal(series[0].date, "2026-10-31");
  assert.equal(series[0].habit, 0);
  assert.equal(series[1].habit, 5);
  assert.equal(series[2].habit, 10);
  assert.equal(series[3].habit, 10); // 11-03 không có sự kiện: giữ
  const lapse = series.find((p) => p.mark === "lapse");
  assert.equal(lapse?.date, "2026-11-05");
  assert.equal(series[6].habit, (await loadHabitState(db())).habit);
  assert.equal(series[1].items, 20);
});
