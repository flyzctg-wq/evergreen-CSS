const test = require("node:test");
const assert = require("node:assert");
const authUtils = require("../api/auth_utils");

test("validatePassword correctly validates 6-digit numeric passcodes", () => {
  assert.strictEqual(authUtils.validatePassword("123456"), null);
  assert.strictEqual(authUtils.validatePassword("12345"), "Password must be exactly 6 digits.");
  assert.strictEqual(authUtils.validatePassword("abcdef"), "Password must be exactly 6 digits.");
});

test("verifyPassword succeeds with correct password and fails with incorrect password", () => {
  const hash = authUtils.hashPassword("123456");
  assert.strictEqual(authUtils.verifyPassword("123456", hash), true);
  assert.strictEqual(authUtils.verifyPassword("654321", hash), false);
  assert.strictEqual(authUtils.verifyPassword("123456", "invalidhashformat"), false);
});
