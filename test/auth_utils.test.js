const test = require("node:test");
const assert = require("node:assert/strict");
const authUtils = require("../api/auth_utils");

test("validatePassword requires exactly 6 digits", () => {
  assert.equal(authUtils.validatePassword(null), "Password must be a string.");
  assert.equal(authUtils.validatePassword("12345"), "Password must be exactly 6 digits.");
  assert.equal(authUtils.validatePassword("abcdef"), "Password must be exactly 6 digits.");
  assert.equal(authUtils.validatePassword("1234567"), "Password must be exactly 6 digits.");
  assert.equal(authUtils.validatePassword("123456"), null);
});

test("hashPassword and verifyPassword correctly hash and verify numeric passcodes", () => {
  const password = "654321";
  const hashed = authUtils.hashPassword(password);

  assert.notEqual(hashed, password);
  assert.ok(hashed.includes(":"));
  assert.equal(authUtils.verifyPassword("654321", hashed), true);
  assert.equal(authUtils.verifyPassword("123456", hashed), false);
});

test("signJWT and verifyJWT create and decode valid tokens", () => {
  const payload = { email: "test@example.com", role: "standard" };
  const token = authUtils.signJWT(payload, authUtils.JWT_SECRET, 300);

  assert.ok(typeof token === "string");
  const decoded = authUtils.verifyJWT(token, authUtils.JWT_SECRET);
  assert.equal(decoded.email, "test@example.com");
  assert.equal(decoded.role, "standard");
  assert.ok(decoded.exp);

  // Invalid secret check
  assert.equal(authUtils.verifyJWT(token, "wrong-secret"), null);
});

test("saveUser updates in-memory cache and getUser retrieves cached user", async () => {
  const fs = require("fs");
  const path = require("path");
  const usersJsonPath = path.join(__dirname, "..", "server", "users.json");
  const originalContent = fs.existsSync(usersJsonPath) ? fs.readFileSync(usersJsonPath, "utf8") : null;

  try {
    const testUser = {
      email: "bolt_test@example.com",
      name: "Bolt Test",
      passwordHash: authUtils.hashPassword("123456"),
      role: "standard",
      createdAt: Date.now()
    };

    const saved = await authUtils.saveUser(testUser);
    assert.equal(saved, true);

    const retrieved = await authUtils.getUser("bolt_test@example.com");
    assert.ok(retrieved);
    assert.equal(retrieved.email, "bolt_test@example.com");
    assert.equal(retrieved.name, "Bolt Test");

    // Case-insensitivity check
    const retrievedUpper = await authUtils.getUser("BOLT_TEST@EXAMPLE.COM");
    assert.ok(retrievedUpper);
    assert.equal(retrievedUpper.email, "bolt_test@example.com");
  } finally {
    // Restore server/users.json to original state so test runs don't pollute source control
    if (originalContent !== null) {
      fs.writeFileSync(usersJsonPath, originalContent, "utf8");
    }
  }
});
