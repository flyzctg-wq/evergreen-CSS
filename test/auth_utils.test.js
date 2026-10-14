const test = require("node:test");
const assert = require("assert");
const fs = require("fs");
const path = require("path");
const authUtils = require("../api/auth_utils");

const LOCAL_DB_PATH = path.join(__dirname, "..", "server", "users.json");

test("authUtils: password validation", () => {
  assert.strictEqual(authUtils.validatePassword("123456"), null);
  assert.notStrictEqual(authUtils.validatePassword("12345"), null);
  assert.notStrictEqual(authUtils.validatePassword("abcdef"), null);
});

test("authUtils: password hashing and verification", () => {
  const password = "123456";
  const hash = authUtils.hashPassword(password);
  assert.strictEqual(authUtils.verifyPassword(password, hash), true);
  assert.strictEqual(authUtils.verifyPassword("654321", hash), false);
});

test("authUtils: JWT signing and verification", () => {
  const payload = { email: "test@example.com", name: "Tester", role: "standard" };
  const token = authUtils.signJWT(payload, authUtils.JWT_SECRET, 60);
  const verified = authUtils.verifyJWT(token, authUtils.JWT_SECRET);
  assert.ok(verified);
  assert.strictEqual(verified.email, "test@example.com");
  assert.strictEqual(verified.name, "Tester");
});

test("authUtils: user save and cached retrieval", async () => {
  const originalData = fs.existsSync(LOCAL_DB_PATH) ? fs.readFileSync(LOCAL_DB_PATH, "utf8") : null;
  try {
    const user = {
      email: `test_cache_${Date.now()}@example.com`,
      name: "Cache Test User",
      passwordHash: authUtils.hashPassword("123456"),
      role: "standard",
      createdAt: Date.now()
    };

    const saveResult = await authUtils.saveUser(user);
    assert.strictEqual(saveResult, true);

    // First fetch (caches file content)
    const fetched1 = await authUtils.getUser(user.email);
    assert.ok(fetched1);
    assert.strictEqual(fetched1.email, user.email);

    // Second fetch (should hit in-memory file cache)
    const fetched2 = await authUtils.getUser(user.email);
    assert.ok(fetched2);
    assert.strictEqual(fetched2.email, user.email);
  } finally {
    if (originalData !== null) {
      fs.writeFileSync(LOCAL_DB_PATH, originalData, "utf8");
    }
  }
});
