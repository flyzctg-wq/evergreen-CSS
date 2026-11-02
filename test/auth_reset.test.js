const { test, after } = require("node:test");
const assert = require("node:assert");
const fs = require("node:fs");
const path = require("node:path");
const authUtils = require("../api/auth_utils");
const resetHandler = require("../api/auth/reset");

const LOCAL_DB_PATH = path.join(__dirname, "..", "server", "users.json");
const originalUsers = fs.existsSync(LOCAL_DB_PATH) ? fs.readFileSync(LOCAL_DB_PATH, "utf8") : "[]";

after(() => {
  fs.writeFileSync(LOCAL_DB_PATH, originalUsers, "utf8");
});

// Mock response object for testing serverless handler
function createMockRes() {
  return {
    statusCode: 200,
    headers: {},
    body: null,
    setHeader(key, value) {
      this.headers[key] = value;
    },
    status(code) {
      this.statusCode = code;
      return this;
    },
    json(data) {
      this.body = data;
      return this;
    },
    end() {
      return this;
    }
  };
}

test("Password reset request does not leak debugResetUrl or tokens", async () => {
  const email = "security-test@example.com";
  await authUtils.saveUser({
    email,
    name: "Security Tester",
    passwordHash: authUtils.hashPassword("123456"),
    role: "standard",
    createdAt: Date.now()
  });

  const req = {
    method: "POST",
    headers: { host: "localhost:3847" },
    body: { action: "request", email }
  };
  const res = createMockRes();

  await resetHandler(req, res);

  assert.strictEqual(res.statusCode, 200);
  assert.strictEqual(res.body.success, true);
  // Verify token and debugResetUrl are NOT leaked
  assert.strictEqual(res.body.debugResetUrl, undefined);
  assert.strictEqual(res.body.token, undefined);
  assert.strictEqual(res.body.resetToken, undefined);
});

test("Password reset confirmation functions with valid token", async () => {
  const email = "confirm-test@example.com";
  await authUtils.saveUser({
    email,
    name: "Confirm Tester",
    passwordHash: authUtils.hashPassword("123456"),
    role: "standard",
    createdAt: Date.now()
  });

  const validToken = authUtils.signJWT({ email }, authUtils.RESET_SECRET, 3600);
  const req = {
    method: "POST",
    headers: {},
    body: { action: "confirm", token: validToken, newPassword: "654321" }
  };
  const res = createMockRes();

  await resetHandler(req, res);

  assert.strictEqual(res.statusCode, 200);
  assert.strictEqual(res.body.success, true);

  const updatedUser = await authUtils.getUser(email);
  assert.strictEqual(authUtils.verifyPassword("654321", updatedUser.passwordHash), true);
});
