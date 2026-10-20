const { test, describe, after } = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const authUtils = require("../api/auth_utils");

const USERS_FILE = path.join(__dirname, "..", "server", "users.json");

describe("auth_utils performance and behavior tests", () => {
  let originalFileContent = null;

  try {
    if (fs.existsSync(USERS_FILE)) {
      originalFileContent = fs.readFileSync(USERS_FILE, "utf8");
    }
  } catch {}

  after(() => {
    // Restore original file content to prevent test pollution
    if (originalFileContent !== null) {
      fs.writeFileSync(USERS_FILE, originalFileContent, "utf8");
    }
  });

  test("validatePassword correctly checks password requirements", () => {
    assert.strictEqual(authUtils.validatePassword("123456"), null);
    assert.strictEqual(authUtils.validatePassword("12345"), "Password must be exactly 6 digits.");
    assert.strictEqual(authUtils.validatePassword("abcdef"), "Password must be exactly 6 digits.");
    assert.strictEqual(authUtils.validatePassword(null), "Password must be a string.");
  });

  test("hashPassword and verifyPassword work correctly", () => {
    const password = "654321";
    const hashed = authUtils.hashPassword(password);
    assert.ok(hashed.includes(":"));
    assert.strictEqual(authUtils.verifyPassword(password, hashed), true);
    assert.strictEqual(authUtils.verifyPassword("111111", hashed), false);
  });

  test("signJWT and verifyJWT handle base64url payload signing and verification", () => {
    const payload = { email: "unit-test@example.com", role: "standard" };
    const token = authUtils.signJWT(payload, authUtils.JWT_SECRET, 3600);

    assert.ok(typeof token === "string");
    assert.strictEqual(token.split(".").length, 3);

    const verified = authUtils.verifyJWT(token, authUtils.JWT_SECRET);
    assert.ok(verified);
    assert.strictEqual(verified.email, "unit-test@example.com");
    assert.strictEqual(verified.role, "standard");

    // Invalid secret verification fails
    assert.strictEqual(authUtils.verifyJWT(token, "wrong-secret"), null);

    // Tampered payload fails
    const parts = token.split(".");
    const tamperedToken = `${parts[0]}.invalidPayload.${parts[2]}`;
    assert.strictEqual(authUtils.verifyJWT(tamperedToken, authUtils.JWT_SECRET), null);
  });

  test("getUser and saveUser accurately fetch and persist user data with caching", async () => {
    const testEmail = "cache-test-" + Date.now() + "@example.com";
    const testUser = {
      email: testEmail,
      name: "Cache Tester",
      passwordHash: authUtils.hashPassword("123456"),
      role: "standard",
      createdAt: Date.now()
    };

    const saved = await authUtils.saveUser(testUser);
    assert.strictEqual(saved, true);

    const fetchedFirst = await authUtils.getUser(testEmail);
    assert.ok(fetchedFirst);
    assert.strictEqual(fetchedFirst.email, testEmail);

    // Second fetch should use cached mtime map fast path
    const fetchedSecond = await authUtils.getUser(testEmail);
    assert.ok(fetchedSecond);
    assert.strictEqual(fetchedSecond.email, testEmail);
  });
});
