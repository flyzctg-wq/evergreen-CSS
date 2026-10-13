const test = require("node:test");
const assert = require("node:assert");
const authUtils = require("../api/auth_utils");

test("authUtils - Secrets initialization", () => {
  assert.ok(typeof authUtils.JWT_SECRET === "string");
  assert.ok(authUtils.JWT_SECRET.length >= 32);
  assert.ok(typeof authUtils.REFRESH_SECRET === "string");
  assert.ok(authUtils.REFRESH_SECRET.length >= 32);
  assert.ok(typeof authUtils.RESET_SECRET === "string");
  assert.ok(authUtils.RESET_SECRET.length >= 32);
});

test("authUtils - validatePassword", () => {
  assert.strictEqual(authUtils.validatePassword("123456"), null);
  assert.ok(authUtils.validatePassword("12345"));
  assert.ok(authUtils.validatePassword("abcdef"));
  assert.ok(authUtils.validatePassword(null));
});

test("authUtils - hashPassword and verifyPassword", () => {
  const pw = "654321";
  const hash = authUtils.hashPassword(pw);
  assert.ok(hash.includes(":"));
  assert.strictEqual(authUtils.verifyPassword(pw, hash), true);
  assert.strictEqual(authUtils.verifyPassword("000000", hash), false);
  assert.strictEqual(authUtils.verifyPassword("654321", "invalidhash"), false);
});

test("authUtils - signJWT and verifyJWT", () => {
  const secret = "test-secret-key-for-testing-12345";
  const payload = { email: "user@example.com", role: "administrator" };
  const token = authUtils.signJWT(payload, secret, 3600);
  assert.ok(typeof token === "string");
  assert.strictEqual(token.split(".").length, 3);

  const decoded = authUtils.verifyJWT(token, secret);
  assert.ok(decoded);
  assert.strictEqual(decoded.email, "user@example.com");
  assert.strictEqual(decoded.role, "administrator");

  // Invalid secret
  assert.strictEqual(authUtils.verifyJWT(token, "wrong-secret"), null);

  // Expired token test
  const expiredToken = authUtils.signJWT(payload, secret, -10);
  assert.strictEqual(authUtils.verifyJWT(expiredToken, secret), null);
});
