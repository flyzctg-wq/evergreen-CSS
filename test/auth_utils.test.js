const test = require("node:test");
const assert = require("node:assert/strict");
const authUtils = require("../api/auth_utils");

test("JWT verification security & functionality", async (t) => {
  const secret = "test-secret-key-123";
  const payload = { email: "player@example.com", name: "Player 1", role: "standard" };

  await t.test("successfully signs and verifies a valid token", () => {
    const token = authUtils.signJWT(payload, secret, 300);
    const verified = authUtils.verifyJWT(token, secret);
    assert.ok(verified, "Token should be verified");
    assert.equal(verified.email, payload.email);
    assert.equal(verified.role, payload.role);
    assert.ok(typeof verified.exp === "number");
  });

  await t.test("rejects token verified with wrong secret", () => {
    const token = authUtils.signJWT(payload, secret, 300);
    const verified = authUtils.verifyJWT(token, "different-wrong-secret");
    assert.equal(verified, null, "Should return null when secret does not match");
  });

  await t.test("rejects token with tampered payload or signature", () => {
    const token = authUtils.signJWT(payload, secret, 300);
    const parts = token.split(".");

    // Tamper with signature
    const tamperedSig = parts[2].slice(0, -1) + (parts[2].endsWith("a") ? "b" : "a");
    const tamperedToken = `${parts[0]}.${parts[1]}.${tamperedSig}`;
    assert.equal(authUtils.verifyJWT(tamperedToken, secret), null, "Tampered signature should fail");

    // Tamper with signature length
    const shortSigToken = `${parts[0]}.${parts[1]}.${parts[2].slice(0, 10)}`;
    assert.equal(authUtils.verifyJWT(shortSigToken, secret), null, "Truncated signature should fail");
  });

  await t.test("rejects expired tokens", () => {
    const expiredToken = authUtils.signJWT(payload, secret, -10);
    const verified = authUtils.verifyJWT(expiredToken, secret);
    assert.equal(verified, null, "Expired token should return null");
  });

  await t.test("safely handles malformed token inputs without throwing", () => {
    assert.equal(authUtils.verifyJWT("", secret), null);
    assert.equal(authUtils.verifyJWT(null, secret), null);
    assert.equal(authUtils.verifyJWT(undefined, secret), null);
    assert.equal(authUtils.verifyJWT(12345, secret), null);
    assert.equal(authUtils.verifyJWT("not.a.valid.jwt.token", secret), null);
    assert.equal(authUtils.verifyJWT("singletoken", secret), null);
  });
});
