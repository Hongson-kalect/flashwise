import assert from "node:assert/strict";
import { test } from "node:test";
import { addDays, applyActivity, daysBetween, dayGain, HABIT_CONFIG, HabitState, INITIAL_HABIT, nextMilestone, parseHabitState, reconcile, stateFromDays } from "./engine";

const base = (over: Partial<HabitState> = {}): HabitState => ({ ...INITIAL_HABIT, claim: [true, true, true], ...over });

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

test("không khiên: mất streak, trừ habit, retain về 0", () => {
  const s0 = base({ streak: 9, maxStreak: 9, streakDate: "2026-11-10", shield: 0, habit: 50, retain: 10, claim: [false, true, true] });
  const out = reconcile(s0, "2026-11-12"); // nghỉ 11
  assert.equal(out.state.streak, 0);
  assert.equal(out.lostStreak, 9);
  assert.equal(out.state.maxStreak, 9);
  assert.equal(out.state.habit, 50 - (HABIT_CONFIG.penaltyBase + HABIT_CONFIG.penaltyPerDay));
  assert.equal(out.state.retain, 0);
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

test("mốc habit 35 / 70 / 100 mỗi mốc +1 khiên, một lần", () => {
  let s = base({ habit: 33, streak: 1, streakDate: "2026-11-11" });
  let out = applyActivity(s, "2026-11-12", 20, 20); // +5 -> 38, qua mốc 35
  assert.equal(out.state.shield, 1);
  assert.deepEqual(out.state.claim, [false, true, true]);
  s = { ...out.state };
  out = applyActivity(s, "2026-11-13", 20, 20); // 43: không nhận lại
  assert.equal(out.state.shield, 1);
});

test("mốc nhận lại được sau khi habit tụt dưới mốc trước", () => {
  const s0 = base({ habit: 36, streak: 4, streakDate: "2026-11-01", claim: [false, true, true] });
  const lapsed = reconcile(s0, "2026-11-12"); // nghỉ 10 ngày, mất sạch habit
  assert.equal(lapsed.state.habit, 0);
  assert.deepEqual(lapsed.state.claim, [true, true, true]);
});

test("khiên tối đa 3, phần dư tính vào shieldWasted", () => {
  const out = applyActivity(base({ habit: 69, shield: 3, streak: 1, streakDate: "2026-11-11", claim: [false, true, true] }), "2026-11-12", 20, 20);
  assert.equal(out.state.shield, 3);
  assert.equal(out.state.shieldWasted, 1);
});

test("habit đầy: điểm thưởng dồn vào retain, đủ 25 thì +1 khiên", () => {
  let s = base({ habit: 100, retain: 22, shield: 0, streak: 1, streakDate: "2026-11-11", claim: [false, false, false] });
  const out = applyActivity(s, "2026-11-12", 20, 20); // +5 retain -> 27 -> 2 dư, +1 khiên
  assert.equal(out.state.habit, 100);
  assert.equal(out.state.shield, 1);
  assert.equal(out.state.retain, 2);
});

test("habit gần đầy: phần vượt 100 chuyển sang retain", () => {
  const out = applyActivity(base({ habit: 98, streak: 1, streakDate: "2026-11-11", claim: [false, false, true] }), "2026-11-12", 20, 20);
  assert.equal(out.state.habit, 100);
  assert.equal(out.state.retain, 3);
  assert.equal(out.state.shield, 1); // mốc 100
});

test("dayGain: 0 thẻ không có điểm, đạt mục tiêu là mức cao nhất", () => {
  assert.equal(dayGain(0, 20), 0);
  assert.equal(dayGain(1, 20) >= HABIT_CONFIG.gainMin, true);
  assert.equal(dayGain(999, 20), HABIT_CONFIG.gainMax);
  assert.equal(dayGain(5, 0), HABIT_CONFIG.gainMax); // mục tiêu 0 không chia cho 0
});

test("parseHabitState: JSON hỏng / thiếu / giá trị lạ về mặc định an toàn", () => {
  assert.deepEqual(parseHabitState(null), INITIAL_HABIT);
  assert.deepEqual(parseHabitState("{hỏng"), INITIAL_HABIT);
  const p = parseHabitState({ habit: 500, shield: 99, streak: -3, streakDate: "không phải ngày", claim: [1, 0] });
  assert.equal(p.habit, 100);
  assert.equal(p.shield, HABIT_CONFIG.shieldLimit);
  assert.equal(p.streak, 0);
  assert.equal(p.streakDate, null);
  assert.deepEqual(p.claim, [true, true, true]);
});

test("nextMilestone: mốc kế tiếp còn nhận được", () => {
  assert.deepEqual(nextMilestone(base({ habit: 30 })), { at: 35, remaining: 5 });
  assert.deepEqual(nextMilestone(base({ habit: 40, claim: [false, true, true] })), { at: 70, remaining: 30 });
  assert.equal(nextMilestone(base({ habit: 100, claim: [false, false, false] })), null);
});

test("stateFromDays: chuỗi liền tới hôm qua còn tính, kỷ lục lấy chuỗi dài nhất", () => {
  const days = ["2026-11-01", "2026-11-02", "2026-11-03", "2026-11-04", "2026-11-09", "2026-11-10", "2026-11-11"];
  const s = stateFromDays(days, "2026-11-12");
  assert.equal(s.streak, 3);
  assert.equal(s.maxStreak, 4);
  assert.equal(s.streakDate, "2026-11-11");
  assert.equal(s.activeDays, 7);
  assert.equal(s.habit, 0);
});

test("stateFromDays: nghỉ lâu thì streak 0 và không bị phạt ngược", () => {
  const s = stateFromDays(["2026-10-01", "2026-10-02"], "2026-11-12");
  assert.equal(s.streak, 0);
  assert.equal(s.streakDate, "2026-11-11");
  assert.equal(reconcile(s, "2026-11-12").events.length, 0);
  assert.deepEqual(stateFromDays([], "2026-11-12"), INITIAL_HABIT);
});
