const test = require("node:test");
const assert = require("node:assert/strict");
const resetHandler = require("../api/auth/reset");
const authUtils = require("../api/auth_utils");

test("Password reset request does not leak debugResetUrl in response body", async () => {
  // Mock a user in system
  const testUser = {
    email: "security-test@evergreen.com",
    name: "Security Tester",
    passwordHash: authUtils.hashPassword("123456"),
    role: "standard"
  };
  await authUtils.saveUser(testUser);

  const req = {
    method: "POST",
    headers: { host: "localhost:3847" },
    body: {
      action: "request",
      email: "security-test@evergreen.com"
    }
  };

  let resHeaders = {};
  let resStatus = 200;
  let resData = null;

  const res = {
    setHeader(key, val) {
      resHeaders[key] = val;
    },
    status(code) {
      resStatus = code;
      return this;
    },
    json(data) {
      resData = data;
      return this;
    },
    end() {
      return this;
    }
  };

  await resetHandler(req, res);

  assert.equal(resStatus, 200);
  assert.equal(resData.success, true);
  assert.equal(typeof resData.message, "string");
  assert.equal(resData.debugResetUrl, undefined, "debugResetUrl must not be exposed in JSON response");
});
