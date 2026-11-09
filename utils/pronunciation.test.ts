import assert from "node:assert/strict";
import { test } from "node:test";
import { hasRoman, pronunciationOf } from "./pronunciation";

test("zh / ko hiện roman, bỏ qua value", () => {
  assert.equal(pronunciationOf([{ label: "READING", value: "yínháng", roman: "yínháng" }], "zh"), "yínháng");
  assert.equal(pronunciationOf([{ label: "READING", value: "학교", roman: "hakgyo" }], "ko"), "hakgyo");
});

test("ja hiện kana kèm roman, không lặp khi value đã là roman", () => {
  assert.equal(pronunciationOf([{ value: "ねこ", roman: "neko" }], "ja"), "ねこ · neko");
  assert.equal(pronunciationOf([{ value: "neko", roman: "neko" }], "ja"), "neko");
});

test("ngôn ngữ khác hoặc thiếu roman thì dùng value (IPA)", () => {
  assert.equal(pronunciationOf([{ label: "US", value: "/bæŋk/" }], "en"), "/bæŋk/");
  assert.equal(pronunciationOf([{ value: "/hak.k͈jo/" }], "ko"), "/hak.k͈jo/");
  assert.equal(pronunciationOf([{ roman: "yínháng" }], "en"), "");
});

test("không biết ngôn ngữ thì vẫn ưu tiên roman nếu có", () => {
  assert.equal(pronunciationOf([{ value: "학교", roman: "hakgyo" }]), "hakgyo");
  assert.equal(pronunciationOf([{ value: "/bæŋk/" }]), "/bæŋk/");
});

test("dữ liệu lạ không làm hỏng", () => {
  assert.equal(pronunciationOf(null, "zh"), "");
  assert.equal(pronunciationOf("[]", "zh"), "");
  assert.equal(pronunciationOf([null, {}], "zh"), "");
  assert.equal(hasRoman("zh-CN"), true);
  assert.equal(hasRoman("vi"), false);
});
