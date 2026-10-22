const test = require("node:test");
const assert = require("node:assert");
const authUtils = require("../api/auth_utils");

test("signJWT and verifyJWT work with valid secret", () => {
  const secret = "test-secret-key-123";
  const payload = { email: "user@example.com", role: "standard" };
  const token = authUtils.signJWT(payload, secret, 3600);

  const verified = authUtils.verifyJWT(token, secret);
  assert.strictEqual(verified.email, "user@example.com");
  assert.strictEqual(verified.role, "standard");
});

test("verifyJWT fails with invalid secret or tampered token", () => {
  const secret = "test-secret-key-123";
  const wrongSecret = "wrong-secret-key-456";
  const payload = { email: "user@example.com", role: "standard" };
  const token = authUtils.signJWT(payload, secret, 3600);

  assert.strictEqual(authUtils.verifyJWT(token, wrongSecret), null);

  // Tamper signature
  const parts = token.split(".");
  const tamperedToken = `${parts[0]}.${parts[1]}.invalidSignature`;
  assert.strictEqual(authUtils.verifyJWT(tamperedToken, secret), null);
});

test("verifyJWT fails for expired token", () => {
  const secret = "test-secret-key-123";
  const payload = { email: "user@example.com" };
  const token = authUtils.signJWT(payload, secret, -10); // Already expired 10s ago

  assert.strictEqual(authUtils.verifyJWT(token, secret), null);
});
