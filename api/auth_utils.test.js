const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const authUtils = require("./auth_utils.js");

const LOCAL_DB_PATH = path.join(__dirname, "..", "server", "users.json");

test("validatePassword checks 6-digit rule", () => {
  assert.equal(authUtils.validatePassword("123456"), null);
  assert.equal(authUtils.validatePassword("12345"), "Password must be exactly 6 digits.");
  assert.equal(authUtils.validatePassword("abcdef"), "Password must be exactly 6 digits.");
});

test("hashPassword and verifyPassword work correctly", () => {
  const pass = "654321";
  const hash = authUtils.hashPassword(pass);
  assert.ok(hash.includes(":"));
  assert.equal(authUtils.verifyPassword(pass, hash), true);
  assert.equal(authUtils.verifyPassword("000000", hash), false);
});

test("JWT signing and verification", () => {
  const payload = { email: "user@example.com", role: "standard" };
  const token = authUtils.signJWT(payload, authUtils.JWT_SECRET, 3600);
  assert.ok(typeof token === "string");

  const verified = authUtils.verifyJWT(token, authUtils.JWT_SECRET);
  assert.equal(verified.email, "user@example.com");
  assert.equal(verified.role, "standard");

  const invalidSecret = authUtils.verifyJWT(token, "wrong-secret");
  assert.equal(invalidSecret, null);
});

test("getUser and saveUser with in-memory cache", async (t) => {
  let originalData = null;
  if (fs.existsSync(LOCAL_DB_PATH)) {
    originalData = fs.readFileSync(LOCAL_DB_PATH, "utf8");
  }

  t.after(() => {
    if (originalData !== null) {
      fs.writeFileSync(LOCAL_DB_PATH, originalData, "utf8");
    }
  });

  const testUser = {
    email: "cached-user@example.com",
    name: "Cached User",
    passwordHash: authUtils.hashPassword("123456"),
    role: "standard",
    createdAt: Date.now()
  };

  await authUtils.saveUser(testUser);

  const fetched1 = await authUtils.getUser("cached-user@example.com");
  assert.ok(fetched1);
  assert.equal(fetched1.name, "Cached User");

  // Second fetch should use the cached users Map instantly
  const fetched2 = await authUtils.getUser("cached-user@example.com");
  assert.equal(fetched2.email, "cached-user@example.com");
});
