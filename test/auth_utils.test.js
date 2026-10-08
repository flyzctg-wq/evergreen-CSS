const test = require("node:test");
const assert = require("node:assert/strict");
const path = require("path");
const fs = require("fs");
const authUtils = require("../api/auth_utils");

const USERS_FILE = path.join(__dirname, "..", "server", "users.json");
let originalUsersContent = null;

test.before(() => {
  if (fs.existsSync(USERS_FILE)) {
    originalUsersContent = fs.readFileSync(USERS_FILE, "utf8");
  }
});

test.after(() => {
  if (originalUsersContent !== null) {
    fs.writeFileSync(USERS_FILE, originalUsersContent, "utf8");
  } else if (fs.existsSync(USERS_FILE)) {
    fs.unlinkSync(USERS_FILE);
  }
});

test("hashPassword and verifyPassword work correctly", () => {
  const password = "123456";
  const hashed = authUtils.hashPassword(password);
  assert.equal(typeof hashed, "string");
  assert.ok(hashed.includes(":"));

  assert.equal(authUtils.verifyPassword(password, hashed), true);
  assert.equal(authUtils.verifyPassword("654321", hashed), false);
  assert.equal(authUtils.verifyPassword("invalid", hashed), false);
});

test("signJWT and verifyJWT work correctly", () => {
  const payload = { email: "test@example.com", role: "standard" };
  const token = authUtils.signJWT(payload, authUtils.JWT_SECRET, 3600);
  assert.equal(typeof token, "string");

  const decoded = authUtils.verifyJWT(token, authUtils.JWT_SECRET);
  assert.ok(decoded);
  assert.equal(decoded.email, "test@example.com");
  assert.equal(decoded.role, "standard");

  const invalid = authUtils.verifyJWT(token, "wrong-secret");
  assert.equal(invalid, null);
});

test("saveUser and getUser work correctly", async () => {
  const user = {
    email: "test_user_cache@example.com",
    name: "Test User",
    passwordHash: authUtils.hashPassword("123456"),
    role: "standard",
    createdAt: Date.now()
  };

  const saved = await authUtils.saveUser(user);
  assert.equal(saved, true);

  const retrieved = await authUtils.getUser("test_user_cache@example.com");
  assert.ok(retrieved);
  assert.equal(retrieved.email, "test_user_cache@example.com");
  assert.equal(retrieved.name, "Test User");

  const nonExistent = await authUtils.getUser("nonexistent_user_999@example.com");
  assert.equal(nonExistent, null);
});

test("cached getUser benchmark performance", async () => {
  const user = {
    email: "bench_user@example.com",
    name: "Bench User",
    passwordHash: authUtils.hashPassword("123456"),
    role: "standard",
    createdAt: Date.now()
  };
  await authUtils.saveUser(user);

  // Warm up cache
  await authUtils.getUser("bench_user@example.com");

  const iterations = 1000;
  const start = performance.now();
  for (let i = 0; i < iterations; i++) {
    await authUtils.getUser("bench_user@example.com");
  }
  const duration = performance.now() - start;
  // 1000 lookups should complete in under 500ms with in-memory stat-cached lookup
  assert.ok(duration < 500, `1000 lookups took ${duration}ms, expected < 500ms`);
});
