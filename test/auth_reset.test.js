const test = require("node:test");
const assert = require("node:assert");
const resetHandler = require("../api/auth/reset.js");
const authUtils = require("../api/auth_utils.js");

test("Password reset request does not leak debugResetUrl or tokens", async () => {
  // Save dummy user for testing
  await authUtils.saveUser({
    email: "testuser@example.com",
    name: "Test User",
    passwordHash: authUtils.hashPassword("123456"),
    role: "standard",
    createdAt: Date.now()
  });

  const req = {
    method: "POST",
    headers: { host: "localhost:3847" },
    body: {
      action: "request",
      email: "testuser@example.com"
    }
  };

  let responseData = null;
  let responseStatus = 200;

  const res = {
    setHeader: () => {},
    status: (code) => {
      responseStatus = code;
      return res;
    },
    json: (data) => {
      responseData = data;
      return res;
    },
    end: () => res
  };

  await resetHandler(req, res);

  assert.strictEqual(responseStatus, 200);
  assert.strictEqual(responseData.success, true);
  assert.strictEqual(responseData.debugResetUrl, undefined);
  assert.strictEqual(responseData.resetToken, undefined);
  assert.strictEqual(responseData.token, undefined);
});
