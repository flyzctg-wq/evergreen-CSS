const { test, describe, before, after } = require("node:test");
const assert = require("node:assert");
const fs = require("node:fs");
const path = require("node:path");

const USERS_PATH = path.join(__dirname, "..", "server", "users.json");

describe("auth_utils user caching and lookup", () => {
  let backupContent = null;

  before(() => {
    if (fs.existsSync(USERS_PATH)) {
      backupContent = fs.readFileSync(USERS_PATH, "utf8");
    }
  });

  after(() => {
    if (backupContent !== null) {
      fs.writeFileSync(USERS_PATH, backupContent, "utf8");
    }
  });

  test("retrieves existing user from file cache", async () => {
    const authUtils = require("../api/auth_utils");
    const user = await authUtils.getUser("test@example.com");
    assert.ok(user, "User should be found");
    assert.strictEqual(user.email, "test@example.com");
  });

  test("subsequent get operations return correct cached data", async () => {
    const authUtils = require("../api/auth_utils");
    const user1 = await authUtils.getUser("test2@example.com");
    const user2 = await authUtils.getUser("test2@example.com");
    assert.strictEqual(user1.name, user2.name);
  });

  test("saveUser updates cache and file correctly", async () => {
    const authUtils = require("../api/auth_utils");
    const tempEmail = "bolt_perf_test@example.com";
    const testUser = {
      email: tempEmail,
      name: "Bolt Runner",
      passwordHash: authUtils.hashPassword("123456"),
      role: "standard",
      createdAt: Date.now()
    };

    const saved = await authUtils.saveUser(testUser);
    assert.strictEqual(saved, true);

    const retrieved = await authUtils.getUser(tempEmail);
    assert.ok(retrieved);
    assert.strictEqual(retrieved.name, "Bolt Runner");
  });
});
