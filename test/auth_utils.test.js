const fs = require("fs");
const path = require("path");
const test = require("node:test");
const assert = require("node:assert/strict");
const authUtils = require("../api/auth_utils");

const USERS_FILE = path.join(__dirname, "..", "server", "users.json");

test("validatePassword enforces 6-digit numeric passcodes", () => {
  assert.equal(authUtils.validatePassword("123456"), null);
  assert.notEqual(authUtils.validatePassword("12345"), null);
  assert.notEqual(authUtils.validatePassword("abcdef"), null);
});

test("hashPassword and verifyPassword work correctly", () => {
  const password = "654321";
  const hash = authUtils.hashPassword(password);
  assert.ok(hash.includes(":"));
  assert.equal(authUtils.verifyPassword(password, hash), true);
  assert.equal(authUtils.verifyPassword("000000", hash), false);
});

test("signJWT and verifyJWT handle token lifecycle", () => {
  const payload = { email: "tester@example.com", role: "standard" };
  const token = authUtils.signJWT(payload, authUtils.JWT_SECRET, 60);
  const verified = authUtils.verifyJWT(token, authUtils.JWT_SECRET);
  assert.equal(verified.email, "tester@example.com");
  assert.equal(verified.role, "standard");
});

test("saveUser and getUser cache users in memory and retrieve correctly", async () => {
  const initialContent = fs.readFileSync(USERS_FILE, "utf8");

  try {
    const dynamicEmail = `dynamic_${Date.now()}@example.com`;
    const testUser = {
      email: dynamicEmail,
      name: "Dynamic User",
      passwordHash: authUtils.hashPassword("112233"),
      role: "standard"
    };

    await authUtils.saveUser(testUser);
    const fetched = await authUtils.getUser(dynamicEmail);
    assert.ok(fetched);
    assert.equal(fetched.email, dynamicEmail);
    assert.equal(fetched.name, "Dynamic User");

    // Subsequent fetches should hit in-memory cache instantly
    const start = process.hrtime.bigint();
    for (let i = 0; i < 1000; i++) {
      await authUtils.getUser(dynamicEmail);
    }
    const durationMs = Number(process.hrtime.bigint() - start) / 1e6;

    // 1000 in-memory reads should complete in < 15ms
    assert.ok(durationMs < 15, `Expected < 15ms for 1000 cached reads, got ${durationMs}ms`);
  } finally {
    fs.writeFileSync(USERS_FILE, initialContent, "utf8");
  }
});
