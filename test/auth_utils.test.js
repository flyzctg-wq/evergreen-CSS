const test = require("node:test");
const assert = require("node:assert");
const authUtils = require("../api/auth_utils");

test("verifyPassword should correctly verify valid passwords", () => {
  const password = "123456";
  const storedHash = authUtils.hashPassword(password);

  assert.strictEqual(authUtils.verifyPassword(password, storedHash), true);
});

test("verifyPassword should reject incorrect passwords", () => {
  const password = "123456";
  const wrongPassword = "654321";
  const storedHash = authUtils.hashPassword(password);

  assert.strictEqual(authUtils.verifyPassword(wrongPassword, storedHash), false);
});

test("verifyPassword should handle invalid input safely", () => {
  assert.strictEqual(authUtils.verifyPassword(null, "invalidhash"), false);
  assert.strictEqual(authUtils.verifyPassword("123456", null), false);
  assert.strictEqual(authUtils.verifyPassword("123456", "nohashcolon"), false);
  assert.strictEqual(authUtils.verifyPassword("123456", "salt:invalidhex"), false);
});
