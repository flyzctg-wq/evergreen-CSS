const test = require("node:test");
const assert = require("node:assert");
const resetHandler = require("../api/auth/reset");
const authUtils = require("../api/auth_utils");

test("password reset request does not leak reset token or debugResetUrl", async (t) => {
  // Mock response object
  function createMockResponse() {
    return {
      statusCode: 200,
      headers: {},
      jsonBody: null,
      setHeader(name, value) {
        this.headers[name] = value;
      },
      status(code) {
        this.statusCode = code;
        return this;
      },
      json(data) {
        this.jsonBody = data;
        return this;
      }
    };
  }

  // Create test user
  const testEmail = "sentinel_test@example.com";
  await authUtils.saveUser({
    email: testEmail,
    name: "Sentinel Tester",
    passwordHash: authUtils.hashPassword("123456"),
    role: "standard"
  });

  const req = {
    method: "POST",
    headers: { host: "localhost:3847" },
    body: { action: "request", email: testEmail }
  };
  const res = createMockResponse();

  await resetHandler(req, res);

  assert.strictEqual(res.statusCode, 200);
  assert.strictEqual(res.jsonBody.success, true);
  assert.strictEqual(res.jsonBody.debugResetUrl, undefined, "debugResetUrl must not be present in response");
  assert.strictEqual(res.jsonBody.token, undefined, "token must not be present in response");
});
