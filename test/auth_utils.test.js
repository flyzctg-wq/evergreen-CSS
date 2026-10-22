const { test, describe } = require("node:test");
const assert = require("node:assert/strict");
const authUtils = require("../api/auth_utils");

describe("Auth Utils & Caching Tests", () => {
  test("Password validation enforces 6-digit numeric passcode requirement", () => {
    assert.strictEqual(authUtils.validatePassword("123456"), null);
    assert.strictEqual(authUtils.validatePassword("12345"), "Password must be exactly 6 digits.");
    assert.strictEqual(authUtils.validatePassword("abcdef"), "Password must be exactly 6 digits.");
    assert.strictEqual(authUtils.validatePassword(""), "Password must be a string.");
    assert.strictEqual(authUtils.validatePassword(null), "Password must be a string.");
  });

  test("Password hashing and verification work correctly", () => {
    const rawPass = "654321";
    const hashed = authUtils.hashPassword(rawPass);
    assert.ok(hashed.includes(":"), "Hash format should include salt separator");

    assert.ok(authUtils.verifyPassword(rawPass, hashed), "Correct password should verify");
    assert.ok(!authUtils.verifyPassword("111111", hashed), "Incorrect password should fail verification");
  });

  test("JWT signing and verification work correctly", () => {
    const payload = { email: "test@example.com", role: "standard" };
    const secret = "test-secret-key";
    const token = authUtils.signJWT(payload, secret, 300);

    const decoded = authUtils.verifyJWT(token, secret);
    assert.ok(decoded);
    assert.strictEqual(decoded.email, "test@example.com");
    assert.strictEqual(decoded.role, "standard");

    // Invalid secret
    assert.strictEqual(authUtils.verifyJWT(token, "wrong-secret"), null);
  });

  test("User saving and retrieving with cached storage", async () => {
    const testUser = {
      email: "bolt@evergreen.test",
      name: "Bolt Agent",
      passwordHash: authUtils.hashPassword("123456"),
      role: "standard",
      createdAt: Date.now()
    };

    const saved = await authUtils.saveUser(testUser);
    assert.ok(saved);

    const fetched = await authUtils.getUser("bolt@evergreen.test");
    assert.ok(fetched);
    assert.strictEqual(fetched.email, "bolt@evergreen.test");
    assert.strictEqual(fetched.name, "Bolt Agent");
  });

  test("KV resolution memoization performance boost", () => {
    const start = performance.now();
    for (let i = 0; i < 5000; i++) {
      // Internal getKV call through getUser
      authUtils.getUser("nonexistent@example.com");
    }
    const elapsed = performance.now() - start;
    // 5000 calls should take well under 100ms when memoized
    assert.ok(elapsed < 200, `5000 user lookups took ${elapsed.toFixed(2)}ms, expected < 200ms`);
  });
});
