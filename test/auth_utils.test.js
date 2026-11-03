const test = require("node:test");
const assert = require("node:assert/strict");
const authUtils = require("../api/auth_utils");

test("password hashing and timing-safe verification", () => {
  const password = "123456";
  const stored = authUtils.hashPassword(password);

  assert.ok(stored.includes(":"), "Stored hash must contain salt separator");
  assert.strictEqual(authUtils.verifyPassword(password, stored), true, "Correct password must verify successfully");
  assert.strictEqual(authUtils.verifyPassword("654321", stored), false, "Wrong password must fail");
  assert.strictEqual(authUtils.verifyPassword("", stored), false, "Empty password must fail");
  assert.strictEqual(authUtils.verifyPassword(password, "invalid_hash_string"), false, "Malformed stored hash must fail gracefully");
});

test("JWT signing and timing-safe signature verification", () => {
  const payload = { email: "scorer@example.com", role: "standard" };
  const secret = "test-secret-key";
  const token = authUtils.signJWT(payload, secret, 300);

  const decoded = authUtils.verifyJWT(token, secret);
  assert.ok(decoded, "Valid token must be decoded");
  assert.strictEqual(decoded.email, payload.email);
  assert.strictEqual(decoded.role, payload.role);

  // Wrong secret
  assert.strictEqual(authUtils.verifyJWT(token, "wrong-secret"), null, "Token with wrong secret must return null");

  // Tampered payload
  const parts = token.split(".");
  const tamperedPayload = Buffer.from(JSON.stringify({ email: "admin@example.com", role: "administrator" })).toString("base64url");
  const tamperedToken = `${parts[0]}.${tamperedPayload}.${parts[2]}`;
  assert.strictEqual(authUtils.verifyJWT(tamperedToken, secret), null, "Tampered payload token must return null");

  // Tampered signature (same length)
  const tamperedSig = parts[2].slice(0, -1) + (parts[2].slice(-1) === "a" ? "b" : "a");
  assert.strictEqual(authUtils.verifyJWT(`${parts[0]}.${parts[1]}.${tamperedSig}`, secret), null, "Tampered signature must return null");

  // Malformed or invalid structure tokens
  assert.strictEqual(authUtils.verifyJWT("not.a.valid.jwt.token", secret), null);
  assert.strictEqual(authUtils.verifyJWT("invalid", secret), null);
  assert.strictEqual(authUtils.verifyJWT("", secret), null);
  assert.strictEqual(authUtils.verifyJWT(null, secret), null);
});
