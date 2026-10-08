const test = require("node:test");
const assert = require("node:assert/strict");
const authResetHandler = require("../api/auth/reset.js");
const authUtils = require("../api/auth_utils.js");

test("api/auth/reset does not expose debugResetUrl in password reset request response", async () => {
  // Mock user
  const mockUser = {
    email: "test@example.com",
    name: "Test User",
    passwordHash: authUtils.hashPassword("123456"),
    role: "standard"
  };
  await authUtils.saveUser(mockUser);

  let responseData = null;
  let statusCode = 200;

  const req = {
    method: "POST",
    headers: { host: "localhost:3847" },
    body: { action: "request", email: "test@example.com" }
  };

  const res = {
    setHeader: () => {},
    status: (code) => {
      statusCode = code;
      return res;
    },
    json: (data) => {
      responseData = data;
      return res;
    }
  };

  await authResetHandler(req, res);

  assert.equal(statusCode, 200);
  assert.equal(responseData.success, true);
  assert.equal(responseData.debugResetUrl, undefined, "debugResetUrl should not be exposed in HTTP response");
});
