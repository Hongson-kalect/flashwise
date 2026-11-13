import assert from "node:assert/strict";
import { test } from "node:test";
import { needsRefresh, parseSavedAt, type LocalWord } from "./words";

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

test("mốc lưu dạng ISO có Z (ghi từ server) vẫn tính được tuổi: cũ hơn 10 phút thì làm mới", () => {
  const now = Date.now();
  const iso = (ms: number) => new Date(ms).toISOString().replace(/(\.\d{3})Z$/, "$1123Z"); // 6 chữ số lẻ như server
  assert.equal(needsRefresh(word(iso(now - 60_000)), "vi", now), false);
  const old = word(iso(now - 11 * 60_000), { id: "s2" });
  old.value = "iso-old";
  assert.equal(needsRefresh(old, "vi", now), true);
});

test("parseSavedAt: các dạng mốc thời gian", () => {
  assert.equal(parseSavedAt("2026-11-12 09:05:54"), Date.UTC(2026, 10, 12, 9, 5, 54));
  assert.equal(parseSavedAt("2026-11-12T09:05:54Z"), Date.UTC(2026, 10, 12, 9, 5, 54));
  assert.equal(parseSavedAt("2026-11-12T16:05:54+07:00"), Date.UTC(2026, 10, 12, 9, 5, 54));
  assert.ok(Number.isNaN(parseSavedAt(undefined)));
});
