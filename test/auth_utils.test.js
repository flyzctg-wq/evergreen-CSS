const test = require("node:test");
const assert = require("node:assert/strict");
const authUtils = require("../api/auth_utils.js");

test("JWT signing and verification works", () => {
  const payload = { email: "test@example.com", role: "standard" };
  const secret = "test-secret-key-1234567890";
  const token = authUtils.signJWT(payload, secret, 3600);

  assert.ok(typeof token === "string");

  const verifiedPayload = authUtils.verifyJWT(token, secret);
  assert.equal(verifiedPayload.email, "test@example.com");
  assert.equal(verifiedPayload.role, "standard");
});

test("JWT verification fails with invalid secret", () => {
  const payload = { email: "test@example.com" };
  const token = authUtils.signJWT(payload, "secret-one", 3600);

  const verified = authUtils.verifyJWT(token, "wrong-secret");
  assert.equal(verified, null);
});

test("Password hashing and verification works", () => {
  const rawPw = "123456";
  const hashed = authUtils.hashPassword(rawPw);

  assert.ok(authUtils.verifyPassword(rawPw, hashed));
  assert.ok(!authUtils.verifyPassword("654321", hashed));
});
