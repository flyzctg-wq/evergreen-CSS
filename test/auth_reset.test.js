const test = require("node:test");
const assert = require("assert");
const fs = require("fs");
const path = require("path");
const resetHandler = require("../api/auth/reset");
const authUtils = require("../api/auth_utils");

const LOCAL_DB_PATH = path.join(__dirname, "..", "server", "users.json");

test("Password reset request does not leak reset URL or token in response", async (t) => {
  let originalUsers = null;
  if (fs.existsSync(LOCAL_DB_PATH)) {
    originalUsers = fs.readFileSync(LOCAL_DB_PATH, "utf8");
  }

  t.after(() => {
    if (originalUsers !== null) {
      fs.writeFileSync(LOCAL_DB_PATH, originalUsers, "utf8");
    } else if (fs.existsSync(LOCAL_DB_PATH)) {
      fs.unlinkSync(LOCAL_DB_PATH);
    }
  });

  // Create test user
  const testEmail = "sentinel_test_user@example.com";
  await authUtils.saveUser({
    email: testEmail,
    name: "Sentinel Test User",
    passwordHash: authUtils.hashPassword("123456"),
    role: "standard",
    createdAt: Date.now()
  });

  // Mock res object
  let statusCode = 200;
  let responseData = null;
  const req = {
    method: "POST",
    headers: { host: "localhost:3847" },
    body: { action: "request", email: testEmail }
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

  await resetHandler(req, res);

  assert.strictEqual(statusCode, 200);
  assert.strictEqual(responseData.success, true);
  assert.strictEqual(responseData.debugResetUrl, undefined, "debugResetUrl must NOT be leaked in JSON response");
});
