const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const authUtils = require("../api/auth_utils");

const LOCAL_DB_PATH = path.join(__dirname, "..", "server", "users.json");

test("validatePassword validates 6-digit passcode requirements", () => {
  assert.equal(authUtils.validatePassword("123456"), null);
  assert.notEqual(authUtils.validatePassword("12345"), null);
  assert.notEqual(authUtils.validatePassword("abcdef"), null);
  assert.notEqual(authUtils.validatePassword(""), null);
});

test("hashPassword and verifyPassword work correctly", () => {
  const hash = authUtils.hashPassword("123456");
  assert.ok(hash.includes(":"));
  assert.equal(authUtils.verifyPassword("123456", hash), true);
  assert.equal(authUtils.verifyPassword("654321", hash), false);
});

test("JWT signing and verification work as expected", () => {
  const payload = { email: "test@example.com", name: "Test User", role: "standard" };
  const token = authUtils.signJWT(payload, authUtils.JWT_SECRET, 900);
  assert.ok(typeof token === "string");

  const verified = authUtils.verifyJWT(token, authUtils.JWT_SECRET);
  assert.equal(verified.email, payload.email);
  assert.equal(verified.name, payload.name);
  assert.equal(verified.role, payload.role);

  const invalidVerified = authUtils.verifyJWT(token, "wrong-secret");
  assert.equal(invalidVerified, null);
});

test("getUser retrieves existing user from file storage cache", async () => {
  const user = await authUtils.getUser("test@example.com");
  assert.ok(user !== null);
  assert.equal(user.email, "test@example.com");
  assert.equal(user.name, "Test Scorer");
});

test("saveUser and getUser work together with cache updates", async () => {
  const initialData = fs.existsSync(LOCAL_DB_PATH) ? fs.readFileSync(LOCAL_DB_PATH, "utf8") : null;

  try {
    const testEmail = "test_cache_user@example.com";
    const newUser = {
      email: testEmail,
      name: "Cache Test User",
      passwordHash: authUtils.hashPassword("654321"),
      role: "standard",
      createdAt: Date.now()
    };

    const saved = await authUtils.saveUser(newUser);
    assert.equal(saved, true);

    const fetched = await authUtils.getUser(testEmail);
    assert.ok(fetched !== null);
    assert.equal(fetched.name, "Cache Test User");
  } finally {
    // Clean up test data modification to leave repository pristine
    if (initialData !== null) {
      fs.writeFileSync(LOCAL_DB_PATH, initialData, "utf8");
    }
  }
});

test("getUser performance benchmark: 1,000 cached calls execution time", async () => {
  // Prime cache
  await authUtils.getUser("test@example.com");

  const start = process.hrtime.bigint();
  const iterations = 1000;
  for (let i = 0; i < iterations; i++) {
    await authUtils.getUser("test@example.com");
  }
  const end = process.hrtime.bigint();
  const durationMs = Number(end - start) / 1e6;

  console.log(`\n  ⚡ Benchmark: ${iterations} getUser calls took ${durationMs.toFixed(3)} ms`);
  // Assert cached calls execute fast (< 150ms for 1,000 calls across varying CPU environments)
  assert.ok(durationMs < 150, `1000 calls took ${durationMs}ms, expected < 150ms`);
});
