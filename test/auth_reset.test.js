const test = require("node:test");
const assert = require("node:assert");
const resetHandler = require("../api/auth/reset");

test("Password reset request does not leak debugResetUrl", async () => {
  let jsonResponse = null;
  let statusCode = 200;

  const req = {
    method: "POST",
    headers: { origin: "http://localhost" },
    body: {
      action: "request",
      email: "testuser@example.com"
    }
  };

  const res = {
    setHeader: () => {},
    status: (code) => {
      statusCode = code;
      return res;
    },
    json: (data) => {
      jsonResponse = data;
      return res;
    },
    end: () => {}
  };

  await resetHandler(req, res);

  assert.strictEqual(statusCode, 200);
  assert.ok(jsonResponse, "Response should be returned");
  assert.strictEqual(jsonResponse.success, true);
  assert.strictEqual(
    jsonResponse.debugResetUrl,
    undefined,
    "debugResetUrl must not be exposed in response"
  );
});
