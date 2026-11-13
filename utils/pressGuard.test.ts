import assert from "node:assert/strict";
import { mock, test } from "node:test";
import { createPressGuard } from "./pressGuard";

const deferred = () => {
  let resolve!: () => void;
  let reject!: (e: unknown) => void;
  const promise = new Promise<void>((res, rej) => ((resolve = res), (reject = rej)));
  return { promise, resolve, reject };
};

test("hàm async: bị chặn tới khi Promise xong, rồi bấm lại được", async () => {
  const busy: boolean[] = [];
  const g = createPressGuard({ onBusyChange: (b) => busy.push(b) });
  const d = deferred();
  let calls = 0;
  const fn = () => (calls++, d.promise);
  assert.equal(g.run(fn), true);
  assert.equal(g.run(fn), false);
  assert.equal(g.run(fn), false);
  assert.equal(calls, 1);
  d.resolve();
  await d.promise;
  await Promise.resolve();
  assert.equal(g.run(() => calls++), true);
  assert.equal(calls, 2);
  assert.deepEqual(busy, [true, false]);
});

test("Promise lỗi vẫn mở khoá", async () => {
  const g = createPressGuard();
  const warn = mock.method(console, "warn", () => {});
  const d = deferred();
  g.run(() => d.promise);
  d.reject(new Error("x"));
  await d.promise.catch(() => {});
  await Promise.resolve();
  assert.equal(g.isLocked(), false);
  assert.equal(warn.mock.callCount(), 1);
  warn.mock.restore();
});

test("hàm đồng bộ: khoá trong cooldown rồi mở", () => {
  mock.timers.enable({ apis: ["setTimeout"] });
  try {
    const g = createPressGuard({ cooldownMs: 400 });
    let calls = 0;
    assert.equal(g.run(() => calls++), true);
    assert.equal(g.run(() => calls++), false);
    mock.timers.tick(399);
    assert.equal(g.run(() => calls++), false);
    mock.timers.tick(1);
    assert.equal(g.run(() => calls++), true);
    assert.equal(calls, 2);
  } finally {
    mock.timers.reset();
  }
});

test("không cooldown: hàm đồng bộ không khoá", () => {
  const g = createPressGuard();
  let calls = 0;
  g.run(() => calls++);
  g.run(() => calls++);
  assert.equal(calls, 2);
});

test("hàm ném lỗi đồng bộ: mở khoá và ném tiếp", () => {
  const g = createPressGuard({ cooldownMs: 400 });
  assert.throws(() => g.run(() => { throw new Error("boom"); }));
  assert.equal(g.isLocked(), false);
});

test("Promise bị từ chối: gọi onError và mở khoá", async () => {
  const warn = mock.method(console, "warn", () => {});
  try {
    const errors: unknown[] = [];
    const g = createPressGuard({ onError: (e) => errors.push(e) });
    g.run(() => Promise.reject(new Error("hỏng")));
    await new Promise((r) => setTimeout(r, 0));
    assert.equal(errors.length, 1);
    assert.equal(g.isLocked(), false);
  } finally {
    warn.mock.restore();
  }
});
