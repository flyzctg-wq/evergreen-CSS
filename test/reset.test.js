const test = require("node:test");
const assert = require("node:assert/strict");
const authResetHandler = require("../api/auth/reset");
const authUtils = require("../api/auth_utils");

test("Password reset request should not expose debugResetUrl or tokens in response", async () => {
  // Mock user in authUtils memory
  const testUser = {
    email: "testuser@example.com",
    name: "Test User",
    passwordHash: authUtils.hashPassword("123456"),
    role: "standard",
    createdAt: Date.now()
  };
  await authUtils.saveUser(testUser);

  let responseData = null;
  let statusCode = 200;

  const req = {
    method: "POST",
    headers: { origin: "http://localhost", host: "localhost" },
    body: { action: "request", email: "testuser@example.com" }
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
    },
    end: () => res
  };

  await authResetHandler(req, res);

  assert.equal(statusCode, 200);
  assert.equal(responseData.success, true);
  assert.equal(responseData.debugResetUrl, undefined, "debugResetUrl should not be exposed in API response");
  assert.equal(typeof responseData.message, "string");
  assert.equal(Object.keys(responseData).includes("debugResetUrl"), false);
});
