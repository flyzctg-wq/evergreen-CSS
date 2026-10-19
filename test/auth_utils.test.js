const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("fs");
const path = require("path");
const authUtils = require("../api/auth_utils");

const LOCAL_DB_PATH = path.join(__dirname, "..", "server", "users.json");

// Backup original users.json before running tests to prevent modifying seed data
let backupContent = null;

test.before(() => {
  if (fs.existsSync(LOCAL_DB_PATH)) {
    backupContent = fs.readFileSync(LOCAL_DB_PATH, "utf8");
  }
});

test.after(() => {
  if (backupContent !== null) {
    fs.writeFileSync(LOCAL_DB_PATH, backupContent, "utf8");
  } else if (fs.existsSync(LOCAL_DB_PATH)) {
    fs.unlinkSync(LOCAL_DB_PATH);
  }
});

test("authUtils - validatePassword", () => {
  assert.equal(authUtils.validatePassword("123456"), null);
  assert.match(authUtils.validatePassword("12345"), /exactly 6 digits/);
  assert.match(authUtils.validatePassword("abcdef"), /exactly 6 digits/);
});

test("authUtils - hashPassword & verifyPassword", () => {
  const hash = authUtils.hashPassword("123456");
  assert.equal(authUtils.verifyPassword("123456", hash), true);
  assert.equal(authUtils.verifyPassword("654321", hash), false);
});

test("authUtils - signJWT & verifyJWT", () => {
  const payload = { email: "test@example.com", name: "Tester" };
  const token = authUtils.signJWT(payload, authUtils.JWT_SECRET, 60);
  const decoded = authUtils.verifyJWT(token, authUtils.JWT_SECRET);
  assert.equal(decoded.email, "test@example.com");
  assert.equal(decoded.name, "Tester");
});

test("authUtils - saveUser & getUser with file mtime caching", async () => {
  const testUser = {
    email: "test_cache@example.com",
    name: "Cache Test User",
    passwordHash: authUtils.hashPassword("123456"),
    role: "standard"
  };

  const saved = await authUtils.saveUser(testUser);
  assert.equal(saved, true);

  const fetched = await authUtils.getUser("test_cache@example.com");
  assert.notEqual(fetched, null);
  assert.equal(fetched.email, "test_cache@example.com");

  // Subsequent call should hit cache and return user
  const cachedFetched = await authUtils.getUser("test_cache@example.com");
  assert.equal(cachedFetched.email, "test_cache@example.com");
});
