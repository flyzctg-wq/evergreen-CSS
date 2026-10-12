const test = require("node:test");
const assert = require("node:assert/strict");
const authUtils = require("../api/auth_utils");

test("validatePassword checks password criteria", () => {
  assert.equal(authUtils.validatePassword(null), "Password must be a string.");
  assert.equal(authUtils.validatePassword(123456), "Password must be a string.");
  assert.equal(authUtils.validatePassword("short"), "Password must be at least 8 characters long.");
  assert.equal(authUtils.validatePassword("alllowercase"), "Password must contain at least one uppercase letter.");
  assert.equal(authUtils.validatePassword("ALLUPPERCASE"), "Password must contain at least one lowercase letter.");
  assert.equal(authUtils.validatePassword("NoNumbersHere!"), "Password must contain at least one number.");
  assert.equal(authUtils.validatePassword("NoSpecial123"), "Password must contain at least one special character.");
  assert.equal(authUtils.validatePassword("Valid123!"), null);
});

test("hashPassword and verifyPassword work correctly", () => {
  const password = "Valid123!";
  const hash = authUtils.hashPassword(password);
  assert.ok(hash.includes(":"), "Hash format should be salt:hash");

  assert.equal(authUtils.verifyPassword(password, hash), true);
  assert.equal(authUtils.verifyPassword("WrongPassword1!", hash), false);
  assert.equal(authUtils.verifyPassword(password, "invalidhash"), false);
});

test("signJWT and verifyJWT work correctly", () => {
  const payload = { email: "user@example.com", role: "standard" };
  const token = authUtils.signJWT(payload, authUtils.JWT_SECRET, 60);

  const verified = authUtils.verifyJWT(token, authUtils.JWT_SECRET);
  assert.equal(verified.email, payload.email);
  assert.equal(verified.role, payload.role);

  const invalidSecret = authUtils.verifyJWT(token, "wrong-secret");
  assert.equal(invalidSecret, null);
});
