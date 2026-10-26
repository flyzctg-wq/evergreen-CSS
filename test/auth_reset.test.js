const test = require("node:test");
const assert = require("node:assert");
const resetHandler = require("../api/auth/reset.js");

test("password reset request handler does not expose reset URL token in response", async () => {
  let jsonResult = null;
  const req = {
    method: "POST",
    headers: { host: "localhost:3847" },
    body: {
      action: "request",
      email: "test@example.com"
    }
  };

  const res = {
    headers: {},
    setHeader(key, value) {
      this.headers[key] = value;
    },
    status(statusCode) {
      this.statusCode = statusCode;
      return this;
    },
    json(obj) {
      jsonResult = obj;
      return obj;
    }
  };

  await resetHandler(req, res);

  assert.strictEqual(jsonResult.success, true);
  assert.strictEqual(typeof jsonResult.message, "string");
  assert.strictEqual(jsonResult.debugResetUrl, undefined, "debugResetUrl must not be exposed in API response");
});
