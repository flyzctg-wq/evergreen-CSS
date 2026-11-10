const test = require("node:test");
const assert = require("node:assert");
const fs = require("node:fs");
const path = require("node:path");

const resetHandler = require("../api/auth/reset");
const authUtils = require("../api/auth_utils");

// Helper mock for Express/Serverless req and res objects
function createMockReqRes({ method = "POST", body = {}, headers = {} }) {
  const req = {
    method,
    body,
    headers: { host: "localhost:3847", ...headers }
  };

  let statusCode = 200;
  let headersSent = {};
  let jsonResponse = null;
  let ended = false;

  const res = {
    setHeader(key, value) {
      headersSent[key] = value;
      return res;
    },
    status(code) {
      statusCode = code;
      return res;
    },
    json(data) {
      jsonResponse = data;
      ended = true;
      return res;
    },
    end() {
      ended = true;
      return res;
    },
    getStatusCode: () => statusCode,
    getJSON: () => jsonResponse,
    isEnded: () => ended
  };

  return { req, res };
}

test("Password reset request does not leak reset token or debugResetUrl", async (t) => {
  // Backup users.json if it exists to prevent side-effects
  const dbPath = path.join(__dirname, "..", "server", "users.json");
  let originalUsers = null;
  if (fs.existsSync(dbPath)) {
    originalUsers = fs.readFileSync(dbPath, "utf8");
  }

  t.after(() => {
    if (originalUsers !== null) {
      fs.writeFileSync(dbPath, originalUsers, "utf8");
    }
  });

  const { req, res } = createMockReqRes({
    method: "POST",
    body: {
      action: "request",
      email: "test@example.com"
    }
  });

  await resetHandler(req, res);

  assert.strictEqual(res.getStatusCode(), 200);
  const data = res.getJSON();
  assert.ok(data);
  assert.strictEqual(data.success, true);
  assert.strictEqual(typeof data.message, "string");

  // Verify that neither debugResetUrl nor token is exposed in response payload
  assert.strictEqual(data.debugResetUrl, undefined, "debugResetUrl must NOT be leaked in the response");
  assert.strictEqual(data.token, undefined, "token must NOT be leaked in the response");
  assert.strictEqual(data.resetToken, undefined, "resetToken must NOT be leaked in the response");
  assert.strictEqual(data.resetUrl, undefined, "resetUrl must NOT be leaked in the response");
});
