const { test, describe } = require("node:test");
const assert = require("node:assert/strict");
const authUtils = require("../api/auth_utils");

describe("auth_utils security and functionality", () => {
  test("validatePassword requires 6 numeric digits", () => {
    assert.equal(authUtils.validatePassword("123456"), null);
    assert.notEqual(authUtils.validatePassword("12345"), null);
    assert.notEqual(authUtils.validatePassword("abcdef"), null);
  });

  test("hashPassword and verifyPassword work correctly with timing-safe comparison", () => {
    const passcode = "654321";
    const hashed = authUtils.hashPassword(passcode);

    assert.equal(authUtils.verifyPassword(passcode, hashed), true);
    assert.equal(authUtils.verifyPassword("000000", hashed), false);
    assert.equal(authUtils.verifyPassword("654321", "invalid_stored_format"), false);
  });

  test("signJWT and verifyJWT handle valid and tampered tokens", () => {
    const payload = { email: "test@example.com", name: "Tester", role: "standard" };
    const secret = authUtils.JWT_SECRET;

    const token = authUtils.signJWT(payload, secret, 300);
    const decoded = authUtils.verifyJWT(token, secret);

    assert.equal(decoded.email, payload.email);
    assert.equal(decoded.name, payload.name);
    assert.equal(decoded.role, payload.role);

    // Tampered signature should be rejected by timing-safe verifyJWT
    const parts = token.split(".");
    const tamperedToken = `${parts[0]}.${parts[1]}.invalid_signature`;
    assert.equal(authUtils.verifyJWT(tamperedToken, secret), null);

    // Wrong secret should be rejected
    assert.equal(authUtils.verifyJWT(token, "wrong-secret-key"), null);
  });
});
