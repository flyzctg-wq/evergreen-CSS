const test = require("node:test");
const assert = require("node:assert");
const fs = require("fs");
const path = require("path");
const authUtils = require("../api/auth_utils");

const LOCAL_DB_PATH = path.join(__dirname, "..", "server", "users.json");

test("validatePassword checks 6-digit passcode constraint", () => {
  assert.strictEqual(authUtils.validatePassword("123456"), null);
  assert.ok(authUtils.validatePassword("12345")); // too short
  assert.ok(authUtils.validatePassword("1234567")); // too long
  assert.ok(authUtils.validatePassword("abcdef")); // not digits
});

test("hashPassword and verifyPassword work correctly", () => {
  const password = "654321";
  const hash = authUtils.hashPassword(password);
  assert.ok(hash.includes(":"));
  assert.strictEqual(authUtils.verifyPassword(password, hash), true);
  assert.strictEqual(authUtils.verifyPassword("000000", hash), false);
});

test("signJWT and verifyJWT work correctly", () => {
  const payload = { email: "test@example.com", name: "Test User" };
  const token = authUtils.signJWT(payload, authUtils.JWT_SECRET, 60);
  const decoded = authUtils.verifyJWT(token, authUtils.JWT_SECRET);
  assert.strictEqual(decoded.email, payload.email);
  assert.strictEqual(decoded.name, payload.name);
  assert.ok(decoded.exp);
});

test("getUser and saveUser with mtime caching", async () => {
  const originalData = fs.existsSync(LOCAL_DB_PATH) ? fs.readFileSync(LOCAL_DB_PATH, "utf8") : null;

  try {
    // Retrieve existing user
    const user = await authUtils.getUser("test@example.com");
    assert.ok(user);
    assert.strictEqual(user.email, "test@example.com");

    // Subsequent call should use cache seamlessly
    const cachedUser = await authUtils.getUser("test@example.com");
    assert.strictEqual(cachedUser, user);

    // Save new user
    const newUser = {
      email: "bolt-cached-test@example.com",
      name: "Bolt Tester",
      passwordHash: authUtils.hashPassword("112233"),
      role: "standard",
      createdAt: Date.now()
    };

    const saved = await authUtils.saveUser(newUser);
    assert.strictEqual(saved, true);

    // Retrieve new user from cache/file
    const retrieved = await authUtils.getUser("bolt-cached-test@example.com");
    assert.ok(retrieved);
    assert.strictEqual(retrieved.email, "bolt-cached-test@example.com");
    assert.strictEqual(retrieved.name, "Bolt Tester");
  } finally {
    // Restore original users.json content
    if (originalData !== null) {
      fs.writeFileSync(LOCAL_DB_PATH, originalData, "utf8");
    }
  }
});
