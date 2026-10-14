const test = require("node:test");
const assert = require("node:assert/strict");
const { validatePassword, hashPassword, verifyPassword } = require("../api/auth_utils");

test("validatePassword accepts 6-digit passcode", () => {
  const result = validatePassword("123456");
  assert.equal(result, null);
});

test("validatePassword rejects non-6-digit passcodes", () => {
  assert.equal(validatePassword("12345"), "Password must be exactly 6 digits.");
  assert.equal(validatePassword("1234567"), "Password must be exactly 6 digits.");
  assert.equal(validatePassword("abcdef"), "Password must be exactly 6 digits.");
});

test("hashPassword and verifyPassword work correctly", () => {
  const password = "123456";
  const hash = hashPassword(password);
  assert.equal(verifyPassword(password, hash), true);
  assert.equal(verifyPassword("654321", hash), false);
});
