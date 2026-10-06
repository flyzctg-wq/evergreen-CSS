const test = require("node:test");
const assert = require("node:assert");
const authUtils = require("../api/auth_utils");

test("authUtils - Password validation and hashing", () => {
  assert.strictEqual(authUtils.validatePassword("12345"), "Password must be exactly 6 digits.");
  assert.strictEqual(authUtils.validatePassword("123456"), null);

  const pass = "654321";
  const hashed = authUtils.hashPassword(pass);
  assert.ok(hashed.includes(":"), "Hash should contain salt separator");
  assert.strictEqual(authUtils.verifyPassword(pass, hashed), true);
  assert.strictEqual(authUtils.verifyPassword("000000", hashed), false);
});

test("authUtils - JWT signing and verification", () => {
  const payload = { email: "test@evergreen.com", role: "standard" };
  const token = authUtils.signJWT(payload, authUtils.JWT_SECRET, 3600);
  assert.ok(typeof token === "string" && token.split(".").length === 3);

  const verified = authUtils.verifyJWT(token, authUtils.JWT_SECRET);
  assert.strictEqual(verified.email, payload.email);
  assert.strictEqual(verified.role, payload.role);

  const invalid = authUtils.verifyJWT(token, "wrong-secret");
  assert.strictEqual(invalid, null);
});

test("authUtils - User save and cached retrieval", async () => {
  const testUser = {
    email: "bolt@evergreen.com",
    name: "Bolt",
    passwordHash: authUtils.hashPassword("123456"),
    role: "administrator",
    createdAt: Date.now()
  };

  const saved = await authUtils.saveUser(testUser);
  assert.strictEqual(saved, true);

  // First fetch initializes cache
  const fetched = await authUtils.getUser("bolt@evergreen.com");
  assert.ok(fetched !== null);
  assert.strictEqual(fetched.email, "bolt@evergreen.com");
  assert.strictEqual(fetched.name, "Bolt");

  // Performance measurement for cached reads vs threshold
  const start = performance.now();
  const ITERATIONS = 1000;
  for (let i = 0; i < ITERATIONS; i++) {
    await authUtils.getUser("bolt@evergreen.com");
  }
  const durationMs = performance.now() - start;
  const avgTimePerOpMs = durationMs / ITERATIONS;

  // With in-memory caching, 1000 ops take < 5ms total (< 0.005ms per op)
  assert.ok(avgTimePerOpMs < 0.1, `Average read time per operation (${avgTimePerOpMs.toFixed(4)}ms) should be < 0.1ms`);
});
