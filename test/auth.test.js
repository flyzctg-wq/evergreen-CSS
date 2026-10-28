const test = require("node:test");
const assert = require("node:assert");
const authUtils = require("../api/auth_utils");

test("password hashing and timing-safe verification", () => {
  const password = "123456";
  const hashedPassword = authUtils.hashPassword(password);

  assert.strictEqual(authUtils.verifyPassword("123456", hashedPassword), true);
  assert.strictEqual(authUtils.verifyPassword("654321", hashedPassword), false);
  assert.strictEqual(authUtils.verifyPassword("12345", hashedPassword), false);
  assert.strictEqual(authUtils.verifyPassword("", hashedPassword), false);
  assert.strictEqual(authUtils.verifyPassword("123456", null), false);
  assert.strictEqual(authUtils.verifyPassword("123456", "invalid-format"), false);
});

test("JWT signing and timing-safe verification", () => {
  const payload = { email: "test@example.com", name: "Test User", role: "standard" };
  const secret = "test-secret-key";
  const token = authUtils.signJWT(payload, secret, 3600);

  // Valid verification
  const verified = authUtils.verifyJWT(token, secret);
  assert.ok(verified);
  assert.strictEqual(verified.email, "test@example.com");
  assert.strictEqual(verified.name, "Test User");

  // Invalid secret
  assert.strictEqual(authUtils.verifyJWT(token, "wrong-secret"), null);

  // Tampered payload
  const parts = token.split(".");
  const tamperedToken = `${parts[0]}.eyFlbWFpbCI6ImhhY2tlckBleGFtcGxlLmNvbSIsIm5hbWUiOiJIZWxsbyIsInJvbGUiOiJhZG1pbiJ9.${parts[2]}`;
  assert.strictEqual(authUtils.verifyJWT(tamperedToken, secret), null);

  // Invalid format or empty token
  assert.strictEqual(authUtils.verifyJWT("invalid.token", secret), null);
  assert.strictEqual(authUtils.verifyJWT("", secret), null);
  assert.strictEqual(authUtils.verifyJWT(null, secret), null);
});
