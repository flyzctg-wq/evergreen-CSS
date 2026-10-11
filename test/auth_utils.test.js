const test = require("node:test");
const assert = require("node:assert");
const authUtils = require("../api/auth_utils");

test("password hashing and verification", () => {
  const password = "123456";
  const hash = authUtils.hashPassword(password);

  assert.ok(hash.includes(":"), "hash should contain salt and hash separated by colon");
  assert.strictEqual(authUtils.verifyPassword(password, hash), true, "correct password should verify");
  assert.strictEqual(authUtils.verifyPassword("654321", hash), false, "incorrect password should fail verification");
  assert.strictEqual(authUtils.verifyPassword("", hash), false, "empty password should fail verification");
  assert.strictEqual(authUtils.verifyPassword(password, null), false, "null hash should fail verification");
});

test("JWT signing and verification", () => {
  const payload = { email: "test@example.com", role: "standard" };
  const secret = authUtils.JWT_SECRET;

  const token = authUtils.signJWT(payload, secret, 60);
  assert.ok(typeof token === "string" && token.split(".").length === 3, "token should be valid JWT string format");

  const verified = authUtils.verifyJWT(token, secret);
  assert.ok(verified, "valid token should verify successfully");
  assert.strictEqual(verified.email, payload.email);
  assert.strictEqual(verified.role, payload.role);

  const tamperedToken = token.slice(0, -2) + "xx";
  assert.strictEqual(authUtils.verifyJWT(tamperedToken, secret), null, "tampered token should fail verification");

  assert.strictEqual(authUtils.verifyJWT(token, "wrong-secret"), null, "incorrect secret should fail verification");
});
