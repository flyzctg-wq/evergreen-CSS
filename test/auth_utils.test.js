const test = require("node:test");
const assert = require("node:assert");
const fs = require("fs");
const path = require("path");
const authUtils = require("../api/auth_utils");

const LOCAL_DB_PATH = path.join(__dirname, "..", "server", "users.json");

test("getUser loads and caches user correctly", async () => {
  let originalData = null;
  if (fs.existsSync(LOCAL_DB_PATH)) {
    originalData = fs.readFileSync(LOCAL_DB_PATH, "utf8");
  }

  try {
    const testUser = {
      email: "test_cache@example.com",
      name: "Cache Tester",
      passwordHash: "salt:hash",
      role: "standard",
      createdAt: Date.now()
    };

    await authUtils.saveUser(testUser);

    // First fetch Populates Cache
    const user1 = await authUtils.getUser("test_cache@example.com");
    assert.strictEqual(user1.email, "test_cache@example.com");
    assert.strictEqual(user1.name, "Cache Tester");

    // Second fetch returns cached user object
    const user2 = await authUtils.getUser("test_cache@example.com");
    assert.strictEqual(user2.email, "test_cache@example.com");

    // Save new user via authUtils
    const newUser = {
      email: "test_cache_2@example.com",
      name: "Cache Tester 2",
      passwordHash: "salt:hash",
      role: "administrator",
      createdAt: Date.now()
    };
    await authUtils.saveUser(newUser);

    // Verification of new user after saveUser updates cache
    const user3 = await authUtils.getUser("test_cache_2@example.com");
    assert.strictEqual(user3.email, "test_cache_2@example.com");
    assert.strictEqual(user3.role, "administrator");
  } finally {
    if (originalData !== null) {
      fs.writeFileSync(LOCAL_DB_PATH, originalData, "utf8");
    } else if (fs.existsSync(LOCAL_DB_PATH)) {
      fs.unlinkSync(LOCAL_DB_PATH);
    }
    // Refresh cache state back to restored file state
    await authUtils.getUser("test@example.com");
  }
});
