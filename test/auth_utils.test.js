const test = require("node:test");
const assert = require("node:assert");
const fs = require("node:fs");
const path = require("node:path");
const authUtils = require("../api/auth_utils");

const LOCAL_DB_PATH = path.join(__dirname, "..", "server", "users.json");

test("auth_utils - getUser and saveUser with file DB caching", async () => {
  const fileExisted = fs.existsSync(LOCAL_DB_PATH);
  let initialUsersContent = null;
  if (fileExisted) {
    initialUsersContent = fs.readFileSync(LOCAL_DB_PATH, "utf8");
  }

  try {
    const testUser = {
      email: "bolt_test@example.com",
      name: "Bolt Test",
      passwordHash: authUtils.hashPassword("123456"),
      role: "standard",
      createdAt: Date.now()
    };

    // Save user
    const saved = await authUtils.saveUser(testUser);
    assert.strictEqual(saved, true);

    // Retrieve user
    const fetched = await authUtils.getUser("bolt_test@example.com");
    assert.ok(fetched);
    assert.strictEqual(fetched.email, "bolt_test@example.com");
    assert.strictEqual(fetched.name, "Bolt Test");

    // Verify caching performance on multiple reads
    const start = performance.now();
    for (let i = 0; i < 100; i++) {
      const u = await authUtils.getUser("bolt_test@example.com");
      assert.strictEqual(u.email, "bolt_test@example.com");
    }
    const duration = performance.now() - start;
    assert.ok(duration < 100, `Expected 100 reads to be fast (took ${duration}ms)`);
  } finally {
    // Clean up test modifications to server/users.json
    if (fileExisted && initialUsersContent !== null) {
      fs.writeFileSync(LOCAL_DB_PATH, initialUsersContent, "utf8");
    } else if (fs.existsSync(LOCAL_DB_PATH)) {
      fs.unlinkSync(LOCAL_DB_PATH);
    }
  }
});
