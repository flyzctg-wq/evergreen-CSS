const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const LOCAL_DB_PATH = path.join(__dirname, "..", "server", "users.json");

test("auth_utils - password validation & hashing", () => {
  const authUtils = require("../api/auth_utils");
  assert.equal(authUtils.validatePassword("123456"), null);
  assert.notEqual(authUtils.validatePassword("password"), null);

  const hash = authUtils.hashPassword("123456");
  assert.equal(authUtils.verifyPassword("123456", hash), true);
  assert.equal(authUtils.verifyPassword("654321", hash), false);
});

test("auth_utils - JWT signing and verification", () => {
  const authUtils = require("../api/auth_utils");
  const payload = { email: "test@example.com", name: "Tester", role: "standard" };
  const token = authUtils.signJWT(payload, authUtils.JWT_SECRET, 60);

  const verified = authUtils.verifyJWT(token, authUtils.JWT_SECRET);
  assert.equal(verified.email, "test@example.com");
  assert.equal(verified.name, "Tester");
  assert.equal(verified.role, "standard");

  const invalid = authUtils.verifyJWT(token, "wrong-secret");
  assert.equal(invalid, null);
});

test("auth_utils - user saving and cached retrieval without dirtying production users.json", async () => {
  const authUtils = require("../api/auth_utils");
  // Read existing content of users.json to restore after test
  const originalUsersContent = fs.existsSync(LOCAL_DB_PATH)
    ? fs.readFileSync(LOCAL_DB_PATH, "utf8")
    : null;

  try {
    const testUser = {
      email: "cachetest@example.com",
      name: "Cache Tester",
      passwordHash: authUtils.hashPassword("123456"),
      role: "standard",
      createdAt: Date.now()
    };

    const saveSuccess = await authUtils.saveUser(testUser);
    assert.equal(saveSuccess, true);

    // Retrieve user (populates file cache)
    const fetched1 = await authUtils.getUser("cachetest@example.com");
    assert.ok(fetched1);
    assert.equal(fetched1.name, "Cache Tester");

    // Retrieve user again (hits cache)
    const fetched2 = await authUtils.getUser("cachetest@example.com");
    assert.ok(fetched2);
    assert.equal(fetched2.name, "Cache Tester");
  } finally {
    // Restore original users.json file content
    if (originalUsersContent !== null) {
      fs.writeFileSync(LOCAL_DB_PATH, originalUsersContent, "utf8");
    }
  }
});
