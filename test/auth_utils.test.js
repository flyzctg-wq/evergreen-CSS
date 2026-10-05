const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("fs");
const path = require("path");
const authUtils = require("../api/auth_utils");

const DB_PATH = path.join(__dirname, "..", "server", "users.json");

let initialDbContent = null;

test.before(() => {
  if (fs.existsSync(DB_PATH)) {
    initialDbContent = fs.readFileSync(DB_PATH, "utf8");
  }
});

test.after(() => {
  if (initialDbContent !== null) {
    fs.writeFileSync(DB_PATH, initialDbContent, "utf8");
  }
});

test("getUser retrieves existing user", async () => {
  const user = await authUtils.getUser("test@example.com");
  assert.ok(user, "User should be found");
  assert.equal(user.email, "test@example.com");
  assert.equal(user.name, "Test Scorer");
});

test("getUser returns null for non-existent user", async () => {
  const user = await authUtils.getUser("nonexistent@example.com");
  assert.equal(user, null);
});

test("saveUser creates and retrieves new user", async () => {
  const testEmail = `newuser_${Date.now()}@example.com`;
  const passwordHash = authUtils.hashPassword("123456");
  const newUser = {
    email: testEmail,
    name: "New Scorer",
    passwordHash: passwordHash,
    role: "standard",
    createdAt: Date.now()
  };

  const saved = await authUtils.saveUser(newUser);
  assert.equal(saved, true);

  const retrieved = await authUtils.getUser(testEmail);
  assert.ok(retrieved, "Newly saved user should be retrievable");
  assert.equal(retrieved.email, testEmail);
  assert.equal(retrieved.name, "New Scorer");
  assert.equal(authUtils.verifyPassword("123456", retrieved.passwordHash), true);
});

test("JWT signing and verification", () => {
  const payload = { email: "test@example.com", role: "standard" };
  const token = authUtils.signJWT(payload, authUtils.JWT_SECRET, 3600);
  assert.ok(token);

  const verified = authUtils.verifyJWT(token, authUtils.JWT_SECRET);
  assert.ok(verified);
  assert.equal(verified.email, "test@example.com");
  assert.equal(verified.role, "standard");
});

test("validatePassword checks 6 digit requirement", () => {
  assert.equal(authUtils.validatePassword("123456"), null);
  assert.notEqual(authUtils.validatePassword("short"), null);
  assert.notEqual(authUtils.validatePassword("1234567"), null);
});
