import assert from "node:assert/strict";
import { test } from "node:test";
import { hourLabel, learningDayOf, planReminders } from "./plan";

const at = (s: string) => new Date(s); // giờ máy

test("chưa học, giờ nhắc còn ở phía trước: nhắc hôm nay rồi 2 ngày kế", () => {
  const out = planReminders({ now: at("2026-11-12T09:00:00"), hour: 20, studiedToday: false, dayStartHour: 4 });
  assert.deepEqual(out.map((d) => d.toISOString()), [at("2026-11-12T20:00:00"), at("2026-11-13T20:00:00"), at("2026-11-14T20:00:00")].map((d) => d.toISOString()));
});

test("đã học hôm nay: bỏ nhắc hôm nay, vẫn đủ 3 mốc sau", () => {
  const out = planReminders({ now: at("2026-11-12T09:00:00"), hour: 20, studiedToday: true, dayStartHour: 4 });
  assert.equal(out.length, 3);
  assert.equal(out[0].getDate(), 13);
});

test("giờ nhắc hôm nay đã qua: bắt đầu từ ngày mai", () => {
  const out = planReminders({ now: at("2026-11-12T21:30:00"), hour: 20, studiedToday: false, dayStartHour: 4 });
  assert.equal(out.length, 3);
  assert.equal(out[0].getDate(), 13);
});

test("ngày học bắt đầu lúc 4h: 2h sáng vẫn thuộc ngày hôm trước, học xong thì không nhắc 20h cùng ngày lịch", () => {
  assert.equal(learningDayOf(at("2026-11-12T02:00:00"), 4), "2026-11-11");
  const out = planReminders({ now: at("2026-11-12T02:00:00"), hour: 20, studiedToday: true, dayStartHour: 4 });
  // ngày học hiện tại là 11-11; 20:00 ngày 12 thuộc ngày học 11-12 nên vẫn nhắc
  assert.equal(out[0].getDate(), 12);
});

test("giờ nhắc sáng sớm trước giờ bắt đầu ngày học thuộc ngày học trước đó", () => {
  // 03:00 ngày 13 thuộc ngày học 12: nếu đã học ngày 12 thì bỏ
  const now = at("2026-11-12T10:00:00");
  const out = planReminders({ now, hour: 3, studiedToday: true, dayStartHour: 4 });
  assert.ok(out.every((d) => d.getDate() !== 13));
});

test("sát giờ nhắc (dưới 1 phút) thì bỏ mốc đó", () => {
  const out = planReminders({ now: at("2026-11-12T19:59:30"), hour: 20, studiedToday: false, dayStartHour: 4 });
  assert.equal(out[0].getDate(), 13);
});

test("số mốc theo days và luôn tăng dần", () => {
  const out = planReminders({ now: at("2026-11-12T09:00:00"), hour: 7, studiedToday: false, dayStartHour: 4, days: 5 });
  assert.equal(out.length, 5);
  for (let i = 1; i < out.length; i++) assert.ok(out[i] > out[i - 1]);
});

test("hourLabel", () => {
  assert.equal(hourLabel(7), "07:00");
  assert.equal(hourLabel(20), "20:00");
});
