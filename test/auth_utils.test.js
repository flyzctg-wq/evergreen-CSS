const test = require("node:test");
const assert = require("node:assert");
const fs = require("fs");
const path = require("path");
const authUtils = require("../api/auth_utils");

const LOCAL_DB_PATH = path.join(__dirname, "..", "server", "users.json");

test("validatePassword - checks 6 digit rule", () => {
  assert.strictEqual(authUtils.validatePassword("123456"), null);
  assert.notStrictEqual(authUtils.validatePassword("12345"), null);
  assert.notStrictEqual(authUtils.validatePassword("abcdef"), null);
  assert.notStrictEqual(authUtils.validatePassword(""), null);
});

test("hashPassword and verifyPassword", () => {
  const pwd = "123456";
  const hashed = authUtils.hashPassword(pwd);
  assert.strictEqual(authUtils.verifyPassword(pwd, hashed), true);
  assert.strictEqual(authUtils.verifyPassword("654321", hashed), false);
  assert.strictEqual(authUtils.verifyPassword(pwd, "invalid:hash"), false);
});

test("signJWT and verifyJWT using native base64url", () => {
  const payload = { email: "test@example.com", role: "administrator" };
  const token = authUtils.signJWT(payload, authUtils.JWT_SECRET, 60);

  assert.ok(token);
  assert.strictEqual(token.split(".").length, 3);

  const verified = authUtils.verifyJWT(token, authUtils.JWT_SECRET);
  assert.strictEqual(verified.email, payload.email);
  assert.strictEqual(verified.role, payload.role);
  assert.ok(verified.exp);

  // Invalid secret check
  assert.strictEqual(authUtils.verifyJWT(token, "wrong-secret"), null);
});

test("verifyJWT - handles expired tokens", () => {
  const payload = { email: "test@example.com" };
  // Expired 10 seconds ago
  const token = authUtils.signJWT(payload, authUtils.JWT_SECRET, -10);
  assert.strictEqual(authUtils.verifyJWT(token, authUtils.JWT_SECRET), null);
});

test("getUser and saveUser in-memory caching", async () => {
  // Preserve original content of users.json
  const originalUsersJson = fs.existsSync(LOCAL_DB_PATH) ? fs.readFileSync(LOCAL_DB_PATH, "utf8") : null;

  try {
    const user = {
      email: "cachetest@example.com",
      name: "Cache Tester",
      passwordHash: authUtils.hashPassword("123456"),
      role: "standard"
    };

    await authUtils.saveUser(user);

    const retrieved = await authUtils.getUser("cachetest@example.com");
    assert.deepStrictEqual(retrieved, user);

    // Case insensitive lookup
    const retrievedUpper = await authUtils.getUser("CACHETEST@EXAMPLE.COM");
    assert.deepStrictEqual(retrievedUpper, user);
  } finally {
    // Restore original users.json content after test execution
    if (originalUsersJson !== null) {
      fs.writeFileSync(LOCAL_DB_PATH, originalUsersJson, "utf8");
    }
  }
});
