const { test, describe } = require("node:test");
const assert = require("node:assert");
const authUtils = require("../api/auth_utils");

describe("auth_utils security and verification", () => {
  describe("verifyPassword", () => {
    test("validates correctly hashed password", () => {
      const password = "123456";
      const hash = authUtils.hashPassword(password);
      assert.strictEqual(authUtils.verifyPassword(password, hash), true);
    });

    test("rejects incorrect password", () => {
      const hash = authUtils.hashPassword("123456");
      assert.strictEqual(authUtils.verifyPassword("654321", hash), false);
    });

    test("handles malformed stored hashes gracefully", () => {
      assert.strictEqual(authUtils.verifyPassword("123456", "invalidhash"), false);
      assert.strictEqual(authUtils.verifyPassword("123456", null), false);
      assert.strictEqual(authUtils.verifyPassword("123456", ""), false);
      assert.strictEqual(authUtils.verifyPassword("123456", "salt:"), false);
    });
  });

  describe("verifyJWT", () => {
    test("verifies valid token", () => {
      const payload = { email: "scorer@example.com", role: "standard" };
      const token = authUtils.signJWT(payload, "secret-key", 60);
      const decoded = authUtils.verifyJWT(token, "secret-key");
      assert.ok(decoded);
      assert.strictEqual(decoded.email, "scorer@example.com");
      assert.strictEqual(decoded.role, "standard");
    });

    test("rejects token with wrong secret", () => {
      const token = authUtils.signJWT({ user: 1 }, "secret-key", 60);
      assert.strictEqual(authUtils.verifyJWT(token, "wrong-secret"), null);
    });

    test("rejects tampered token signature", () => {
      const token = authUtils.signJWT({ user: 1 }, "secret-key", 60);
      const parts = token.split(".");
      parts[2] = parts[2].slice(0, -2) + "xx";
      const tampered = parts.join(".");
      assert.strictEqual(authUtils.verifyJWT(tampered, "secret-key"), null);
    });

    test("rejects invalid or malformed tokens", () => {
      assert.strictEqual(authUtils.verifyJWT(null, "secret-key"), null);
      assert.strictEqual(authUtils.verifyJWT("", "secret-key"), null);
      assert.strictEqual(authUtils.verifyJWT("not.a.valid.jwt", "secret-key"), null);
      assert.strictEqual(authUtils.verifyJWT("part1.part2", "secret-key"), null);
    });
  });
});
