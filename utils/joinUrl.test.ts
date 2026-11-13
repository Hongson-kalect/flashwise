import assert from "node:assert/strict";
import { test } from "node:test";
import { joinUrl } from "./joinUrl";

test("nối URL media: thừa / thiếu dấu / đều ra đúng", () => {
  const want = "https://cdn.x/media/a/b.png";
  assert.equal(joinUrl("https://cdn.x/media", "a/b.png"), want);
  assert.equal(joinUrl("https://cdn.x/media/", "a/b.png"), want);
  assert.equal(joinUrl("https://cdn.x/media", "/a/b.png"), want);
  assert.equal(joinUrl("https://cdn.x/media//", "//a/b.png"), want);
  assert.equal(joinUrl("", "a/b.png"), "a/b.png");
});
