const test = require("node:test");
const assert = require("node:assert");
const authUtils = require("../api/auth_utils");

test("verifyPassword correctly checks passcodes", () => {
  const passcode = "123456";
  const hash = authUtils.hashPassword(passcode);

  // Correct passcode
  assert.strictEqual(authUtils.verifyPassword("123456", hash), true);

  // Wrong passcode
  assert.strictEqual(authUtils.verifyPassword("654321", hash), false);

  // Invalid / malformed stored hash
  assert.strictEqual(authUtils.verifyPassword("123456", "invalidhash"), false);
  assert.strictEqual(authUtils.verifyPassword("123456", null), false);
  assert.strictEqual(authUtils.verifyPassword("123456", ""), false);
});
