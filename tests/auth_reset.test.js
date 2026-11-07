const test = require("node:test");
const assert = require("node:assert");
const fs = require("fs");
const path = require("path");

const resetHandler = require("../api/auth/reset");
const authUtils = require("../api/auth_utils");

test("Password reset request does not leak reset token or debug URL in response", async (t) => {
  // Backup users.json
  const usersPath = path.join(__dirname, "..", "server", "users.json");
  const usersBackup = fs.readFileSync(usersPath, "utf8");

  t.after(() => {
    // Restore users.json
    fs.writeFileSync(usersPath, usersBackup, "utf8");
  });

  const testEmail = "scorer@evergreen.com";

  let responseData = null;
  let statusCode = 200;

  const req = {
    method: "POST",
    headers: {
      origin: "http://localhost:3847",
      host: "localhost:3847"
    },
    body: {
      action: "request",
      email: testEmail
    }
  };

  const res = {
    statusCode: 200,
    headers: {},
    setHeader(name, val) {
      this.headers[name] = val;
    },
    status(code) {
      this.statusCode = code;
      return this;
    },
    json(data) {
      responseData = data;
      return this;
    },
    end() {
      return this;
    }
  };

  await resetHandler(req, res);

  assert.strictEqual(res.statusCode, 200);
  assert.strictEqual(responseData.success, true);
  assert.strictEqual(responseData.debugResetUrl, undefined, "debugResetUrl must not be present in response");
  assert.strictEqual(responseData.token, undefined, "token must not be present in response");
  assert.strictEqual(responseData.resetToken, undefined, "resetToken must not be present in response");
});
