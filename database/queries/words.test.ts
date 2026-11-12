import assert from "node:assert/strict";
import { test } from "node:test";
import { needsRefresh, type LocalWord } from "./words";

const word = (updated_at: string, extra: Record<string, any> = {}): LocalWord => ({
  id: "w1",
  value: "house",
  language_code: "en",
  updated_at,
  senses: {
    s1: { id: "s1", quality_status: "refined", image_preview: "img.webp", contents: { definition: { en: { value: "x" }, vi: { value: "y" } } }, ...extra },
  },
});
const utc = (ms: number) => new Date(ms).toISOString().slice(0, 19).replace("T", " ");

test("bản lưu mới và đủ dữ liệu: không hỏi lại server", () => {
  const now = Date.now();
  assert.equal(needsRefresh(word(utc(now - 60_000)), "vi", now), false);
});

test("bản lưu cũ hơn 10 phút: làm mới nền, rồi cooldown chặn lần kế", () => {
  const now = Date.now();
  const old = word(utc(now - 11 * 60_000));
  assert.equal(needsRefresh(old, "vi", now), true);
  assert.equal(needsRefresh(old, "vi", now + 1000), false);
});

test("thiếu ảnh / thiếu dịch vẫn làm mới dù bản lưu mới", () => {
  const now = Date.now();
  assert.equal(needsRefresh({ ...word(utc(now)), value: "noimg" , senses: { s1: { id: "s1", quality_status: "refined", contents: { definition: { en: {}, vi: {} } } } } }, "vi", now), true);
});
