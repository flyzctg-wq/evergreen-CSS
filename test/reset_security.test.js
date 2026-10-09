const test = require("node:test");
const assert = require("node:assert");
const resetHandler = require("../api/auth/reset");
const authUtils = require("../api/auth_utils");

test("Password reset request does NOT leak debugResetUrl or reset token in response", async () => {
  // Mock user
  const testUser = {
    email: "test_sentinel@example.com",
    name: "Sentinel User",
    passwordHash: authUtils.hashPassword("123456"),
    role: "standard"
  };
  await authUtils.saveUser(testUser);

  let responseStatusCode = null;
  let responseData = null;

  const req = {
    method: "POST",
    headers: { host: "localhost:3847" },
    body: {
      action: "request",
      email: "test_sentinel@example.com"
    }
  };

  const res = {
    setHeader: () => {},
    status: (code) => {
      responseStatusCode = code;
      return res;
    },
    json: (data) => {
      responseData = data;
      return res;
    }
  };

  await resetHandler(req, res);

  assert.strictEqual(responseData.success, true);
  assert.strictEqual(responseData.debugResetUrl, undefined, "debugResetUrl must NOT be present in response");
  assert.strictEqual(responseData.resetToken, undefined, "resetToken must NOT be present in response");
});
