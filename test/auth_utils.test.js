const test = require("node:test");
const assert = require("node:assert");
const authUtils = require("../api/auth_utils");

test("validatePassword checks for 6-digit numeric string", () => {
  assert.strictEqual(authUtils.validatePassword("123456"), null);
  assert.notStrictEqual(authUtils.validatePassword("12345"), null);
  assert.notStrictEqual(authUtils.validatePassword("1234567"), null);
  assert.notStrictEqual(authUtils.validatePassword("abcdef"), null);
  assert.notStrictEqual(authUtils.validatePassword(""), null);
  assert.notStrictEqual(authUtils.validatePassword(null), null);
});

test("hashPassword and verifyPassword verify correct and incorrect passwords using timingSafeEqual", () => {
  const password = "123456";
  const wrongPassword = "654321";
  const storedHash = authUtils.hashPassword(password);

  assert.ok(storedHash.includes(":"), "hash should contain salt and hash separated by colon");
  assert.strictEqual(authUtils.verifyPassword(password, storedHash), true);
  assert.strictEqual(authUtils.verifyPassword(wrongPassword, storedHash), false);
  assert.strictEqual(authUtils.verifyPassword(password, "invalid:hash"), false);
  assert.strictEqual(authUtils.verifyPassword(password, ""), false);
});

test("signJWT and verifyJWT sign and verify tokens securely using timingSafeEqual", () => {
  const payload = { email: "user@example.com", role: "standard" };
  const token = authUtils.signJWT(payload, authUtils.JWT_SECRET, 60);

  const decoded = authUtils.verifyJWT(token, authUtils.JWT_SECRET);
  assert.ok(decoded, "Token should decode successfully");
  assert.strictEqual(decoded.email, payload.email);
  assert.strictEqual(decoded.role, payload.role);

  // Invalid secret
  assert.strictEqual(authUtils.verifyJWT(token, "wrong-secret"), null);

  // Tampered payload
  const parts = token.split(".");
  const tamperedPayload = Buffer.from(JSON.stringify({ email: "admin@example.com", role: "administrator", exp: decoded.exp }))
    .toString("base64")
    .replace(/=/g, "")
    .replace(/\+/g, "-")
    .replace(/\//g, "_");
  const tamperedToken = `${parts[0]}.${tamperedPayload}.${parts[2]}`;
  assert.strictEqual(authUtils.verifyJWT(tamperedToken, authUtils.JWT_SECRET), null);

  // Expired token
  const expiredToken = authUtils.signJWT(payload, authUtils.JWT_SECRET, -10);
  assert.strictEqual(authUtils.verifyJWT(expiredToken, authUtils.JWT_SECRET), null);

  // Malformed tokens
  assert.strictEqual(authUtils.verifyJWT("not.a.valid.jwt", authUtils.JWT_SECRET), null);
  assert.strictEqual(authUtils.verifyJWT("", authUtils.JWT_SECRET), null);
  assert.strictEqual(authUtils.verifyJWT(null, authUtils.JWT_SECRET), null);
});
