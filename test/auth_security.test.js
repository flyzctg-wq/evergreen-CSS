const test = require("node:test");
const assert = require("node:assert/strict");
const authUtils = require("../api/auth_utils");

test("verifyPassword: correctly validates matching password", () => {
  const password = "123456";
  const storedHash = authUtils.hashPassword(password);
  assert.equal(authUtils.verifyPassword(password, storedHash), true);
});

test("verifyPassword: fails for mismatched password", () => {
  const password = "123456";
  const storedHash = authUtils.hashPassword(password);
  assert.equal(authUtils.verifyPassword("654321", storedHash), false);
});

test("verifyPassword: fails safely for invalid or malformed hashes", () => {
  assert.equal(authUtils.verifyPassword("123456", null), false);
  assert.equal(authUtils.verifyPassword("123456", ""), false);
  assert.equal(authUtils.verifyPassword("123456", "malformedstring"), false);
  assert.equal(authUtils.verifyPassword("123456", "salt:"), false);
  assert.equal(authUtils.verifyPassword("123456", ":hash"), false);
});

test("verifyJWT: correctly verifies valid token and decodes payload", () => {
  const payload = { email: "scorer@evergreen.club", role: "standard" };
  const secret = "test-secret-key-123";
  const token = authUtils.signJWT(payload, secret, 300);

  const decoded = authUtils.verifyJWT(token, secret);
  assert.ok(decoded);
  assert.equal(decoded.email, "scorer@evergreen.club");
  assert.equal(decoded.role, "standard");
  assert.ok(typeof decoded.exp === "number");
});

test("verifyJWT: rejects invalid signatures and altered payloads", () => {
  const payload = { email: "scorer@evergreen.club", role: "standard" };
  const secret = "test-secret-key-123";
  const token = authUtils.signJWT(payload, secret, 300);

  // Wrong secret
  assert.equal(authUtils.verifyJWT(token, "wrong-secret"), null);

  // Tampered payload
  const parts = token.split(".");
  const tamperedPayload = Buffer.from(JSON.stringify({ email: "admin@evergreen.club", role: "administrator" }))
    .toString("base64")
    .replace(/=/g, "");
  const tamperedToken = `${parts[0]}.${tamperedPayload}.${parts[2]}`;
  assert.equal(authUtils.verifyJWT(tamperedToken, secret), null);

  // Tampered signature
  const tamperedSigToken = `${parts[0]}.${parts[1]}.${parts[2].slice(0, -1)}x`;
  assert.equal(authUtils.verifyJWT(tamperedSigToken, secret), null);
});

test("verifyJWT: rejects expired tokens and malformed strings", () => {
  const secret = "test-secret-key-123";
  const expiredToken = authUtils.signJWT({ test: true }, secret, -10);
  assert.equal(authUtils.verifyJWT(expiredToken, secret), null);

  assert.equal(authUtils.verifyJWT(null, secret), null);
  assert.equal(authUtils.verifyJWT("", secret), null);
  assert.equal(authUtils.verifyJWT("invalid.token", secret), null);
  assert.equal(authUtils.verifyJWT("a.b.c.d", secret), null);
});
