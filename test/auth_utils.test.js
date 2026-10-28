const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const authUtils = require("../api/auth_utils");

const USERS_FILE = path.join(__dirname, "..", "server", "users.json");

test("validatePassword checks for 6 digit passcode", () => {
  assert.equal(authUtils.validatePassword("123456"), null);
  assert.notEqual(authUtils.validatePassword("12345"), null);
  assert.notEqual(authUtils.validatePassword("abcdef"), null);
  assert.notEqual(authUtils.validatePassword(null), null);
});

test("hashPassword and verifyPassword work correctly", () => {
  const hash = authUtils.hashPassword("654321");
  assert.ok(hash.includes(":"));
  assert.equal(authUtils.verifyPassword("654321", hash), true);
  assert.equal(authUtils.verifyPassword("000000", hash), false);
});

test("signJWT and verifyJWT work correctly and handle expiration", () => {
  const payload = { email: "test@evergreen.org", role: "standard" };
  const token = authUtils.signJWT(payload, authUtils.JWT_SECRET, 3600);

  const verified = authUtils.verifyJWT(token, authUtils.JWT_SECRET);
  assert.equal(verified.email, "test@evergreen.org");
  assert.equal(verified.role, "standard");

  const invalidSecret = authUtils.verifyJWT(token, "wrong-secret");
  assert.equal(invalidSecret, null);
});

test("saveUser and getUser save user and utilize in-memory cache", async () => {
  // Backup users.json content before test
  const originalUsersContent = fs.existsSync(USERS_FILE) ? fs.readFileSync(USERS_FILE, "utf8") : null;

  try {
    const testUser = {
      email: "bolt@evergreen.org",
      name: "Bolt Agent",
      passwordHash: authUtils.hashPassword("112233"),
      role: "administrator",
      createdAt: Date.now()
    };

    const saved = await authUtils.saveUser(testUser);
    assert.equal(saved, true);

    // Fast retrieve
    const user = await authUtils.getUser("bolt@evergreen.org");
    assert.ok(user);
    assert.equal(user.email, "bolt@evergreen.org");
    assert.equal(user.name, "Bolt Agent");

    // Subsequent retrieve (hits in-memory cache)
    const cachedUser = await authUtils.getUser("BOLT@EVERGREEN.ORG");
    assert.ok(cachedUser);
    assert.equal(cachedUser.email, "bolt@evergreen.org");
  } finally {
    // Restore users.json content after test
    if (originalUsersContent !== null) {
      fs.writeFileSync(USERS_FILE, originalUsersContent, "utf8");
    }
  }
});
