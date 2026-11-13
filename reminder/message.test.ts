import assert from "node:assert/strict";
import { test } from "node:test";
import { buildReminderMessage, REVIEW_ROUTE } from "./message";

test("có thẻ đến hạn: nói số thẻ và mở thẳng màn ôn", () => {
  const m = buildReminderMessage({ due: 12, streak: 0, atRisk: false });
  assert.match(m.body, /12 thẻ/);
  assert.equal(m.route, REVIEW_ROUTE);
  assert.match(buildReminderMessage({ due: 1, streak: 0, atRisk: false }).body, /1 thẻ/);
});

test("chuỗi sắp đứt (chưa học hôm nay): nói số ngày chuỗi", () => {
  const m = buildReminderMessage({ due: 5, streak: 7, atRisk: true });
  assert.match(m.title, /7 ngày/);
  assert.equal(m.route, REVIEW_ROUTE);
  const none = buildReminderMessage({ due: 0, streak: 7, atRisk: true });
  assert.match(none.body, /từ mới/);
  assert.equal(none.route, null);
});

test("chuỗi 1 ngày hoặc đã học: không dọa đứt chuỗi", () => {
  assert.doesNotMatch(buildReminderMessage({ due: 0, streak: 1, atRisk: true }).title, /đứt/);
  assert.doesNotMatch(buildReminderMessage({ due: 3, streak: 9, atRisk: false }).title, /đứt/);
});

test("không có thẻ: gợi ý học từ mới, chạm chỉ mở app", () => {
  const m = buildReminderMessage({ due: 0, streak: 0, atRisk: false });
  assert.equal(m.route, null);
  assert.match(m.body, /từ mới/);
});
