const test = require("node:test");
const assert = require("node:assert");
const authUtils = require("../api/auth_utils");

test("safeCompare performs constant-time string comparisons correctly", () => {
  assert.strictEqual(authUtils.safeCompare("secret123", "secret123"), true);
  assert.strictEqual(authUtils.safeCompare("secret123", "secret124"), false);
  assert.strictEqual(authUtils.safeCompare("secret123", "secret"), false);
  assert.strictEqual(authUtils.safeCompare(null, "secret123"), false);
  assert.strictEqual(authUtils.safeCompare("secret123", undefined), false);
});

test("verifyPassword correctly verifies passwords", () => {
  const password = "123456"; // 6 digits requirement
  const hashedPassword = authUtils.hashPassword(password);

  assert.strictEqual(authUtils.verifyPassword("123456", hashedPassword), true);
  assert.strictEqual(authUtils.verifyPassword("654321", hashedPassword), false);
  assert.strictEqual(authUtils.verifyPassword("", hashedPassword), false);
  assert.strictEqual(authUtils.verifyPassword("123456", "invalidformat"), false);
});

test("signJWT and verifyJWT sign and verify tokens securely", () => {
  const payload = { email: "user@example.com", role: "standard" };
  const token = authUtils.signJWT(payload, authUtils.JWT_SECRET, 60);

  const decoded = authUtils.verifyJWT(token, authUtils.JWT_SECRET);
  assert.ok(decoded);
  assert.strictEqual(decoded.email, "user@example.com");

  // Invalid secret
  assert.strictEqual(authUtils.verifyJWT(token, "wrong-secret"), null);

  // Tampered token
  const tampered = token.slice(0, -1) + (token.endsWith("a") ? "b" : "a");
  assert.strictEqual(authUtils.verifyJWT(tampered, authUtils.JWT_SECRET), null);
});
