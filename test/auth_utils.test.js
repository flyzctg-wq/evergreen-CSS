const test = require("node:test");
const assert = require("node:assert/strict");
const authUtils = require("../api/auth_utils");

test("signJWT and verifyJWT - valid token", () => {
  const payload = { email: "test@example.com", name: "Test User", role: "standard" };
  const token = authUtils.signJWT(payload, authUtils.JWT_SECRET, 60);
  const verified = authUtils.verifyJWT(token, authUtils.JWT_SECRET);

  assert.ok(verified);
  assert.equal(verified.email, payload.email);
  assert.equal(verified.name, payload.name);
  assert.equal(verified.role, payload.role);
});

test("verifyJWT - tampered signature fails", () => {
  const payload = { email: "test@example.com", name: "Test User", role: "standard" };
  const token = authUtils.signJWT(payload, authUtils.JWT_SECRET, 60);
  const parts = token.split(".");
  parts[2] = parts[2].slice(0, -1) + (parts[2].slice(-1) === "a" ? "b" : "a");
  const tamperedToken = parts.join(".");

  const verified = authUtils.verifyJWT(tamperedToken, authUtils.JWT_SECRET);
  assert.equal(verified, null);
});

test("verifyJWT - expired token fails", () => {
  const payload = { email: "test@example.com", name: "Test User", role: "standard" };
  const token = authUtils.signJWT(payload, authUtils.JWT_SECRET, -10);
  const verified = authUtils.verifyJWT(token, authUtils.JWT_SECRET);

  assert.equal(verified, null);
});

test("verifyJWT - wrong secret fails", () => {
  const payload = { email: "test@example.com", name: "Test User", role: "standard" };
  const token = authUtils.signJWT(payload, authUtils.JWT_SECRET, 60);
  const verified = authUtils.verifyJWT(token, "wrong-secret");

  assert.equal(verified, null);
});
