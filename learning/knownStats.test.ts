import assert from "node:assert/strict";
import { test } from "node:test";
import { claimAccuracy, LearnedRow, shouldAutoKnown, tallyBands } from "./knownStats";

const rows = (level: string, mode: string, n: number, next: number | null): LearnedRow[] =>
  Array.from({ length: n }, () => ({ level, mode, next_rating: next }));

test("tallyBands: gom theo mức, thẻ tự đánh dấu tách riêng, chưa kiểm tra thì không tính đúng / sai", () => {
  const bands = tallyBands([
    ...rows("b1", "learn:known", 3, 3),
    ...rows("B1", "learn:known", 1, 1),
    ...rows("B1", "learn:known", 1, null),
    ...rows("B1", "learn:normal", 2, 3),
    ...rows("B1", "learn:known_auto", 2, 3),
    ...rows("B1", "learn:known_auto", 1, 1),
    ...rows(" ", "learn:known", 1, 3),
  ]);
  const b1 = bands.get("B1")!;
  assert.deepEqual([b1.decided, b1.claims, b1.verifiedOk, b1.verifiedBad, b1.autoOk, b1.autoBad], [7, 5, 3, 1, 2, 1]);
  assert.equal(bands.get("?")!.claims, 1);
});

test("shouldAutoKnown: cần học đủ nhiều, khai gần hết, kiểm tra đúng gần hết", () => {
  const ok = tallyBands([...rows("A1", "learn:known", 10, 3), ...rows("A1", "learn:normal", 1, 3)]).get("A1");
  assert.equal(shouldAutoKnown(ok), true);

  assert.equal(shouldAutoKnown(tallyBands(rows("A1", "learn:known", 9, 3)).get("A1")), false, "chưa đủ 10 từ");
  assert.equal(shouldAutoKnown(tallyBands([...rows("A1", "learn:known", 8, 3), ...rows("A1", "learn:normal", 4, 3)]).get("A1")), false, "khai dưới 80%");
  assert.equal(shouldAutoKnown(tallyBands(rows("A1", "learn:known", 12, null)).get("A1")), false, "chưa được kiểm tra");
  assert.equal(shouldAutoKnown(tallyBands([...rows("A1", "learn:known", 6, 3), ...rows("A1", "learn:known", 6, 1)]).get("A1")), false, "khai nhầm nhiều");
  assert.equal(shouldAutoKnown(undefined), false);
});

test("shouldAutoKnown: mức không rõ không bao giờ tự bỏ qua", () => {
  assert.equal(shouldAutoKnown(tallyBands(rows("", "learn:known", 20, 3)).get("?")), false);
});

test("shouldAutoKnown: tự bỏ qua mà kiểm tra sai nhiều thì tắt lại", () => {
  const base = rows("A2", "learn:known", 12, 3);
  assert.equal(shouldAutoKnown(tallyBands([...base, ...rows("A2", "learn:known_auto", 4, 1)]).get("A2")), true, "mới 4 lần kiểm tra, chưa kết luận");
  assert.equal(shouldAutoKnown(tallyBands([...base, ...rows("A2", "learn:known_auto", 4, 3), ...rows("A2", "learn:known_auto", 2, 1)]).get("A2")), false);
  assert.equal(shouldAutoKnown(tallyBands([...base, ...rows("A2", "learn:known_auto", 9, 3), ...rows("A2", "learn:known_auto", 1, 1)]).get("A2")), true);
});

test("claimAccuracy: null khi chưa đủ lượt kiểm tra", () => {
  assert.equal(claimAccuracy(tallyBands(rows("A1", "learn:known", 4, 3)).values()), null);
  assert.equal(claimAccuracy(tallyBands([...rows("A1", "learn:known", 3, 3), ...rows("B1", "learn:known", 2, 1)]).values()), 0.6);
});
