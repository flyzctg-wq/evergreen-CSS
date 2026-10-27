const { describe, it } = require("node:test");
const assert = require("node:assert/strict");
const authUtils = require("../api/auth_utils");

describe("auth_utils performance & functionality tests", () => {
  it("validates 6-digit passcode requirement", () => {
    assert.equal(authUtils.validatePassword("123456"), null);
    assert.notEqual(authUtils.validatePassword("short"), null);
    assert.notEqual(authUtils.validatePassword("abcdef"), null);
  });

  it("hashes and verifies passwords", () => {
    const hash = authUtils.hashPassword("654321");
    assert.ok(hash.includes(":"));
    assert.equal(authUtils.verifyPassword("654321", hash), true);
    assert.equal(authUtils.verifyPassword("000000", hash), false);
  });

  it("signs and verifies JWT tokens", () => {
    const payload = { email: "test@example.com", role: "standard" };
    const token = authUtils.signJWT(payload, authUtils.JWT_SECRET, 300);
    const verified = authUtils.verifyJWT(token, authUtils.JWT_SECRET);
    assert.ok(verified);
    assert.equal(verified.email, "test@example.com");
  });

  it("saves and retrieves users efficiently using cached storage", async () => {
    const testUser = {
      email: "bolt_test@example.com",
      name: "Bolt Test User",
      passwordHash: authUtils.hashPassword("112233"),
      role: "standard"
    };

    const saved = await authUtils.saveUser(testUser);
    assert.equal(saved, true);

    // Initial retrieval
    const retrieved1 = await authUtils.getUser("bolt_test@example.com");
    assert.ok(retrieved1);
    assert.equal(retrieved1.name, "Bolt Test User");

    // Second retrieval (should hit in-memory cache)
    const retrieved2 = await authUtils.getUser("bolt_test@example.com");
    assert.ok(retrieved2);
    assert.equal(retrieved2.email, "bolt_test@example.com");
  });
});
