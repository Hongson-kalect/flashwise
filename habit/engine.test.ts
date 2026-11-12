import assert from "node:assert/strict";
import { test } from "node:test";
import { addDays, applyActivity, daysBetween, dayGain, HABIT_CONFIG, HabitState, INITIAL_HABIT, parseHabitState, reconcile, stateFromDays } from "./engine";

const base = (over: Partial<HabitState> = {}): HabitState => ({ ...INITIAL_HABIT, ...over });
const T = HABIT_CONFIG.shieldDailyTarget;
const N = HABIT_CONFIG.stacksPerShield;

test("ngày: cộng / trừ qua ranh giới tháng và năm", () => {
  assert.equal(addDays("2026-12-31", 1), "2027-01-01");
  assert.equal(addDays("2026-03-01", -1), "2026-02-28");
  assert.equal(daysBetween("2026-11-10", "2026-11-13"), 3);
});

test("ngày học đầu tiên: streak 1, habit tăng, 1 sự kiện active", () => {
  const out = applyActivity(base(), "2026-11-12", 5, 20);
  assert.equal(out.state.streak, 1);
  assert.equal(out.state.streakDate, "2026-11-12");
  assert.equal(out.state.habit, dayGain(5, 20));
  assert.equal(out.events.length, 1);
  assert.equal(out.events[0].type, "active");
});

test("nhiều phiên cùng ngày: streak chỉ +1, habit chỉ cộng phần chênh", () => {
  let s = applyActivity(base(), "2026-11-12", 5, 20).state;
  const afterFirst = s.habit;
  s = applyActivity(s, "2026-11-12", 5, 20).state; // chạy lại cùng số thẻ: không đổi
  assert.equal(s.habit, afterFirst);
  s = applyActivity(s, "2026-11-12", 20, 20).state; // đạt mục tiêu ngày
  assert.equal(s.streak, 1);
  assert.equal(s.habit, HABIT_CONFIG.gainMax);
  assert.equal(s.activeDays, 1);
});

test("học liên tiếp: streak tăng mỗi ngày", () => {
  let s = base();
  for (const d of ["2026-11-10", "2026-11-11", "2026-11-12"]) s = applyActivity(s, d, 20, 20).state;
  assert.equal(s.streak, 3);
  assert.equal(s.maxStreak, 3);
});

// ---------------------------------------------------------------- stack / khiên

test("làm ít hơn mục tiêu ngày: có streak, habit nhưng không có stack", () => {
  const out = applyActivity(base(), "2026-11-12", T - 1, 20);
  assert.equal(out.state.streak, 1);
  assert.equal(out.state.stack, 0);
  assert.equal(out.state.stackDate, null);
});

test("đủ mục tiêu ngày: +1 stack, nhiều phiên cùng ngày chỉ tính 1 stack", () => {
  let s = applyActivity(base(), "2026-11-12", T, 20).state;
  assert.equal(s.stack, 1);
  s = applyActivity(s, "2026-11-12", T + 30, 20).state;
  assert.equal(s.stack, 1);
});

test("mục tiêu đạt dần qua nhiều phiên trong ngày: stack tính khi vừa đủ", () => {
  let s = applyActivity(base(), "2026-11-12", 8, 20).state;
  assert.equal(s.stack, 0);
  s = applyActivity(s, "2026-11-12", T, 20).state;
  assert.equal(s.stack, 1);
});

test("stack không phụ thuộc cài đặt mục tiêu ngày (goal chỉ ảnh hưởng habit)", () => {
  const out = applyActivity(base(), "2026-11-12", 5, 5); // goal = 5 nên habit đủ mức, nhưng chưa đủ 20 thẻ
  assert.equal(out.state.stack, 0);
  assert.equal(out.state.habit, HABIT_CONFIG.gainMax);
});

test(`đủ ${N} ngày hoàn thành mục tiêu: +1 khiên và stack về 0`, () => {
  let s = base();
  for (let i = 0; i < N; i++) s = applyActivity(s, addDays("2026-11-01", i), T, 20).state;
  assert.equal(s.shield, 1);
  assert.equal(s.stack, 0);
  const last = applyActivity(base({ stack: N - 1, streak: 1, streakDate: "2026-11-11" }), "2026-11-12", T, 20).events.at(-1);
  assert.match(String(last?.note), /\+1 khiên/);
});

test("stack không cần liên tiếp: nghỉ giữa chừng (có khiên che) vẫn giữ stack", () => {
  let s = applyActivity(base({ shield: 2 }), "2026-11-01", T, 20).state;
  s = applyActivity(s, "2026-11-04", T, 20).state; // nghỉ 2 ngày, khiên che
  assert.equal(s.stack, 2);
  assert.equal(s.streak, 2);
});

test("stack không mất khi mất streak", () => {
  let s = applyActivity(base(), "2026-11-01", T, 20).state;
  s = applyActivity(s, "2026-11-10", T, 20).state; // nghỉ 8 ngày, không khiên
  assert.equal(s.streak, 1);
  assert.equal(s.stack, 2);
});

test("khiên tối đa 3, khiên thừa tính vào shieldWasted", () => {
  const out = applyActivity(base({ shield: 3, stack: N - 1, streak: 1, streakDate: "2026-11-11" }), "2026-11-12", T, 20);
  assert.equal(out.state.shield, 3);
  assert.equal(out.state.shieldWasted, 1);
  assert.equal(out.state.stack, 0);
});

test("habit đầy thì dừng ở 100", () => {
  const out = applyActivity(base({ habit: 98, streak: 1, streakDate: "2026-11-11" }), "2026-11-12", 20, 20);
  assert.equal(out.state.habit, 100);
});

// ---------------------------------------------------------------- nghỉ

test("nghỉ 2 ngày, có 3 khiên: trừ 2 khiên, streak giữ, ghi ngày khiên che", () => {
  const s0 = base({ streak: 4, maxStreak: 4, streakDate: "2026-11-10", shield: 3, habit: 20 });
  const out = reconcile(s0, "2026-11-13"); // nghỉ 11, 12
  assert.equal(out.state.shield, 1);
  assert.equal(out.state.streak, 4);
  assert.equal(out.state.habit, 20);
  assert.equal(out.state.streakDate, "2026-11-12");
  assert.deepEqual(out.coveredDates, ["2026-11-11", "2026-11-12"]);
  assert.equal(out.events[0].type, "shield");
  assert.equal(out.events[0].shieldDelta, -2);
});

test("reconcile chạy lại cùng ngày không đổi gì (không trừ hai lần)", () => {
  const s0 = base({ streak: 4, streakDate: "2026-11-10", shield: 3 });
  const once = reconcile(s0, "2026-11-13");
  const twice = reconcile(once.state, "2026-11-13");
  assert.deepEqual(twice.state, once.state);
  assert.equal(twice.events.length, 0);
});

test("hôm qua có học, hôm nay chưa học: không phạt", () => {
  const out = reconcile(base({ streak: 2, streakDate: "2026-11-11", shield: 1 }), "2026-11-12");
  assert.equal(out.events.length, 0);
  assert.equal(out.state.shield, 1);
});

test("không khiên: mất streak, trừ habit, giữ kỷ lục", () => {
  const s0 = base({ streak: 9, maxStreak: 9, streakDate: "2026-11-10", shield: 0, habit: 50 });
  const out = reconcile(s0, "2026-11-12"); // nghỉ 11
  assert.equal(out.state.streak, 0);
  assert.equal(out.lostStreak, 9);
  assert.equal(out.state.maxStreak, 9);
  assert.equal(out.state.habit, 50 - (HABIT_CONFIG.penaltyBase + HABIT_CONFIG.penaltyPerDay));
  assert.equal(out.events[0].type, "lapse");
  assert.deepEqual(out.coveredDates, []);
});

test("thiếu khiên: dùng hết khiên còn lại, phần thiếu trừ habit (như Fastfast)", () => {
  const s0 = base({ streak: 5, streakDate: "2026-11-10", shield: 1, habit: 40 });
  const out = reconcile(s0, "2026-11-14"); // nghỉ 11, 12, 13: 1 khiên che, thiếu 2
  assert.equal(out.state.shield, 0);
  assert.equal(out.state.streak, 0);
  assert.equal(out.state.habit, 40 - (HABIT_CONFIG.penaltyBase + 2 * HABIT_CONFIG.penaltyPerDay));
});

test("habit không xuống dưới 0", () => {
  const out = reconcile(base({ streak: 3, streakDate: "2026-11-01", habit: 3 }), "2026-11-20");
  assert.equal(out.state.habit, 0);
});

test("sau khi mất streak, học lại thì streak bắt đầu lại từ 1", () => {
  const lapsed = reconcile(base({ streak: 9, streakDate: "2026-11-10" }), "2026-11-15").state;
  const out = applyActivity(lapsed, "2026-11-15", 10, 20);
  assert.equal(out.state.streak, 1);
});

test("nghỉ nhiều ngày rồi mở app và học trong cùng lượt: trừ trước, cộng sau", () => {
  const s0 = base({ streak: 5, streakDate: "2026-11-10", shield: 0, habit: 30 });
  const out = applyActivity(s0, "2026-11-13", 20, 20);
  assert.equal(out.events[0].type, "lapse");
  assert.equal(out.state.streak, 1);
  assert.equal(out.lostStreak, 5);
  assert.ok(out.state.habit < 30 + HABIT_CONFIG.gainMax);
});

test("dayGain: 0 thẻ không có điểm, đạt mục tiêu là mức cao nhất", () => {
  assert.equal(dayGain(0, 20), 0);
  assert.equal(dayGain(1, 20) >= HABIT_CONFIG.gainMin, true);
  assert.equal(dayGain(999, 20), HABIT_CONFIG.gainMax);
  assert.equal(dayGain(5, 0), HABIT_CONFIG.gainMax); // mục tiêu 0 không chia cho 0
});

// ---------------------------------------------------------------- lưu / dựng lại

test("parseHabitState: JSON hỏng / thiếu / giá trị lạ về mặc định an toàn, bỏ trường cũ", () => {
  assert.deepEqual(parseHabitState(null), INITIAL_HABIT);
  assert.deepEqual(parseHabitState("{hỏng"), INITIAL_HABIT);
  const p = parseHabitState({ habit: 500, shield: 99, stack: 99, streak: -3, streakDate: "không phải ngày", claim: [true], retain: 20 });
  assert.equal(p.habit, 100);
  assert.equal(p.shield, HABIT_CONFIG.shieldLimit);
  assert.equal(p.stack, N - 1);
  assert.equal(p.streak, 0);
  assert.equal(p.streakDate, null);
  assert.ok(!("claim" in p) && !("retain" in p));
});

test("stateFromDays: chuỗi liền tới hôm qua còn tính, kỷ lục lấy chuỗi dài nhất", () => {
  const days = ["2026-11-01", "2026-11-02", "2026-11-03", "2026-11-04", "2026-11-09", "2026-11-10", "2026-11-11"];
  const s = stateFromDays(days, "2026-11-12");
  assert.equal(s.streak, 3);
  assert.equal(s.maxStreak, 4);
  assert.equal(s.streakDate, "2026-11-11");
  assert.equal(s.activeDays, 7);
  assert.equal(s.habit, 0);
  assert.equal(s.stack, 0);
});

test("stateFromDays: nghỉ lâu thì streak 0 và không bị phạt ngược", () => {
  const s = stateFromDays(["2026-10-01", "2026-10-02"], "2026-11-12");
  assert.equal(s.streak, 0);
  assert.equal(s.streakDate, "2026-11-11");
  assert.equal(reconcile(s, "2026-11-12").events.length, 0);
  assert.deepEqual(stateFromDays([], "2026-11-12"), INITIAL_HABIT);
});
