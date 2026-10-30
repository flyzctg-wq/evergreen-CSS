const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("fs");
const path = require("path");
const authUtils = require("../api/auth_utils");
const resetHandler = require("../api/auth/reset");

const LOCAL_DB_PATH = path.join(__dirname, "..", "server", "users.json");

test("Password Reset Security - request action should not expose reset token in response", async (t) => {
  const originalDbContent = fs.existsSync(LOCAL_DB_PATH) ? fs.readFileSync(LOCAL_DB_PATH, "utf8") : null;
  t.after(() => {
    if (originalDbContent !== null) {
      fs.writeFileSync(LOCAL_DB_PATH, originalDbContent, "utf8");
    }
  });

  // Setup a test user in memory/local store
  const testUser = {
    email: "security-test@example.com",
    name: "Security Tester",
    passwordHash: authUtils.hashPassword("123456"),
    role: "standard",
    createdAt: Date.now()
  };
  await authUtils.saveUser(testUser);

  // Mock req and res for existing user
  const req1 = {
    method: "POST",
    headers: { host: "localhost:3847" },
    body: { action: "request", email: "security-test@example.com" }
  };
  let responseData1 = null;
  const res1 = {
    headers: {},
    setHeader(k, v) { this.headers[k] = v; },
    json(data) { responseData1 = data; return this; },
    status(code) { this.statusCode = code; return this; }
  };

  await resetHandler(req1, res1);

  assert.strictEqual(responseData1.success, true);
  assert.strictEqual(responseData1.debugResetUrl, undefined, "debugResetUrl must NOT be leaked in the response");
  assert.strictEqual(responseData1.token, undefined, "reset token must NOT be leaked in the response");

  // Mock req and res for non-existing user
  const req2 = {
    method: "POST",
    headers: { host: "localhost:3847" },
    body: { action: "request", email: "nonexistent@example.com" }
  };
  let responseData2 = null;
  const res2 = {
    headers: {},
    setHeader(k, v) { this.headers[k] = v; },
    json(data) { responseData2 = data; return this; },
    status(code) { this.statusCode = code; return this; }
  };

  await resetHandler(req2, res2);

  assert.strictEqual(responseData2.success, true);
  assert.strictEqual(responseData2.debugResetUrl, undefined);
  assert.strictEqual(responseData2.token, undefined);
});

test("Password Reset Security - confirm action validates token and resets password", async (t) => {
  const originalDbContent = fs.existsSync(LOCAL_DB_PATH) ? fs.readFileSync(LOCAL_DB_PATH, "utf8") : null;
  t.after(() => {
    if (originalDbContent !== null) {
      fs.writeFileSync(LOCAL_DB_PATH, originalDbContent, "utf8");
    }
  });

  const testUser = {
    email: "security-confirm-test@example.com",
    name: "Security Confirm Tester",
    passwordHash: authUtils.hashPassword("123456"),
    role: "standard",
    createdAt: Date.now()
  };
  await authUtils.saveUser(testUser);

  const resetToken = authUtils.signJWT({ email: testUser.email }, authUtils.RESET_SECRET, 3600);

  // Confirm password reset
  const req = {
    method: "POST",
    headers: { host: "localhost:3847" },
    body: { action: "confirm", token: resetToken, newPassword: "654321" }
  };
  let responseData = null;
  const res = {
    headers: {},
    setHeader(k, v) { this.headers[k] = v; },
    json(data) { responseData = data; return this; },
    status(code) { this.statusCode = code; return this; }
  };

  await resetHandler(req, res);

  assert.strictEqual(responseData.success, true);

  const updatedUser = await authUtils.getUser("security-confirm-test@example.com");
  assert.strictEqual(authUtils.verifyPassword("654321", updatedUser.passwordHash), true);
  assert.strictEqual(authUtils.verifyPassword("123456", updatedUser.passwordHash), false);
});
