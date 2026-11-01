const test = require("node:test");
const assert = require("node:assert/strict");
const authResetHandler = require("../api/auth/reset");
const authUtils = require("../api/auth_utils");

// Helper to mock response object for Vercel handler
function createMockRes() {
  return {
    statusCode: 200,
    headers: {},
    body: null,
    status(code) {
      this.statusCode = code;
      return this;
    },
    setHeader(key, value) {
      this.headers[key] = value;
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

test("Password reset request should not leak debugResetUrl or reset token in response", async () => {
  // Ensure test user exists in memory/db
  const testEmail = "test@example.com";
  const user = await authUtils.getUser(testEmail);
  assert.ok(user, "Test user should exist");

  const req = {
    method: "POST",
    headers: { origin: "http://localhost:3847", host: "localhost:3847" },
    body: {
      action: "request",
      email: testEmail
    }
  };

  const res = createMockRes();
  await authResetHandler(req, res);

  assert.equal(res.statusCode, 200);
  assert.equal(res.body.success, true);
  // Verify token/URL are not leaked in the payload
  assert.equal(res.body.debugResetUrl, undefined, "debugResetUrl must not be exposed");
  assert.equal(res.body.resetUrl, undefined, "resetUrl must not be exposed");
  assert.equal(res.body.token, undefined, "token must not be exposed");
});

test("Password reset confirm with valid token successfully updates password", async () => {
  const testEmail = "test@example.com";
  const userBefore = await authUtils.getUser(testEmail);
  const originalHash = userBefore.passwordHash;

  try {
    const resetToken = authUtils.signJWT({ email: testEmail }, authUtils.RESET_SECRET, 300);

    const req = {
      method: "POST",
      headers: { origin: "http://localhost:3847" },
      body: {
        action: "confirm",
        token: resetToken,
        newPassword: "654321"
      }
    };

    const res = createMockRes();
    await authResetHandler(req, res);

    assert.equal(res.statusCode, 200);
    assert.equal(res.body.success, true);

    // Verify the new password matches
    const updatedUser = await authUtils.getUser(testEmail);
    assert.ok(authUtils.verifyPassword("654321", updatedUser.passwordHash));
  } finally {
    // Restore original state
    userBefore.passwordHash = originalHash;
    await authUtils.saveUser(userBefore);
  }
});

test("Password reset confirm with invalid token is rejected", async () => {
  const req = {
    method: "POST",
    headers: { origin: "http://localhost:3847" },
    body: {
      action: "confirm",
      token: "invalid.jwt.token",
      newPassword: "654321"
    }
  };

  const res = createMockRes();
  await authResetHandler(req, res);

  assert.equal(res.statusCode, 400);
  assert.equal(res.body.error, "Invalid or expired recovery token.");
});
