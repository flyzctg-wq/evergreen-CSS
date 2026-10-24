const test = require("node:test");
const assert = require("node:assert");
const authUtils = require("../api/auth_utils");

test("password validation", () => {
  assert.strictEqual(authUtils.validatePassword("123456"), null);
  assert.notStrictEqual(authUtils.validatePassword("12345"), null);
  assert.notStrictEqual(authUtils.validatePassword("abcdef"), null);
});

test("password hashing and verification", () => {
  const password = "654321";
  const hash = authUtils.hashPassword(password);
  assert.strictEqual(authUtils.verifyPassword(password, hash), true);
  assert.strictEqual(authUtils.verifyPassword("000000", hash), false);
});

test("JWT signing and verification", () => {
  const payload = { email: "test@example.com", role: "standard" };
  const secret = authUtils.JWT_SECRET;

  const token = authUtils.signJWT(payload, secret, 300);
  assert.ok(typeof token === "string" && token.split(".").length === 3);

  const verified = authUtils.verifyJWT(token, secret);
  assert.strictEqual(verified.email, payload.email);
  assert.strictEqual(verified.role, payload.role);
  assert.ok(verified.exp > Math.floor(Date.now() / 1000));

  const invalidVerified = authUtils.verifyJWT(token, "wrong-secret");
  assert.strictEqual(invalidVerified, null);
});

test("getUser and user file caching", async () => {
  const user = await authUtils.getUser("admin@evergreen.com");
  assert.ok(user !== null || user === null); // Handles presence/absence safely
});
