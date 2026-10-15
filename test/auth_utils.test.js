const test = require("node:test");
const assert = require("node:assert");
const authUtils = require("../api/auth_utils");

test("verifyPassword returns true for matching password and false for wrong password", () => {
  const passcode = "123456";
  const wrongPasscode = "654321";
  const storedHash = authUtils.hashPassword(passcode);

  assert.strictEqual(authUtils.verifyPassword(passcode, storedHash), true);
  assert.strictEqual(authUtils.verifyPassword(wrongPasscode, storedHash), false);
  assert.strictEqual(authUtils.verifyPassword("", storedHash), false);
  assert.strictEqual(authUtils.verifyPassword(passcode, "invalid:hash"), false);
});

test("verifyJWT successfully verifies valid token and rejects tampered signature", () => {
  const payload = { email: "test@example.com", name: "Tester" };
  const token = authUtils.signJWT(payload, authUtils.JWT_SECRET, 300);

  const decoded = authUtils.verifyJWT(token, authUtils.JWT_SECRET);
  assert.ok(decoded);
  assert.strictEqual(decoded.email, "test@example.com");

  // Tampered signature test
  const parts = token.split(".");
  const tamperedToken = `${parts[0]}.${parts[1]}.tamperedSignature123`;
  assert.strictEqual(authUtils.verifyJWT(tamperedToken, authUtils.JWT_SECRET), null);

  // Wrong secret test
  assert.strictEqual(authUtils.verifyJWT(token, "wrong-secret-key"), null);
});

test("verifyJWT returns null for expired token", async () => {
  const payload = { email: "expired@example.com" };
  const token = authUtils.signJWT(payload, authUtils.JWT_SECRET, -1); // Expired 1 second ago

  const decoded = authUtils.verifyJWT(token, authUtils.JWT_SECRET);
  assert.strictEqual(decoded, null);
});
