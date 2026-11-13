import assert from "node:assert/strict";
import { test } from "node:test";
import { accountIdFromToken } from "./jwt";

const make = (payload: object) => `h.${Buffer.from(JSON.stringify(payload)).toString("base64url")}.s`;

test("lấy id tài khoản từ JWT", () => {
  assert.equal(accountIdFromToken(make({ user_id: 42 })), "42");
  assert.equal(accountIdFromToken(make({ sub: "abc" })), "abc");
  assert.equal(accountIdFromToken(make({ exp: 1 })), null);
  assert.equal(accountIdFromToken("rac.roi"), null);
  assert.equal(accountIdFromToken(null), null);
});
